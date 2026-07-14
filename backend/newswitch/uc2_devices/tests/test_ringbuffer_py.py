"""Smoke tests for the ``_ringbuffer`` Python binding (read side only).

Writing into the buffer is intentionally NOT exposed to Python (the C++ camera
engine owns the write path), so these tests can only cover construction, config
validation, the read-only API surface and the empty-buffer behaviour. The full
functional coverage (write/read/ROI/norms/save/concurrency) lives in the C++
suite, ``test_ringbuffer.cpp``.

The extension is a compiled module built by the wheel; if it has not been built
in the current environment the whole module is skipped rather than failing.
"""

from __future__ import annotations

import importlib

import pytest

# The extension installs next to the package as ``_ringbuffer``. Try both the
# installed location and a bare import (useful when the .so sits on sys.path).
_rb = None
for _name in ("newswitchSources.uc2_devices._ringbuffer",
              "newswitch.uc2_devices._ringbuffer",
              "_ringbuffer"):
    try:
        _rb = importlib.import_module(_name)
        break
    except Exception:  # noqa: BLE001 - any import failure means "not built here"
        continue

pytestmark = pytest.mark.skipif(_rb is None, reason="_ringbuffer extension not built")


def _make(**over):
    """Construct a RingBuffer with sensible defaults, overridable per test."""
    kw = dict(
        name="pytest",
        buffer_size=4,
        byte_size=1,
        channel_count=1,
        roi_row_offset=0,
        roi_col_offset=0,
        roi_height=2,
        roi_width=2,
    )
    kw.update(over)
    return _rb.RingBuffer(**kw)


def test_read_only_api_surface():
    rb = _make()
    for method in ("read", "read_last_ready", "read_metadata", "read_metadata_last_ready"):
        assert hasattr(rb, method)
    # The write path must NOT be reachable from Python.
    assert not hasattr(rb, "write")
    assert not hasattr(rb, "write_to_buffer")


def test_enums_exist():
    assert hasattr(_rb, "ImageNorm")
    assert hasattr(_rb, "BlockedStrategy")
    for name in ("None_", "Variance", "Max", "Min", "Mean", "Median"):
        assert hasattr(_rb.ImageNorm, name)
    for name in ("Wait", "Jump"):
        assert hasattr(_rb.BlockedStrategy, name)


def test_introspection_on_empty_buffer():
    rb = _make(buffer_size=8)
    assert rb.buffer_size == 8
    assert rb.index_of_last_ready_frame == -1  # nothing written yet


def test_empty_reads_are_blocked():
    rb = _make()
    assert rb.read_last_ready() is None
    assert rb.read_metadata_last_ready()["valid"] is False


def test_unwritten_slot_reads_zeros():
    # A never-written slot is Ready + zero-filled, so read() returns a zero array.
    np = pytest.importorskip("numpy")
    rb = _make(roi_height=2, roi_width=3)
    arr = rb.read(1)
    assert arr is not None
    assert arr.shape == (2, 3)          # single channel -> (H, W)
    assert arr.dtype == np.uint8
    assert int(arr.sum()) == 0


def test_out_of_range_read_returns_none():
    rb = _make(buffer_size=4)
    assert rb.read(999) is None


@pytest.mark.parametrize(
    "bad",
    [
        dict(buffer_size=0),
        dict(roi_height=0),
        dict(channel_count=0),
        dict(byte_size=3),
    ],
)
def test_invalid_config_raises(bad):
    with pytest.raises(Exception):
        _make(**bad)


def test_metadata_dict_shape_when_blocked():
    rb = _make()
    md = rb.read_metadata(0)  # slot 0 is Ready(zeros) -> valid metadata
    assert set(md.keys()) >= {
        "valid", "frame_count", "timestamp_start_ns", "timestamp_stop_ns", "image_norm"
    }
