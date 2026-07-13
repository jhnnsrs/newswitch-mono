"""Configuration dataclasses for the Zstd and H.264 frame encoders."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ZstdEncoderConfig:
    """Configuration for the shared Zstd encoder."""

    level: int = 0
    threshold: float = 2
    use_delta: bool = True


@dataclass(frozen=True)
class H264EncoderConfig:
    """Configuration for the shared H.264 encoder."""

    width: int = 640
    height: int = 480
    fps: int = 30
    bitrate: str = "1M"
    preset: str = "ultrafast"
    tune: str = "zerolatency"


EncoderConfig = H264EncoderConfig | ZstdEncoderConfig
