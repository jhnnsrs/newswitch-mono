"""
settings.py — model + persistence for ``uc2DevSettings.json``.

Plain dataclasses (no rekuest / pydantic dependency) so the driver layer stays
SDK-only and independently testable. One ``Uc2CameraSettings`` block per camera,
keyed by serial number, plus load/save helpers.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Optional

from .uc2_camera import Roi


@dataclass
class RoiSettings:
    """ROI as stored in JSON (applied on hardware / in the native layer)."""

    x: int
    y: int
    width: int
    height: int

    def to_roi(self) -> Roi:
        return Roi(self.x, self.y, self.width, self.height)


@dataclass
class Uc2CameraSettings:
    """Per-camera settings block."""

    serial: str
    name: str = ""
    slot: Optional[int] = None  # fixed slot; None = auto-assign at discovery

    # typical acquisition parameters
    exposure_time_s: float = 0.01
    gain: float = 1.0
    framerate_fps: float = 30.0
    roi: Optional[RoiSettings] = None

    # frame-format preferences (arbitrary bit depth / channel count)
    bit_depth: int = 16
    channels: int = 1

    # performance
    use_dma: bool = True  # prefer DMA if the camera supports it

    # recording / analysis
    data_path: str = "/data/uc2"
    compute_variance: bool = False


@dataclass
class Uc2DevSettings:
    """Top-level document backing ``uc2DevSettings.json``."""

    cameras: list[Uc2CameraSettings] = field(default_factory=list)

    def get_for_serial(self, serial: str) -> Optional[Uc2CameraSettings]:
        """Return the settings block for a camera serial, or ``None``."""
        for cam in self.cameras:
            if cam.serial == serial:
                return cam
        return None

    # ---------------------------------------------------------------- #
    # persistence
    # ---------------------------------------------------------------- #
    @classmethod
    def load(cls, path: str | Path) -> "Uc2DevSettings":
        """Load from JSON. Returns empty defaults if the file does not exist."""
        path = Path(path)
        if not path.exists():
            return cls()
        return cls.from_dict(json.loads(path.read_text()))

    def save(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_dict(), indent=2))

    # ---------------------------------------------------------------- #
    # (de)serialisation — explicit so enums / nested roi round-trip cleanly
    # ---------------------------------------------------------------- #
    def to_dict(self) -> dict:
        cams = []
        for c in self.cameras:
            d = asdict(c)
          
            cams.append(d)
        return {"cameras": cams}

    @classmethod
    def from_dict(cls, data: dict) -> "Uc2DevSettings":
        cams: list[Uc2CameraSettings] = []
        for c in data.get("cameras", []):
            roi = c.get("roi")
            cams.append(
                Uc2CameraSettings(
                    serial=c["serial"],
                    name=c.get("name", ""),
                    slot=c.get("slot"),
                    exposure_time_s=c.get("exposure_time_s", 0.01),
                    gain=c.get("gain", 1.0),
                    framerate_fps=c.get("framerate_fps", 30.0),
                    roi=RoiSettings(**roi) if roi else None,
                    bit_depth=c.get("bit_depth", 16),
                    channels=c.get("channels", 1),
                    use_dma=c.get("use_dma", True),
                    data_path=c.get("data_path", "/data/uc2"),
                    compute_variance=c.get("compute_variance", False),
                )
            )
        return cls(cameras=cams)
