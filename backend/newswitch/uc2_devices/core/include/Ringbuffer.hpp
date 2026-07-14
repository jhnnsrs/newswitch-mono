#pragma once

// ===========================================================================
//  Ringbuffer.hpp — single-writer / multi-reader frame ring buffer (interface).
//
//  Implementation lives in core/src/Ringbuffer.cpp; this header only declares
//  the public types and the class. Design rationale (kept next to the code it
//  explains):
//
//    * NON-NESTED: a flat array of frame slots, no blocks. One slot == one
//      frame (header + image data).
//
//    * WRITE PATH IS SACRED: writeToBuffer() only validates the ROI and does a
//      (row-wise) memcpy. No channel de-interleave, no norm, no disk I/O on the
//      producer thread — those would fight the camera for the exact resource we
//      are protecting (memory bandwidth on the Pi 5). Everything expensive runs
//      on a lower-priority worker thread once the frame is committed.
//
//    * POST-PROCESSING WORKER: after the producer commits a frame it is handed
//      to a worker thread which (optionally) de-interleaves channels, computes
//      the per-channel image norm and streams full chunks to disk. While the
//      worker owns a frame it is in the Postprocessing state, so it is NOT yet
//      readable, but the producer can already write the next frame.
//
//    * THREAD-SAFE: every slot carries a std::atomic<FrameState>. Producer,
//      worker and readers cooperate purely through per-slot CAS transitions
//      plus one atomic "last ready" index. No global lock on the hot path.
//
//  The buffer is deliberately independent of the camera SDK: it only needs the
//  C++ standard library (+ optional NEON for the de-interleave fast path), so it
//  can be unit-tested and reused on any platform.
// ===========================================================================

#include <atomic>
#include <condition_variable>
#include <cstdint>
#include <deque>
#include <fstream>
#include <memory>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

namespace uc2 {

// ---------------------------------------------------------------------------
//  Enums / small value types
// ---------------------------------------------------------------------------

/// Life-cycle state of a single frame slot.
///
/// Spec lists Writing / Ready / Reading; we add Postprocessing so the producer
/// can advance while the worker is still computing the norm / de-interleaving /
/// queuing the frame for disk (the spec explicitly asks for exactly that
/// behaviour). Unwritten slots start in Ready (they are zero-filled), matching
/// the requirement that never-written frames count as Ready.
enum class FrameState : uint8_t
{
    Writing,        ///< producer owns the slot, do not touch
    Postprocessing, ///< committed; worker computing norm / rearranging / saving
    Ready,          ///< fully available for reading
    Reading         ///< a reader is copying the slot out
};

/// Which per-channel reduction to compute on each recorded frame.
enum class ImageNorm : uint8_t
{
    None,
    Variance,
    Max,
    Min,
    Mean,
    Median
};

/// What the producer does when the target slot is currently blocked (being read
/// or still owned by the worker).
enum class BlockedStrategy : uint8_t
{
    Wait,  ///< spin/yield on the same slot until it frees up
    Jump   ///< skip forward to the next writable slot
};

/// Region of interest, in pixels, applied while writing into the buffer.
/// Also defines the stored frame size (and therefore the slot allocation size).
struct Roi
{
    uint32_t rowOffset = 0; ///< first row copied from the incoming image
    uint32_t colOffset = 0; ///< first column copied from the incoming image
    uint32_t height    = 0; ///< number of rows stored
    uint32_t width     = 0; ///< number of columns stored
};

/// Everything the ring buffer needs to know up front (the constructor args from
/// the spec, gathered into one struct so the Python binding can pass kwargs).
struct RingBufferConfig
{
    std::string     name;                                   ///< data-set name
    uint32_t        bufferSize        = 0;                  ///< number of slots
    std::string     saveFilePath;                           ///< empty => no saving
    uint32_t        saveFileChunkSize = 0;                  ///< frames per disk flush
    uint32_t        byteSize          = 1;                  ///< bytes per sample (1,2,4,8)
    uint32_t        channelCount      = 1;                  ///< channels per pixel
    Roi             roi;                                    ///< stored ROI / frame size
    bool            rearrangeChannels = false;              ///< interleaved -> planar
    ImageNorm       imageNorm         = ImageNorm::None;    ///< per-channel norm
    BlockedStrategy strategyIfFrameIsBlocked = BlockedStrategy::Jump;
};

/// Metadata returned by readMetaData() / readMetaDataLastReady().
struct FrameMetaData
{
    bool               valid = false;             ///< false if the slot was blocked
    uint64_t           frameCount        = 0;
    uint64_t           timeStampOnStart  = 0;     ///< ns, steady clock, start of write
    uint64_t           timeStampOnStop   = 0;     ///< ns, steady clock, end of write
    std::vector<float> imageNorm;                 ///< one entry per channel (-1 = not computed)
};

/// Image + geometry returned by read() / readLastReady().
/// `data` is an owned copy, so the caller may keep it after the slot is reused
/// (important for the LiveKit hand-off — see design notes).
struct FrameView
{
    bool                 valid    = false;
    std::vector<uint8_t> data;                    ///< copied image bytes
    uint32_t             width    = 0;
    uint32_t             height   = 0;
    uint32_t             channels = 0;
    uint32_t             byteSize = 0;
    bool                 planar   = false;        ///< true => (C,H,W), false => (H,W,C)
    uint64_t             frameCount = 0;
    uint64_t             timeStampOnStart = 0;
    uint64_t             timeStampOnStop  = 0;
};

// ---------------------------------------------------------------------------
//  On-disk RAW format headers (POD, packed so they serialise verbatim). Kept in
//  the header so a decoder of the .raw output can reuse the exact layout.
// ---------------------------------------------------------------------------
#pragma pack(push, 1)
struct FileGlobalHeader
{
    char     magic[8]   = {'U','C','2','R','B','U','F','1'};
    uint32_t version    = 1;
    uint32_t bufferSize = 0;
    uint32_t byteSize   = 0;
    uint32_t channelCount = 0;
    uint32_t roiRowOffset = 0;
    uint32_t roiColOffset = 0;
    uint32_t roiHeight    = 0;
    uint32_t roiWidth     = 0;
    uint8_t  rearrangeChannels = 0;
    uint8_t  imageNorm    = 0;    ///< ImageNorm value
    uint8_t  reserved[2]  = {0, 0};
    uint32_t chunkSize    = 0;
    char     name[64]     = {0};  ///< data-set name (truncated)
};

struct FileFrameHeader
{
    uint64_t frameCount       = 0;
    uint64_t timeStampOnStart = 0;
    uint64_t timeStampOnStop  = 0;
    uint32_t channels         = 0;
    uint32_t planar           = 0; ///< 1 if channels de-interleaved
    // followed by: float norm[channels], then image bytes
};
#pragma pack(pop)

// ---------------------------------------------------------------------------
//  RingBuffer
// ---------------------------------------------------------------------------
class RingBuffer
{
public:
    /// Construct, allocate all slots (zero-filled, state Ready) and start the
    /// post-processing worker. Throws std::invalid_argument on a bad config.
    explicit RingBuffer(const RingBufferConfig& cfg);

