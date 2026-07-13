from typing import Protocol

from newswitch.broadcasters.encoders.config import EncoderConfig


"""
High-performance frame broadcaster for low-latency video streaming.

Optimized for minimal latency with:
- Lock-free broadcasting using thread-safe primitives
- Zero-copy frame references where possible
- Automatic frame dropping to prevent queue backlog
- Integrated Zstd and H.264 encoding for WebSocket streaming
- Shared encoders for clients with matching configurations
"""
from typing import Optional

import numpy as np



class EncoderSubscriptionProtocol(Protocol):
    """Subscription to a shared Zstd encoder's output stream."""

    @property
    def config(self) -> EncoderConfig:
        """Return the encoder configuration associated with this subscription."""
        ...

    @property
    def is_running(self) -> bool:
        """ " Check if the underlying encoder is still running. If the encoder has stopped, this subscription is effectively inactive."""
        ...

    @property
    def detector_slot(self) -> int:
        """Return the detector slot associated with this subscription. This can be used by the encoder to determine which frames to encode for this subscriber."""
        ...

    async def get_encoded_chunk(self, timeout: float = 1.0) -> Optional[bytes]:
        """Asynchronously get the next encoded chunk from the output queue. If no chunk is available within the specified timeout, return None. This method is used by subscribers to receive encoded data from the encoder."""
        ...

    def push_chunk(self, chunk: bytes) -> None:
        """Push an encoded chunk to this subscription's output queue. If the queue is full, the oldest chunk is dropped to make room for the new one. This method is called by the encoder when a new chunk is available."""
        ...


class EncoderProtocol(Protocol):
    """A protocol defining the interface for encoders used in the broadcasting system. This protocol specifies the properties and methods that any encoder implementation must provide to be compatible with the broadcaster and its subscribers."""

    @property
    def config(self) -> EncoderConfig:
        """Return the encoder configuration associated with this subscription."""
        ...

    @property
    def is_running(self) -> bool:
        """ " Check if the underlying encoder is still running. If the encoder has stopped, this subscription is effectively inactive."""
        ...

    @property
    def subscriber_count(self) -> int:
        """Return the number of active subscribers to this encoder. This can be used to determine if the encoder is still needed or if it can be stopped and cleaned up."""
        ...

    async def asubscribe(self, detector_slot: int) -> EncoderSubscriptionProtocol:
        """Asynchronously subscribe to this encoder's output stream for a specific detector slot. A new subscription is created with a unique ID and added to the list of subscribers. The subscription object is returned, which can be used to receive encoded chunks."""
        ...

    async def aunsubscribe(self, subscription: EncoderSubscriptionProtocol) -> None:
        """Asynchronously unsubscribe from this encoder's output stream. The subscription is removed from the list of subscribers. If this was the last subscriber, the encoder can be stopped and cleaned up by the broadcaster."""
        ...

    async def astart(self) -> None:
        """Asynchronously start the encoder. This sets the running state to True, allowing the encoder to process frames and produce output chunks for subscribers."""
        ...

    async def astop(self) -> None:
        """ " Asynchronously stop the encoder. This sets the running state to False and clears the last frame used for delta encoding. The encoder will no longer process frames or produce output chunks until it is started again."""
        ...

    def encode_frame(self, frame: np.ndarray) -> None:
        """Encode a video frame and produce output chunks for subscribers. The frame is processed according to the encoder's configuration (e.g., delta encoding, thresholding) and compressed using Zstd. The resulting encoded chunk is then pushed to all active subscriptions. If the encoder is not running, this method should return immediately without processing the frame."""
        ...
