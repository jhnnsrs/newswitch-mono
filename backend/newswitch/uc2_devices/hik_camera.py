"""
hik_camera.py — HIKROBOT (MVS SDK) implementation of ``Uc2Camera``.

Skeleton: wire your existing HIK MVS control code into these vendor-specific
methods. Everything else (variance, TIFF/Zarr saving, settings application,
context-manager lifecycle) is inherited from ``Uc2Camera``.

HIK specifics to remember:
  * ExposureTime is in microseconds -> multiply seconds by 1e6.
  * Hardware ROI = Width / Height / OffsetX / OffsetY (must satisfy the sensor's
    step/alignment constraints).
  * PixelFormat determines dtype / bit_depth / channels (e.g. Mono8, Mono12,
    Mono16, BayerRG8, RGB8) -> map it to a FrameFormat in connect().
"""

from __future__ import annotations

from typing import Any, Optional

import numpy as np

from .uc2_camera import (
    CameraInfo,
    FrameFormat,
    Interface,
    Roi,
    Uc2Camera,
)
from newswitchSources.uc2_devices import _hikcam  # type: ignore



class HikCamera(Uc2Camera):
    """HIKROBOT machine-vision camera driver."""

    def __init__(self, info: CameraInfo, settings=None) -> None:
        super().__init__(info, settings)
        self._handle: Any = None
        self._format: Optional[FrameFormat] = None
        self._running = False

    # ------------------------------------------------------------------ #
    # discovery
    # ------------------------------------------------------------------ #
    @classmethod
    def enumerate(cls) -> list[CameraInfo]:
        # MV_CC_EnumDevices(MV_USB_DEVICE | MV_GIGE_DEVICE, device_list)
        # For each device: read vendor / model / serial and whether DMA is
        # available, then build a CameraInfo.
  
        # DEBUGGING CURRENTLY ONLY
        """Initialise the MVS SDK via the C++ binding and report the result."""
        print(f"Using extension: {_hikcam.__file__}")
  


        # -> bool hik::MvsCamera::initSdk()  (MV_CC_Initialize under the hood)
        ok = _hikcam.initialize()
        print(f"MvsCamera::initSdk() -> {ok}")
        if not ok:
            print("SDK initialisation failed (see stderr for the MVS error).")
            return 1

        try:
            # Bonus: prove the SDK is live by enumerating any connected cameras.
            devices = _hikcam.list_devices()
            print(f"Found {len(devices)} camera(s):")
            for i, dev in enumerate(devices):
                print(f"  [{i}] {dev!r}")
        finally:
            # -> void hik::MvsCamera::finalizeSdk()  (MV_CC_Finalize)
            _hikcam.finalize()
            print("MvsCamera::finalizeSdk() done.")




        raise NotImplementedError

    # ------------------------------------------------------------------ #
    # lifecycle
    # ------------------------------------------------------------------ #
    def connect(self) -> None:
        # MV_CC_CreateHandle -> MV_CC_OpenDevice
        # read PixelFormat / Width / Height and build self._format:
        #   self._format = FrameFormat(width=..., height=..., channels=...,
        #                              dtype="uint16", bit_depth=12)
        raise NotImplementedError

    def disconnect(self) -> None:
        # MV_CC_CloseDevice -> MV_CC_DestroyHandle
        raise NotImplementedError

    def start(self) -> None:
        # MV_CC_StartGrabbing; for the full-rate path, hand the DMA / pinned
        # buffer to the native engine here (see acquisition_handle()).
        self._running = True
        raise NotImplementedError

    def stop(self) -> None:
        # MV_CC_StopGrabbing
        self._running = False
        raise NotImplementedError

    # ------------------------------------------------------------------ #
    # parameters
    # ------------------------------------------------------------------ #
    def set_exposure_time(self, seconds: float) -> None:
        # MV_CC_SetFloatValue("ExposureTime", seconds * 1e6)  # us
        raise NotImplementedError

    def set_gain(self, gain: float) -> None:
        # MV_CC_SetFloatValue("Gain", gain)
        raise NotImplementedError

    def set_framerate(self, fps: float) -> None:
        # MV_CC_SetBoolValue("AcquisitionFrameRateEnable", True)
        # MV_CC_SetFloatValue("AcquisitionFrameRate", fps)
        raise NotImplementedError

    def set_roi(self, roi: Optional[Roi]) -> None:
        # None -> restore full frame; else set Width/Height/OffsetX/OffsetY.
        # (Grabbing usually has to be stopped to change ROI.)
        self._roi = roi
        raise NotImplementedError

    # ------------------------------------------------------------------ #
    # frames
    # ------------------------------------------------------------------ #
    def grab_frame(self) -> np.ndarray:
        # MV_CC_GetOneFrameTimeout -> reshape buffer to frame_format.numpy_shape()
        raise NotImplementedError

    def acquisition_handle(self) -> Any:
        # If supports_dma: return the DMA / pinned-buffer handle for the native
        # engine (zero-copy). Otherwise return a copy-based grabber object.
        raise NotImplementedError

    # ------------------------------------------------------------------ #
    # capabilities
    # ------------------------------------------------------------------ #
    @property
    def frame_format(self) -> FrameFormat:
        if self._format is None:
            raise RuntimeError("connect() must be called before frame_format")
        return self._format

    @property
    def is_connected(self) -> bool:
        return self._handle is not None

    @property
    def is_running(self) -> bool:
        return self._running
