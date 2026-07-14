// pybind11 bindings for the UC2 frame ring buffer (core/include/Ringbuffer.hpp).
//
// Only the READ side is exposed to Python: read / readLastReady / readMetaData /
// readMetaDataLastReady (plus construction and lifecycle). Writing is owned by
// the C++ camera engine — Python never pushes frames into the buffer.
//
// read()/readLastReady() return a numpy array that OWNS its data (the C++ side
// already copied the frame out of the slot), so it is safe to keep and hand to
// LiveKit after the slot has been recycled.

#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>

#include <string>

#include "Ringbuffer.hpp"

namespace py = pybind11;
using namespace uc2;

namespace {

// Map the sample byte size onto a numpy dtype. 1/2/4/8 -> unsigned integers.
py::dtype dtypeForByteSize(uint32_t byteSize)
{
    switch (byteSize)
    {
    case 1:  return py::dtype::of<uint8_t>();
    case 2:  return py::dtype::of<uint16_t>();
    case 4:  return py::dtype::of<uint32_t>();
    case 8:  return py::dtype::of<uint64_t>();
    default: return py::dtype::of<uint8_t>();
    }
}

// Turn a FrameView into an owning numpy array shaped (H,W[,C]) for interleaved
// data or (C,H,W) for de-interleaved (planar) data. Returns None if invalid.
py::object frameToArray(FrameView&& v)
{
    if (!v.valid)
        return py::none();

    // Hand ownership of the copied bytes to numpy via a capsule so no second
    // copy is made.
    auto* buf = new std::vector<uint8_t>(std::move(v.data));
    py::capsule owner(buf, [](void* p) { delete reinterpret_cast<std::vector<uint8_t>*>(p); });

    std::vector<py::ssize_t> shape;
    if (v.channels == 1)
        shape = {v.height, v.width};
    else if (v.planar)
        shape = {v.channels, v.height, v.width};
    else
        shape = {v.height, v.width, v.channels};

    return py::array(dtypeForByteSize(v.byteSize), shape, buf->data(), owner);
}

py::dict metaToDict(const FrameMetaData& m)
{
    py::dict d;
    d["valid"]             = m.valid;
    d["frame_count"]       = m.frameCount;
    d["timestamp_start_ns"] = m.timeStampOnStart;
    d["timestamp_stop_ns"]  = m.timeStampOnStop;
    d["image_norm"]        = m.imageNorm; // list[float], one per channel
    return d;
}

} // namespace

PYBIND11_MODULE(_ringbuffer, m)
{
    m.doc() = "Python bindings for the UC2 camera frame ring buffer (read side only).";

    py::enum_<ImageNorm>(m, "ImageNorm")
        .value("None_", ImageNorm::None)
        .value("Variance", ImageNorm::Variance)
        .value("Max", ImageNorm::Max)
        .value("Min", ImageNorm::Min)
        .value("Mean", ImageNorm::Mean)
        .value("Median", ImageNorm::Median);

    py::enum_<BlockedStrategy>(m, "BlockedStrategy")
        .value("Wait", BlockedStrategy::Wait)
        .value("Jump", BlockedStrategy::Jump);

    py::class_<RingBuffer>(m, "RingBuffer",
        "Single-writer / multi-reader camera frame ring buffer.\n"
        "Only reading is available from Python; the C++ camera engine writes.")
        // The constructor takes the spec's properties as keyword arguments.
        .def(py::init([](const std::string& name,
                         uint32_t buffer_size,
                         uint32_t byte_size,
                         uint32_t channel_count,
                         uint32_t roi_row_offset,
                         uint32_t roi_col_offset,
                         uint32_t roi_height,
                         uint32_t roi_width,
                         const std::string& save_file_path,
                         uint32_t save_file_chunk_size,
                         bool rearrange_channels,
                         ImageNorm image_norm,
                         BlockedStrategy strategy_if_frame_is_blocked) {
                 RingBufferConfig cfg;
                 cfg.name              = name;
                 cfg.bufferSize        = buffer_size;
                 cfg.byteSize          = byte_size;
                 cfg.channelCount      = channel_count;
                 cfg.roi               = {roi_row_offset, roi_col_offset, roi_height, roi_width};
                 cfg.saveFilePath      = save_file_path;
                 cfg.saveFileChunkSize = save_file_chunk_size;
                 cfg.rearrangeChannels = rearrange_channels;
                 cfg.imageNorm         = image_norm;
                 cfg.strategyIfFrameIsBlocked = strategy_if_frame_is_blocked;
                 return new RingBuffer(cfg);
             }),
             py::arg("name"),
             py::arg("buffer_size"),
             py::arg("byte_size"),
             py::arg("channel_count"),
             py::arg("roi_row_offset"),
             py::arg("roi_col_offset"),
             py::arg("roi_height"),
             py::arg("roi_width"),
             py::arg("save_file_path") = std::string(),
             py::arg("save_file_chunk_size") = 0,
             py::arg("rearrange_channels") = false,
             py::arg("image_norm") = ImageNorm::None,
             py::arg("strategy_if_frame_is_blocked") = BlockedStrategy::Jump)

        // --- read side ----------------------------------------------------
        .def("read",
             [](RingBuffer& rb, uint32_t index) {
                 FrameView v;
                 {
                     py::gil_scoped_release rel; // the copy may block briefly
                     v = rb.read(index);
                 }
                 return frameToArray(std::move(v));
             },
             py::arg("index"),
             "Copy frame `index` out of the buffer as a numpy array\n"
             "((H,W) / (H,W,C) interleaved, (C,H,W) if de-interleaved).\n"
             "Returns None if the frame is currently blocked.")

        .def("read_last_ready",
             [](RingBuffer& rb) {
                 FrameView v;
                 {
                     py::gil_scoped_release rel;
                     v = rb.readLastReady();
                 }
                 return frameToArray(std::move(v));
             },
             "Copy the newest fully-ready frame (or None if none/blocked).")

        .def("read_metadata",
             [](RingBuffer& rb, uint32_t index) {
                 FrameMetaData md;
                 {
                     py::gil_scoped_release rel;
                     md = rb.readMetaData(index);
                 }
                 return metaToDict(md);
             },
             py::arg("index"),
             "Timestamps + per-channel image norm of frame `index`.\n"
             "The returned dict has valid=False if the frame is blocked.")

        .def("read_metadata_last_ready",
             [](RingBuffer& rb) {
                 FrameMetaData md;
                 {
                     py::gil_scoped_release rel;
                     md = rb.readMetaDataLastReady();
                 }
                 return metaToDict(md);
             },
             "Timestamps + per-channel image norm of the newest ready frame.")

        // --- read-only introspection --------------------------------------
        .def_property_readonly("buffer_size", &RingBuffer::bufferSize)
        .def_property_readonly("index_of_last_ready_frame",
                               &RingBuffer::indexOfLastReadyFrame,
                               "Index of the last fully-written frame (-1 if none).");
}
