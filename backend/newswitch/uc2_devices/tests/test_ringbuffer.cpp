// ===========================================================================
//  test_ringbuffer.cpp — functional + concurrency tests for uc2::RingBuffer.
//
//  Dependency-free (no gtest): a tiny CHECK harness that keeps going after a
//  failure and returns a non-zero exit code if anything failed, so it plugs
//  straight into ctest. The full write path is C++-only (Python never writes),
//  which is exactly why these tests live here rather than in pytest.
//
//  Build/run (standalone, no MVS SDK needed):
//      cmake -S newswitch/uc2_devices/tests -B build-rbtests
//      cmake --build build-rbtests
//      ctest --test-dir build-rbtests --output-on-failure
// ===========================================================================

#include "Ringbuffer.hpp"

#include <atomic>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <fstream>
#include <string>
#include <thread>
#include <vector>

using namespace uc2;

// --------------------------------------------------------------------------
//  Minimal test harness
// --------------------------------------------------------------------------
static int g_checks   = 0;
static int g_failures = 0;

#define CHECK(cond)                                                            \
    do {                                                                       \
        ++g_checks;                                                            \
        if (!(cond)) {                                                         \
            ++g_failures;                                                      \
            std::printf("  FAIL  %s:%d  CHECK(%s)\n", __FILE__, __LINE__, #cond); \
        }                                                                      \
    } while (0)

#define CHECK_NEAR(a, b, eps)                                                  \
    do {                                                                       \
        ++g_checks;                                                            \
        double _d = double(a) - double(b);                                     \
        if (_d < 0) _d = -_d;                                                  \
        if (_d > (eps)) {                                                      \
            ++g_failures;                                                      \
            std::printf("  FAIL  %s:%d  |%s - %s| = %g > %g\n",                \
                        __FILE__, __LINE__, #a, #b, _d, double(eps));          \
        }                                                                      \
    } while (0)

// Spin until the newest ready index reaches `want` (worker runs async).
static bool waitReady(RingBuffer& rb, int64_t want, int tries = 2000)
{
    for (int i = 0; i < tries; ++i)
    {
        if (rb.indexOfLastReadyFrame() == want)
            return true;
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
    return false;
}

// --------------------------------------------------------------------------
//  Tests
// --------------------------------------------------------------------------

// Full-frame round trip, one channel, and metadata plausibility.
static void test_full_frame_roundtrip()
{
    RingBufferConfig cfg;
    cfg.name         = "roundtrip";
    cfg.bufferSize   = 4;
    cfg.byteSize     = 1;
    cfg.channelCount = 1;
    cfg.roi          = {0, 0, 3, 4}; // rowOff, colOff, h, w
    RingBuffer rb(cfg);

    std::vector<uint8_t> img(4 * 3);
    for (size_t i = 0; i < img.size(); ++i)
        img[i] = static_cast<uint8_t>(i + 1); // 1..12

    CHECK(rb.writeToBuffer(img.data(), 4, 3, 1, 1, /*frameNumber*/ 42));
    CHECK(waitReady(rb, 0));

    FrameView v = rb.read(0);
    CHECK(v.valid);
    CHECK(v.width == 4 && v.height == 3 && v.channels == 1 && v.byteSize == 1);
    CHECK(!v.planar);
    bool same = (v.data.size() == img.size());
    for (size_t i = 0; same && i < img.size(); ++i)
        same = (v.data[i] == img[i]);
    CHECK(same);

    FrameMetaData md = rb.readMetaData(0);
    CHECK(md.valid);
    CHECK(md.frameCount == 42);
    CHECK(md.timeStampOnStop >= md.timeStampOnStart);
    CHECK(md.timeStampOnStart != 0);
}

// Never-written slots are Ready and read back as zeros.
static void test_unwritten_is_zero_ready()
{
    RingBufferConfig cfg;
    cfg.bufferSize   = 4;
    cfg.byteSize     = 1;
    cfg.channelCount = 1;
    cfg.roi          = {0, 0, 2, 2};
    RingBuffer rb(cfg);

    CHECK(rb.indexOfLastReadyFrame() == -1); // nothing written yet
    CHECK(!rb.readLastReady().valid);        // no "last ready" frame

    FrameView v = rb.read(2); // never written, but Ready + zeroed
    CHECK(v.valid);
    uint64_t sum = 0;
    for (uint8_t b : v.data) sum += b;
    CHECK(sum == 0);

    CHECK(!rb.read(99).valid); // out of range
}

// ROI crop copies the right window; out-of-bounds / mismatched writes are rejected.
static void test_roi_crop_and_bounds()
{
    RingBufferConfig cfg;
    cfg.bufferSize   = 4;
    cfg.byteSize     = 1;
    cfg.channelCount = 1;
    cfg.roi          = {1, 1, 2, 2}; // crop 2x2 at (row1, col1)
    RingBuffer rb(cfg);

    std::vector<uint8_t> img(16);
    for (int r = 0; r < 4; ++r)
        for (int c = 0; c < 4; ++c)
            img[r * 4 + c] = static_cast<uint8_t>(r * 10 + c);

    CHECK(rb.writeToBuffer(img.data(), 4, 4, 1, 1, 7));
    CHECK(waitReady(rb, 0));
    FrameView v = rb.read(0);
    CHECK(v.valid && v.width == 2 && v.height == 2);
    CHECK(v.data[0] == 11 && v.data[1] == 12 && v.data[2] == 21 && v.data[3] == 22);

    // Rejections (write nothing, return false):
    CHECK(!rb.writeToBuffer(nullptr, 4, 4, 1, 1, 0));      // null source
    CHECK(!rb.writeToBuffer(img.data(), 4, 4, 3, 1, 0));   // channel mismatch
    CHECK(!rb.writeToBuffer(img.data(), 4, 4, 1, 2, 0));   // byteSize mismatch

    RingBufferConfig oob = cfg;
    oob.roi = {3, 3, 2, 2}; // exceeds a 4x4 image
    RingBuffer rb2(oob);
    CHECK(!rb2.writeToBuffer(img.data(), 4, 4, 1, 1, 0));
}

// Channel de-interleave: interleaved (H,W,C) -> planar (C,H,W).
static void test_deinterleave()
{
    RingBufferConfig cfg;
    cfg.bufferSize        = 4;
    cfg.byteSize          = 1;
    cfg.channelCount      = 3;
    cfg.roi               = {0, 0, 1, 4}; // 4 pixels
    cfg.rearrangeChannels = true;
    RingBuffer rb(cfg);

    std::vector<uint8_t> img(4 * 3);
    for (int p = 0; p < 4; ++p)
    {
        img[p * 3 + 0] = static_cast<uint8_t>(p);
        img[p * 3 + 1] = static_cast<uint8_t>(100 + p);
        img[p * 3 + 2] = static_cast<uint8_t>(200 + p);
    }
    CHECK(rb.writeToBuffer(img.data(), 4, 1, 3, 1, 5));
    CHECK(waitReady(rb, 0));

    FrameView v = rb.read(0);
    CHECK(v.valid && v.planar);
    for (int p = 0; p < 4; ++p)
    {
        CHECK(v.data[0 * 4 + p] == p);
        CHECK(v.data[1 * 4 + p] == 100 + p);
        CHECK(v.data[2 * 4 + p] == 200 + p);
    }
}

// Each norm type over the sequence 1..12 (single channel).
static void test_norms()
{
    struct Case { ImageNorm norm; double expect; };
    // 1..12: mean 6.5, var(pop) 143/12, min 1, max 12, median(upper-mid) = 7
    Case cases[] = {
        {ImageNorm::Mean,     6.5},
        {ImageNorm::Variance, 143.0 / 12.0},
        {ImageNorm::Min,      1.0},
        {ImageNorm::Max,      12.0},
        {ImageNorm::Median,   7.0},
    };

    for (const Case& cse : cases)
    {
        RingBufferConfig cfg;
        cfg.bufferSize   = 2;
        cfg.byteSize     = 1;
        cfg.channelCount = 1;
        cfg.roi          = {0, 0, 3, 4}; // 12 samples
        cfg.imageNorm    = cse.norm;
        RingBuffer rb(cfg);

        std::vector<uint8_t> img(12);
        for (size_t i = 0; i < img.size(); ++i)
            img[i] = static_cast<uint8_t>(i + 1);
        CHECK(rb.writeToBuffer(img.data(), 4, 3, 1, 1, 0));
        CHECK(waitReady(rb, 0));

        FrameMetaData md = rb.readMetaData(0);
        CHECK(md.valid && md.imageNorm.size() == 1);
        CHECK_NEAR(md.imageNorm[0], cse.expect, 1e-3);
    }

    // Per-channel norm on planar 3-channel data (max per channel).
    RingBufferConfig cfg;
    cfg.bufferSize        = 2;
    cfg.byteSize          = 1;
    cfg.channelCount      = 3;
    cfg.roi               = {0, 0, 1, 4};
    cfg.rearrangeChannels = true;
    cfg.imageNorm         = ImageNorm::Max;
    RingBuffer rb(cfg);
    std::vector<uint8_t> img(4 * 3);
    for (int p = 0; p < 4; ++p)
    {
        img[p * 3 + 0] = static_cast<uint8_t>(p);         // ch0 max = 3
        img[p * 3 + 1] = static_cast<uint8_t>(100 + p);   // ch1 max = 103
        img[p * 3 + 2] = static_cast<uint8_t>(200 + p);   // ch2 max = 203
    }
    CHECK(rb.writeToBuffer(img.data(), 4, 1, 3, 1, 0));
    CHECK(waitReady(rb, 0));
    FrameMetaData md = rb.readMetaData(0);
    CHECK(md.valid && md.imageNorm.size() == 3);
    CHECK_NEAR(md.imageNorm[0], 3.0, 1e-6);
    CHECK_NEAR(md.imageNorm[1], 103.0, 1e-6);
    CHECK_NEAR(md.imageNorm[2], 203.0, 1e-6);
}

// 16-bit (byteSize=2) data path.
static void test_uint16_path()
{
    RingBufferConfig cfg;
    cfg.bufferSize   = 4;
    cfg.byteSize     = 2;
    cfg.channelCount = 1;
    cfg.roi          = {0, 0, 2, 2};
    cfg.imageNorm    = ImageNorm::Max;
    RingBuffer rb(cfg);

    std::vector<uint16_t> img = {10, 4000, 65535, 123};
    CHECK(rb.writeToBuffer(reinterpret_cast<uint8_t*>(img.data()), 2, 2, 1, 2, 1));
    CHECK(waitReady(rb, 0));

    FrameView v = rb.read(0);
    CHECK(v.valid && v.byteSize == 2);
    const uint16_t* p = reinterpret_cast<const uint16_t*>(v.data.data());
    CHECK(p[0] == 10 && p[1] == 4000 && p[2] == 65535 && p[3] == 123);

    FrameMetaData md = rb.readMetaData(0);
    CHECK(md.valid);
    CHECK_NEAR(md.imageNorm[0], 65535.0, 1e-6);
}

// readLastReady tracks the newest committed frame.
static void test_last_ready_tracks_newest()
{
    RingBufferConfig cfg;
    cfg.bufferSize   = 8;
    cfg.byteSize     = 1;
    cfg.channelCount = 1;
    cfg.roi          = {0, 0, 1, 1};
    RingBuffer rb(cfg);

    for (int f = 0; f < 5; ++f)
    {
        uint8_t px = static_cast<uint8_t>(f + 1);
        CHECK(rb.writeToBuffer(&px, 1, 1, 1, 1, static_cast<uint64_t>(f)));
        CHECK(waitReady(rb, f));
        FrameView v = rb.readLastReady();
        CHECK(v.valid && v.data.size() == 1 && v.data[0] == px);
        FrameMetaData md = rb.readMetaDataLastReady();
        CHECK(md.valid && md.frameCount == static_cast<uint64_t>(f));
    }
    CHECK(rb.indexOfLastReadyFrame() == 4);
}

// Constructor rejects invalid configs.
static void test_config_validation()
{
    auto throws = [](RingBufferConfig c) {
        try { RingBuffer rb(c); return false; }
        catch (const std::invalid_argument&) { return true; }
        catch (...) { return false; }
    };
    RingBufferConfig base;
    base.bufferSize = 4; base.byteSize = 1; base.channelCount = 1; base.roi = {0, 0, 2, 2};

    RingBufferConfig c;
    c = base; c.bufferSize = 0;   CHECK(throws(c));
    c = base; c.roi = {0, 0, 0, 2}; CHECK(throws(c));
    c = base; c.channelCount = 0; CHECK(throws(c));
    c = base; c.byteSize = 3;     CHECK(throws(c));
    CHECK(!throws(base)); // the baseline is valid
}

// Disk save: RAW file with a global header + per-frame records.
static void test_disk_save()
{
    const std::string path = "ringbuffer_test_out.raw";
    std::remove(path.c_str());

    RingBufferConfig cfg;
    cfg.name              = "saveset";
    cfg.bufferSize        = 8;
    cfg.byteSize          = 1;
    cfg.channelCount      = 1;
    cfg.roi               = {0, 0, 2, 2};
    cfg.imageNorm         = ImageNorm::Mean;
    cfg.saveFilePath      = path;
    cfg.saveFileChunkSize = 2;
    {
        RingBuffer rb(cfg);
        std::vector<uint8_t> img(4);
        for (int f = 0; f < 3; ++f)
        {
            for (auto& b : img) b = static_cast<uint8_t>(f);
            CHECK(rb.writeToBuffer(img.data(), 2, 2, 1, 1, static_cast<uint64_t>(f)));
            std::this_thread::sleep_for(std::chrono::milliseconds(3));
        }
    } // destructor stop() flushes the tail frame

    std::ifstream in(path, std::ios::binary);
    CHECK(in.good());
    FileGlobalHeader gh;
    in.read(reinterpret_cast<char*>(&gh), sizeof(gh));
    CHECK(std::string(gh.magic, 8) == "UC2RBUF1");
    CHECK(gh.bufferSize == 8 && gh.channelCount == 1 && gh.roiWidth == 2 && gh.roiHeight == 2);
    CHECK(static_cast<ImageNorm>(gh.imageNorm) == ImageNorm::Mean);
    CHECK(std::string(gh.name) == "saveset");

    int frames = 0;
    FileFrameHeader fh;
    while (in.read(reinterpret_cast<char*>(&fh), sizeof(fh)))
    {
        CHECK(fh.channels == 1);
        std::vector<float> norm(fh.channels);
        in.read(reinterpret_cast<char*>(norm.data()),
                static_cast<std::streamsize>(fh.channels * sizeof(float)));
        std::vector<uint8_t> data(4);
        in.read(reinterpret_cast<char*>(data.data()), 4);
        // frame f is all-f, so mean == f and every pixel == f
        CHECK_NEAR(norm[0], double(fh.frameCount), 1e-6);
        for (uint8_t b : data) CHECK(b == static_cast<uint8_t>(fh.frameCount));
        ++frames;
    }
    CHECK(frames == 3);
    in.close();
    std::remove(path.c_str());
}

// Concurrent writer + readers: must not crash and reads must mostly succeed.
static void test_concurrent_stress()
{
    RingBufferConfig cfg;
    cfg.bufferSize               = 64;
    cfg.byteSize                 = 2;
    cfg.channelCount             = 1;
    cfg.roi                      = {0, 0, 16, 16};
    cfg.imageNorm                = ImageNorm::Variance;
    cfg.strategyIfFrameIsBlocked = BlockedStrategy::Jump;
    RingBuffer rb(cfg);

    std::atomic<bool> stop{false};
    std::atomic<long> okReads{0};
    auto reader = [&] {
        while (!stop.load())
        {
            FrameView v = rb.readLastReady();
            if (v.valid)
            {
                okReads.fetch_add(1);
                // sanity: geometry is always consistent
                if (v.width != 16 || v.height != 16) { ++g_failures; }
            }
            FrameMetaData md = rb.readMetaDataLastReady();
            (void)md;
        }
    };
    std::thread r1(reader), r2(reader);

    std::vector<uint16_t> img(16 * 16);
    for (int f = 0; f < 5000; ++f)
    {
        for (size_t i = 0; i < img.size(); ++i)
            img[i] = static_cast<uint16_t>((f + i) & 0xFFFF);
        rb.writeToBuffer(reinterpret_cast<uint8_t*>(img.data()), 16, 16, 1, 2,
                         static_cast<uint64_t>(f));
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(20));
    stop.store(true);
    r1.join();
    r2.join();

    ++g_checks;
    if (okReads.load() <= 0)
    {
        ++g_failures;
        std::printf("  FAIL  concurrent stress produced no successful reads\n");
    }
    std::printf("  (stress: %ld successful reads, lastReady=%lld)\n",
                okReads.load(), static_cast<long long>(rb.indexOfLastReadyFrame()));
}

// Wait strategy: producer blocks on a busy slot instead of skipping. Here we
// just exercise the code path end to end (a full buffer with a slow consumer).
static void test_wait_strategy_runs()
{
    RingBufferConfig cfg;
    cfg.bufferSize               = 4;
    cfg.byteSize                 = 1;
    cfg.channelCount             = 1;
    cfg.roi                      = {0, 0, 2, 2};
    cfg.strategyIfFrameIsBlocked = BlockedStrategy::Wait;
    RingBuffer rb(cfg);

    std::vector<uint8_t> img(4, 7);
    for (int f = 0; f < 10; ++f)
        CHECK(rb.writeToBuffer(img.data(), 2, 2, 1, 1, static_cast<uint64_t>(f)));
    CHECK(waitReady(rb, static_cast<int64_t>((10 - 1) % 4)));
}

int main()
{
    struct Test { const char* name; void (*fn)(); };
    const Test tests[] = {
        {"full_frame_roundtrip",   test_full_frame_roundtrip},
        {"unwritten_is_zero_ready",test_unwritten_is_zero_ready},
        {"roi_crop_and_bounds",    test_roi_crop_and_bounds},
        {"deinterleave",           test_deinterleave},
        {"norms",                  test_norms},
        {"uint16_path",            test_uint16_path},
        {"last_ready_tracks_newest",test_last_ready_tracks_newest},
        {"config_validation",      test_config_validation},
        {"disk_save",              test_disk_save},
        {"wait_strategy_runs",     test_wait_strategy_runs},
        {"concurrent_stress",      test_concurrent_stress},
    };

    for (const Test& t : tests)
    {
        int before = g_failures;
        std::printf("[ RUN  ] %s\n", t.name);
        t.fn();
        std::printf("[ %s ] %s\n", (g_failures == before) ? " OK " : "FAIL", t.name);
    }

    std::printf("\n%d checks, %d failure(s)\n", g_checks, g_failures);
    return g_failures == 0 ? 0 : 1;
}
