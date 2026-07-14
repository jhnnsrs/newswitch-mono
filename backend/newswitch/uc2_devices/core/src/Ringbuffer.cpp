// ===========================================================================
//  Ringbuffer.cpp — implementation of the single-writer / multi-reader frame
//  ring buffer declared in include/Ringbuffer.hpp. See that header for the
//  design rationale.
// ===========================================================================

#include "Ringbuffer.hpp"

#include <algorithm>
#include <chrono>
#include <cstring>
#include <stdexcept>

#if defined(__ARM_NEON) || defined(__ARM_NEON__)
#include <arm_neon.h>
#define UC2_HAVE_NEON 1
#endif

namespace uc2 {

// ---------------------------------------------------------------------------
//  Translation-unit-local helpers (norm + de-interleave). Not part of the
//  public interface, so they live here rather than in the header.
// ---------------------------------------------------------------------------
namespace {

uint64_t nowNs()
{
    return static_cast<uint64_t>(
        std::chrono::duration_cast<std::chrono::nanoseconds>(
            std::chrono::steady_clock::now().time_since_epoch())
            .count());
}

/// Compute one norm over a strided sequence of `n` samples of type T.
/// `stride` is in elements (1 for planar data, `channels` for interleaved).
template <typename T>
float channelNormT(const T* p, size_t n, size_t stride, ImageNorm norm)
{
    if (n == 0)
        return -1.0f;

    switch (norm)
    {
    case ImageNorm::Max:
    {
        T m = p[0];
        for (size_t i = 1; i < n; ++i)
            m = std::max(m, p[i * stride]);
        return static_cast<float>(m);
    }
    case ImageNorm::Min:
    {
        T m = p[0];
        for (size_t i = 1; i < n; ++i)
            m = std::min(m, p[i * stride]);
        return static_cast<float>(m);
    }
    case ImageNorm::Mean:
    {
        double s = 0.0;
        for (size_t i = 0; i < n; ++i)
            s += static_cast<double>(p[i * stride]);
        return static_cast<float>(s / static_cast<double>(n));
    }
    case ImageNorm::Variance:
    {
        // Welford: single pass, numerically stable.
        double mean = 0.0, m2 = 0.0;
        size_t count = 0;
        for (size_t i = 0; i < n; ++i)
        {
            ++count;
            double x = static_cast<double>(p[i * stride]);
            double d = x - mean;
            mean += d / static_cast<double>(count);
            m2 += d * (x - mean);
        }
        return static_cast<float>(m2 / static_cast<double>(n));
    }
    case ImageNorm::Median:
    {
        // Correct for any T. For 8/16-bit data a histogram would avoid the
        // copy+sort; left as an optimisation (see design notes).
        std::vector<T> tmp(n);
        for (size_t i = 0; i < n; ++i)
            tmp[i] = p[i * stride];
        std::nth_element(tmp.begin(), tmp.begin() + n / 2, tmp.end());
        return static_cast<float>(tmp[n / 2]);
    }
    default:
        return -1.0f;
    }
}

/// Generic, correct, cache-blocked de-interleave (interleaved -> planar).
void deinterleaveGeneric(const uint8_t* src, uint8_t* dst,
                         size_t pixels, size_t channels, size_t elemSize)
{
    for (size_t c = 0; c < channels; ++c)
    {
        uint8_t*       out  = dst + c * pixels * elemSize;
        const uint8_t* in   = src + c * elemSize;
        const size_t   step = channels * elemSize;
        for (size_t i = 0; i < pixels; ++i)
            std::memcpy(out + i * elemSize, in + i * step, elemSize);
    }
}

/// De-interleave `channels` planes of `pixels` samples each. On ARM the uint8
/// 3/4-channel cases use the NEON vldN de-interleave, the fastest known
/// primitive for this rearrangement; everything else falls back to the generic
/// version above.
void deinterleave(const uint8_t* src, uint8_t* dst,
                  size_t pixels, size_t channels, size_t elemSize)
{
#ifdef UC2_HAVE_NEON
    if (elemSize == 1 && channels == 3)
    {
        uint8_t* c0 = dst;
        uint8_t* c1 = dst + pixels;
        uint8_t* c2 = dst + 2 * pixels;
        size_t   i  = 0;
        for (; i + 16 <= pixels; i += 16)
        {
            uint8x16x3_t v = vld3q_u8(src + i * 3);
            vst1q_u8(c0 + i, v.val[0]);
            vst1q_u8(c1 + i, v.val[1]);
            vst1q_u8(c2 + i, v.val[2]);
        }
        for (; i < pixels; ++i)
        {
            c0[i] = src[i * 3 + 0];
            c1[i] = src[i * 3 + 1];
            c2[i] = src[i * 3 + 2];
        }
        return;
    }
    if (elemSize == 1 && channels == 4)
    {
        uint8_t* c0 = dst;
        uint8_t* c1 = dst + pixels;
        uint8_t* c2 = dst + 2 * pixels;
        uint8_t* c3 = dst + 3 * pixels;
        size_t   i  = 0;
        for (; i + 16 <= pixels; i += 16)
        {
            uint8x16x4_t v = vld4q_u8(src + i * 4);
            vst1q_u8(c0 + i, v.val[0]);
            vst1q_u8(c1 + i, v.val[1]);
            vst1q_u8(c2 + i, v.val[2]);
            vst1q_u8(c3 + i, v.val[3]);
        }
        for (; i < pixels; ++i)
        {
            c0[i] = src[i * 4 + 0];
            c1[i] = src[i * 4 + 1];
            c2[i] = src[i * 4 + 2];
            c3[i] = src[i * 4 + 3];
        }
        return;
    }
#endif
    deinterleaveGeneric(src, dst, pixels, channels, elemSize);
}

} // namespace

// ---------------------------------------------------------------------------
//  Construction / destruction
// ---------------------------------------------------------------------------
RingBuffer::RingBuffer(const RingBufferConfig& cfg)
    : mCfg(cfg)
{
    if (mCfg.bufferSize == 0)
        throw std::invalid_argument("RingBuffer: bufferSize must be > 0");
    if (mCfg.roi.width == 0 || mCfg.roi.height == 0)
        throw std::invalid_argument("RingBuffer: ROI width/height must be > 0");
    if (mCfg.channelCount == 0)
        throw std::invalid_argument("RingBuffer: channelCount must be > 0");
    if (!(mCfg.byteSize == 1 || mCfg.byteSize == 2 ||
          mCfg.byteSize == 4 || mCfg.byteSize == 8))
        throw std::invalid_argument("RingBuffer: byteSize must be 1,2,4 or 8");

    mPixels     = static_cast<size_t>(mCfg.roi.width) * mCfg.roi.height;
    mFrameBytes = mPixels * mCfg.channelCount * mCfg.byteSize;

    mImage.assign(static_cast<size_t>(mCfg.bufferSize) * mFrameBytes, 0);
    mMeta.assign(mCfg.bufferSize, FrameMetaData{});
    mNorms.assign(static_cast<size_t>(mCfg.bufferSize) * mCfg.channelCount, -1.0f);

    // Slots start Ready (zero-filled) as required by the spec.
    mStates.reset(new std::atomic<FrameState>[mCfg.bufferSize]);
    for (uint32_t i = 0; i < mCfg.bufferSize; ++i)
        mStates[i].store(FrameState::Ready, std::memory_order_relaxed);

    mSavingEnabled = !mCfg.saveFilePath.empty() && mCfg.saveFileChunkSize > 0;

    start();
}

RingBuffer::~RingBuffer()
{
    stop();
}

// ---------------------------------------------------------------------------
//  Producer API
// ---------------------------------------------------------------------------
bool RingBuffer::writeToBuffer(const uint8_t* src,
                               uint32_t srcWidth,
                               uint32_t srcHeight,
                               uint32_t srcChannels,
                               uint32_t srcByteSize,
                               uint64_t frameNumber)
{
    if (src == nullptr)
        return false;
    if (srcChannels != mCfg.channelCount || srcByteSize != mCfg.byteSize)
        return false;
    // ROI must lie fully inside the incoming image.
    if (static_cast<uint64_t>(mCfg.roi.colOffset) + mCfg.roi.width  > srcWidth ||
        static_cast<uint64_t>(mCfg.roi.rowOffset) + mCfg.roi.height > srcHeight)
        return false;

    const uint32_t idx = acquireWriteSlot();
    if (idx == kInvalid)
        return false; // Jump strategy could not find a free slot

    const uint64_t tStart = nowNs();

    // Row-wise crop copy. Each destination row is contiguous; each source row is
    // contiguous too, we just skip colOffset and the trailing columns.
    const size_t elem        = mCfg.byteSize;
    const size_t dstRowBytes = static_cast<size_t>(mCfg.roi.width) * srcChannels * elem;
    const size_t srcRowBytes = static_cast<size_t>(srcWidth) * srcChannels * elem;
    const size_t colSkip     = static_cast<size_t>(mCfg.roi.colOffset) * srcChannels * elem;
    uint8_t*     dst         = imageSlot(idx);

    if (mCfg.roi.rowOffset == 0 && mCfg.roi.colOffset == 0 &&
        mCfg.roi.width == srcWidth && mCfg.roi.height == srcHeight)
    {
        // Full-frame fast path: a single contiguous memcpy.
        std::memcpy(dst, src, mFrameBytes);
    }
    else
    {
        const uint8_t* srcRow =
            src + static_cast<size_t>(mCfg.roi.rowOffset) * srcRowBytes + colSkip;
        for (uint32_t r = 0; r < mCfg.roi.height; ++r)
        {
            std::memcpy(dst + r * dstRowBytes, srcRow, dstRowBytes);
            srcRow += srcRowBytes;
        }
    }

    // Fill metadata; reset norms for this slot.
    FrameMetaData& m   = mMeta[idx];
    m.frameCount       = frameNumber;
    m.timeStampOnStart = tStart;
    m.timeStampOnStop  = nowNs();
    m.valid            = true;
    for (uint32_t c = 0; c < mCfg.channelCount; ++c)
        mNorms[static_cast<size_t>(idx) * mCfg.channelCount + c] = -1.0f;

    // Hand off to the worker (norm / rearrange / save). If there is nothing to
    // post-process, publish as Ready immediately.
    if (mCfg.rearrangeChannels || mCfg.imageNorm != ImageNorm::None || mSavingEnabled)
    {
        mStates[idx].store(FrameState::Postprocessing, std::memory_order_release);
        {
            std::lock_guard<std::mutex> lk(mWorkMx);
            mWorkQueue.push_back(idx);
        }
        mWorkCv.notify_one();
    }
    else
    {
        publishReady(idx);
    }
    return true;
}

// ---------------------------------------------------------------------------
//  Reader API
// ---------------------------------------------------------------------------
FrameView RingBuffer::read(uint32_t index)
{
    FrameView v;
    if (index >= mCfg.bufferSize)
        return v;

    // Take exclusive read ownership: Ready -> Reading.
    FrameState expected = FrameState::Ready;
    if (!mStates[index].compare_exchange_strong(
            expected, FrameState::Reading,
            std::memory_order_acquire, std::memory_order_relaxed))
    {
        return v; // Writing / Postprocessing / already Reading => blocked
    }

    v.data.resize(mFrameBytes);
    std::memcpy(v.data.data(), imageSlot(index), mFrameBytes);
    v.width    = mCfg.roi.width;
    v.height   = mCfg.roi.height;
    v.channels = mCfg.channelCount;
    v.byteSize = mCfg.byteSize;
    v.planar   = mCfg.rearrangeChannels;
    v.frameCount       = mMeta[index].frameCount;
    v.timeStampOnStart = mMeta[index].timeStampOnStart;
    v.timeStampOnStop  = mMeta[index].timeStampOnStop;
    v.valid    = true;

    mStates[index].store(FrameState::Ready, std::memory_order_release);
    return v;
}

FrameView RingBuffer::readLastReady()
{
    int64_t idx = mLastReadyIndex.load(std::memory_order_acquire);
    if (idx < 0)
        return FrameView{};
    return read(static_cast<uint32_t>(idx));
}

FrameMetaData RingBuffer::readMetaData(uint32_t index)
{
    FrameMetaData out;
    if (index >= mCfg.bufferSize)
        return out;

    // Take the same brief exclusive lock as read() (Ready -> Reading -> Ready)
    // so the producer cannot reuse the slot while we copy its metadata out.
    FrameState expected = FrameState::Ready;
    if (!mStates[index].compare_exchange_strong(
            expected, FrameState::Reading,
            std::memory_order_acquire, std::memory_order_relaxed))
    {
        return out; // Writing / Postprocessing / already Reading => blocked
    }

    out.frameCount       = mMeta[index].frameCount;
    out.timeStampOnStart = mMeta[index].timeStampOnStart;
    out.timeStampOnStop  = mMeta[index].timeStampOnStop;
    out.imageNorm.assign(
        mNorms.begin() + static_cast<size_t>(index) * mCfg.channelCount,
        mNorms.begin() + static_cast<size_t>(index + 1) * mCfg.channelCount);
    out.valid = true;

    mStates[index].store(FrameState::Ready, std::memory_order_release);
    return out;
}

FrameMetaData RingBuffer::readMetaDataLastReady()
{
    int64_t idx = mLastReadyIndex.load(std::memory_order_acquire);
    if (idx < 0)
        return FrameMetaData{};
    return readMetaData(static_cast<uint32_t>(idx));
}

// ---------------------------------------------------------------------------
//  Worker lifecycle
// ---------------------------------------------------------------------------
void RingBuffer::start()
{
    if (mRunning.exchange(true))
        return;
    mWorker = std::thread([this] { workerLoop(); });
}

void RingBuffer::stop()
{
    if (!mRunning.exchange(false))
        return;
    mWorkCv.notify_all();
    if (mWorker.joinable())
        mWorker.join();
    flushChunk(); // write out any tail frames
    if (mSaveStream.is_open())
        mSaveStream.close();
}

// ---------------------------------------------------------------------------
//  Internals
// ---------------------------------------------------------------------------
uint8_t* RingBuffer::imageSlot(uint32_t idx)
{
    return mImage.data() + static_cast<size_t>(idx) * mFrameBytes;
}

uint32_t RingBuffer::acquireWriteSlot()
{
    uint32_t idx     = mWriteIndex;
    uint32_t scanned = 0;
    for (;;)
    {
        FrameState expected = mStates[idx].load(std::memory_order_acquire);
        if (expected == FrameState::Ready)
        {
            if (mStates[idx].compare_exchange_strong(
                    expected, FrameState::Writing,
                    std::memory_order_acquire, std::memory_order_relaxed))
            {
                mWriteIndex = (idx + 1) % mCfg.bufferSize;
                return idx;
            }
            continue; // lost the race, re-read this slot
        }

        // Slot blocked (Reading / Postprocessing / Writing-shouldn't-happen).
        if (mCfg.strategyIfFrameIsBlocked == BlockedStrategy::Wait)
        {
            std::this_thread::yield();
            continue;
        }
        // Jump: try the next slot; give up after one full sweep.
        idx = (idx + 1) % mCfg.bufferSize;
        if (++scanned >= mCfg.bufferSize)
            return kInvalid;
    }
}

void RingBuffer::publishReady(uint32_t idx)
{
    mStates[idx].store(FrameState::Ready, std::memory_order_release);
    mLastReadyIndex.store(static_cast<int64_t>(idx), std::memory_order_release);
}

void RingBuffer::workerLoop()
{
    std::vector<uint8_t> scratch(mFrameBytes);
    for (;;)
    {
        uint32_t idx;
        {
            std::unique_lock<std::mutex> lk(mWorkMx);
            mWorkCv.wait(lk, [this] { return !mRunning.load() || !mWorkQueue.empty(); });
            if (!mRunning.load() && mWorkQueue.empty())
                return;
            idx = mWorkQueue.front();
            mWorkQueue.pop_front();
        }
        processFrame(idx, scratch);
    }
}

void RingBuffer::processFrame(uint32_t idx, std::vector<uint8_t>& scratch)
{
    uint8_t*   frame  = imageSlot(idx);
    const bool planar = mCfg.rearrangeChannels && mCfg.channelCount > 1;

    if (planar)
    {
        deinterleave(frame, scratch.data(), mPixels, mCfg.channelCount, mCfg.byteSize);
        std::memcpy(frame, scratch.data(), mFrameBytes);
    }

    if (mCfg.imageNorm != ImageNorm::None)
    {
        for (uint32_t c = 0; c < mCfg.channelCount; ++c)
            mNorms[static_cast<size_t>(idx) * mCfg.channelCount + c] =
                computeNormForChannel(frame, c, planar);
    }

    // Snapshot the frame for disk saving *now*, while it is still in the
    // Postprocessing state and therefore ours alone. Deferring the raw slot read
    // to flush time would race a writer that has lapped the buffer.
    if (mSavingEnabled)
    {
        serializeFrameInto(idx, planar, mPendingBytes);
        ++mPendingCount;
    }

    publishReady(idx);

    if (mSavingEnabled && mPendingCount >= mCfg.saveFileChunkSize)
        flushChunk();
}

float RingBuffer::computeNormForChannel(const uint8_t* frame, uint32_t channel, bool planar)
{
    const size_t stride     = planar ? 1 : mCfg.channelCount;
    const size_t offsetElem = planar ? static_cast<size_t>(channel) * mPixels : channel;
    switch (mCfg.byteSize)
    {
    case 1:
        return channelNormT<uint8_t>(
            reinterpret_cast<const uint8_t*>(frame) + offsetElem, mPixels, stride, mCfg.imageNorm);
    case 2:
        return channelNormT<uint16_t>(
            reinterpret_cast<const uint16_t*>(frame) + offsetElem, mPixels, stride, mCfg.imageNorm);
    case 4:
        return channelNormT<uint32_t>(
            reinterpret_cast<const uint32_t*>(frame) + offsetElem, mPixels, stride, mCfg.imageNorm);
    case 8:
        return channelNormT<uint64_t>(
            reinterpret_cast<const uint64_t*>(frame) + offsetElem, mPixels, stride, mCfg.imageNorm);
    default:
        return -1.0f;
    }
}

// ---------------------------------------------------------------------------
//  Disk saving (worker thread only)
// ---------------------------------------------------------------------------
void RingBuffer::openSaveStreamIfNeeded()
{
    if (mSaveStream.is_open())
        return;
    mSaveStream.open(mCfg.saveFilePath, std::ios::binary | std::ios::trunc);
    if (!mSaveStream.is_open())
    {
        mSavingEnabled = false; // give up silently; do not crash the pipeline
        return;
    }
    FileGlobalHeader gh;
    gh.bufferSize        = mCfg.bufferSize;
    gh.byteSize          = mCfg.byteSize;
    gh.channelCount      = mCfg.channelCount;
    gh.roiRowOffset      = mCfg.roi.rowOffset;
    gh.roiColOffset      = mCfg.roi.colOffset;
    gh.roiHeight         = mCfg.roi.height;
    gh.roiWidth          = mCfg.roi.width;
    gh.rearrangeChannels = mCfg.rearrangeChannels ? 1 : 0;
    gh.imageNorm         = static_cast<uint8_t>(mCfg.imageNorm);
    gh.chunkSize         = mCfg.saveFileChunkSize;
    std::memset(gh.name, 0, sizeof(gh.name));
    std::strncpy(gh.name, mCfg.name.c_str(), sizeof(gh.name) - 1);
    mSaveStream.write(reinterpret_cast<const char*>(&gh), sizeof(gh));
}

void RingBuffer::serializeFrameInto(uint32_t idx, bool planar, std::vector<uint8_t>& buf)
{
    FileFrameHeader fh;
    fh.frameCount       = mMeta[idx].frameCount;
    fh.timeStampOnStart = mMeta[idx].timeStampOnStart;
    fh.timeStampOnStop  = mMeta[idx].timeStampOnStop;
    fh.channels         = mCfg.channelCount;
    fh.planar           = planar ? 1u : 0u;

    const uint8_t* hp = reinterpret_cast<const uint8_t*>(&fh);
    buf.insert(buf.end(), hp, hp + sizeof(fh));

    const uint8_t* np =
        reinterpret_cast<const uint8_t*>(&mNorms[static_cast<size_t>(idx) * mCfg.channelCount]);
    buf.insert(buf.end(), np, np + mCfg.channelCount * sizeof(float));

    const uint8_t* ip = imageSlot(idx);
    buf.insert(buf.end(), ip, ip + mFrameBytes);
}

void RingBuffer::flushChunk()
{
    if (!mSavingEnabled || mPendingBytes.empty())
    {
        mPendingBytes.clear();
        mPendingCount = 0;
        return;
    }
    openSaveStreamIfNeeded();
    if (mSaveStream.is_open())
    {
        mSaveStream.write(reinterpret_cast<const char*>(mPendingBytes.data()),
                          static_cast<std::streamsize>(mPendingBytes.size()));
        mSaveStream.flush();
    }
    mPendingBytes.clear();
    mPendingCount = 0;
}

} // namespace uc2