    /// Stops the worker and flushes any pending frames to disk.
    ~RingBuffer();

    RingBuffer(const RingBuffer&)            = delete;
    RingBuffer& operator=(const RingBuffer&) = delete;

    // --- introspection (trivial, kept inline) ------------------------------
    const RingBufferConfig& config() const { return mCfg; }
    uint32_t bufferSize() const { return mCfg.bufferSize; }
    size_t   frameBytes() const { return mFrameBytes; }

    /// Additional settable property from the spec: index of the last frame
    /// whose writing (and post-processing) has completed. -1 == none yet.
    int64_t indexOfLastReadyFrame() const
    {
        return mLastReadyIndex.load(std::memory_order_acquire);
    }
    void setIndexOfLastReadyFrame(int64_t idx)
    {
        mLastReadyIndex.store(idx, std::memory_order_release);
    }

    // -----------------------------------------------------------------------
    //  Producer API (C++/camera side only; NOT exposed to Python).
    // -----------------------------------------------------------------------
    /// Copy one incoming frame into the buffer, cropping to the configured ROI.
    ///
    /// `srcWidth`/`srcHeight` describe the incoming image so the ROI can be
    /// bounds-checked (memory-access-violation protection). Returns false and
    /// writes nothing if the ROI does not fit or the format does not match.
    bool writeToBuffer(const uint8_t* src,
                       uint32_t srcWidth,
                       uint32_t srcHeight,
                       uint32_t srcChannels,
                       uint32_t srcByteSize,
                       uint64_t frameNumber = 0);

    // -----------------------------------------------------------------------
    //  Reader API (exposed to Python).
    // -----------------------------------------------------------------------
    /// Copy frame `index` into a fresh buffer and return it with its geometry.
    FrameView read(uint32_t index);

    /// Copy the newest fully-ready frame.
    FrameView readLastReady();

    /// Timestamps + per-channel norm of frame `index` (invalid if blocked).
    FrameMetaData readMetaData(uint32_t index);

    /// Timestamps + per-channel norm of the newest ready frame.
    FrameMetaData readMetaDataLastReady();

    // -----------------------------------------------------------------------
    //  Worker lifecycle (started in the constructor, stopped in the destructor).
    // -----------------------------------------------------------------------
    void start();
    void stop();

private:
    static constexpr uint32_t kInvalid = 0xFFFFFFFFu;

    uint8_t* imageSlot(uint32_t idx);
    uint32_t acquireWriteSlot();
    void     publishReady(uint32_t idx);

    void  workerLoop();
    void  processFrame(uint32_t idx, std::vector<uint8_t>& scratch);
    float computeNormForChannel(const uint8_t* frame, uint32_t channel, bool planar);

    void openSaveStreamIfNeeded();
    void serializeFrameInto(uint32_t idx, bool planar, std::vector<uint8_t>& buf);
    void flushChunk();

    // --- data --------------------------------------------------------------
    RingBufferConfig mCfg;
    size_t           mPixels     = 0;
    size_t           mFrameBytes = 0;

    std::vector<uint8_t>                       mImage;   ///< bufferSize * frameBytes
    std::vector<FrameMetaData>                 mMeta;    ///< per-slot metadata
    std::vector<float>                         mNorms;   ///< bufferSize * channels
    std::unique_ptr<std::atomic<FrameState>[]> mStates;  ///< per-slot state

    uint32_t             mWriteIndex = 0;                 ///< producer cursor (single writer)
    std::atomic<int64_t> mLastReadyIndex{-1};

    // worker
    std::atomic<bool>       mRunning{false};
    std::thread             mWorker;
    std::mutex              mWorkMx;
    std::condition_variable mWorkCv;
    std::deque<uint32_t>    mWorkQueue;

    // saving (touched only by the worker thread)
    bool                 mSavingEnabled = false;
    std::ofstream        mSaveStream;
    std::vector<uint8_t> mPendingBytes;   ///< serialized frame records not yet flushed
    uint32_t             mPendingCount = 0;
};

} // namespace uc2
