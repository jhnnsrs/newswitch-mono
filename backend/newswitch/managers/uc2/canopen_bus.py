"""CANopen backend for the UC2 bus, built on the ``uc2canopen`` library.

Preferred transport for openUC2 hardware (faster and multi-node). Each
physical board is a CAN node; this adapter owns the axis/peripheral →
node-id map and the micrometer ↔ step conversion. The blocking
``uc2canopen`` client is driven through its asyncio facade
(``uc2canopen.aio.AsyncUC2Client``), which runs SDO transfers off-loop and
bridges TPDO/heartbeat telemetry onto the event loop.

Requires the optional dependency ``uc2canopen>=0.2.0`` (install the
``uc2`` extra).
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, AsyncIterator, Optional

from rekuest_next import model

from newswitch.managers.uc2.event_broker import UC2EventBroker
from newswitch.protocols.uc2 import (
    BusError,
    HomingChanged,
    MotionDone,
    NodeSeen,
    PositionUpdate,
    UC2Event,
    UC2State,
)

if TYPE_CHECKING:  # pragma: no cover
    from uc2canopen.aio import AsyncUC2Client

logger = logging.getLogger(__name__)


@model
@dataclass
class UC2CanBusConfig:
    """Configuration for the CANopen transport (node map, scaling, link)."""

    interface: Optional[str] = None  # "socketcan" | "waveshare" | None (auto)
    channel: Optional[str] = None  # SocketCAN interface, e.g. "can0"
    port: Optional[str] = None  # Waveshare USB-CAN-A serial port
    bitrate: int = 500_000
    sdo_timeout: float = 2.0
    # Default openUC2 node map (one motor board per axis).
    node_x: int = 11
    node_y: int = 12
    node_z: int = 13
    node_a: int = 14
    node_led: int = 20
    node_laser: int = 21
    node_galvo: int = 30
    # Steps per micrometer (per degree for axis A). Must match the mechanics.
    steps_per_um_x: float = 1.0
    steps_per_um_y: float = 1.0
    steps_per_um_z: float = 1.0
    steps_per_deg_a: float = 1.0
    default_speed: float = 5000.0  # micrometers per second
    home_speed_steps: int = 15000
    home_direction: int = -1
    home_timeout_ms: int = 20000
    move_timeout_s: float = 120.0


class UC2CanBus:
    """UC2BusManager implementation speaking CANopen via uc2canopen."""

    state: UC2State

    def __init__(self, state: UC2State, config: Optional[UC2CanBusConfig] = None) -> None:
        """Initialize the CAN transport with shared bus state (no I/O yet)."""
        self.state = state
        self.config = config or UC2CanBusConfig()
        self._broker = UC2EventBroker()
        self._client: Optional["AsyncUC2Client"] = None
        self._connected = asyncio.Event()

    # -- mapping helpers ---------------------------------------------------------

    def node_for_axis(self, axis: str) -> int:
        """Return the CAN node id serving a stage axis."""
        nodes = {
            "X": self.config.node_x,
            "Y": self.config.node_y,
            "Z": self.config.node_z,
            "A": self.config.node_a,
        }
        return nodes[axis.upper()]

    def axis_for_node(self, node_id: int) -> Optional[str]:
        """Return the stage axis served by a CAN node id, if any."""
        for axis in ("X", "Y", "Z", "A"):
            if self.node_for_axis(axis) == node_id:
                return axis
        return None

    def scale_for_axis(self, axis: str) -> float:
        """Return steps-per-micrometer (steps-per-degree for A) of an axis."""
        scales = {
            "X": self.config.steps_per_um_x,
            "Y": self.config.steps_per_um_y,
            "Z": self.config.steps_per_um_z,
            "A": self.config.steps_per_deg_a,
        }
        return scales[axis.upper()]

    def to_steps(self, axis: str, value: float) -> int:
        """Convert micrometers (degrees for A) into hardware steps."""
        return int(round(value * self.scale_for_axis(axis)))

    def to_units(self, axis: str, steps: float) -> float:
        """Convert hardware steps into micrometers (degrees for A)."""
        return steps / self.scale_for_axis(axis)

    # -- lifecycle ------------------------------------------------------------------

    async def abackground(self) -> None:
        """Connect to the CAN bus and pump hardware events until cancelled."""
        try:
            from uc2canopen.aio import (
                AsyncUC2Client,
                HeartbeatEvent,
                HomingChangedEvent,
                MotorDoneEvent,
                MotorUpdateEvent,
            )
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "uc2canopen is not installed; install newswitch with the 'uc2' "
                "extra (uv pip install -e '.[uc2]') or pip install uc2canopen."
            ) from exc

        self._broker.bind_loop()
        client = await AsyncUC2Client.create(
            interface=self.config.interface,
            channel=self.config.channel,
            port=self.config.port,
            bitrate=self.config.bitrate,
            sdo_timeout=self.config.sdo_timeout,
        )
        self._client = client
        self.state.connected = True
        self.state.transport = "canopen"
        self._connected.set()
        logger.info("UC2 CAN bus connected (%r)", client.sync)

        try:
            async for event in client.events():
                if isinstance(event, MotorUpdateEvent):
                    axis = self.axis_for_node(event.node_id)
                    if axis is not None:
                        self._broker.publish(
                            PositionUpdate(axis=axis, position=self.to_units(axis, event.position))
                        )
                elif isinstance(event, MotorDoneEvent):
                    axis = self.axis_for_node(event.node_id)
                    if axis is not None:
                        self._broker.publish(
                            MotionDone(axis=axis, position=self.to_units(axis, event.position))
                        )
                elif isinstance(event, HomingChangedEvent):
                    axis = self.axis_for_node(event.node_id)
                    if axis is not None:
                        self._broker.publish(HomingChanged(axis=axis, status=event.status))
                elif isinstance(event, HeartbeatEvent):
                    if event.node_id not in self.state.nodes_online:
                        self.state.nodes_online = sorted(
                            set(self.state.nodes_online) | {event.node_id}
                        )
                    self._broker.publish(NodeSeen(node_id=event.node_id, nmt_state=event.nmt_state))
        except Exception as exc:
            self.state.last_error = str(exc)
            self._broker.publish(BusError(message=str(exc)))
            raise
        finally:
            self.state.connected = False
            self._connected.clear()
            await client.aclose()

    async def _require_client(self, timeout: float = 30.0) -> "AsyncUC2Client":
        """Wait for the background connection and return the async client."""
        await asyncio.wait_for(self._connected.wait(), timeout=timeout)
        assert self._client is not None
        return self._client

    # -- stage ---------------------------------------------------------------------

    async def amove_axis(
        self,
        axis: str,
        target: float,
        is_absolute: bool = False,
        speed: Optional[float] = None,
        acceleration: Optional[float] = None,
    ) -> float:
        """Move one axis (event-driven wait on the TPDO done edge)."""
        client = await self._require_client()
        speed_steps = int(abs((speed or self.config.default_speed) * self.scale_for_axis(axis)))
        final_steps = await client.move_and_wait(
            axis=0,
            position=self.to_steps(axis, target),
            speed=max(speed_steps, 1),
            acceleration=int(acceleration or 0),
            is_absolute=is_absolute,
            node_id=self.node_for_axis(axis),
            timeout=self.config.move_timeout_s,
        )
        return self.to_units(axis, final_steps)

    async def astop_axis(self, axis: str) -> None:
        """Stop one axis via the motor command word."""
        client = await self._require_client()
        await client.stop(axis=0, node_id=self.node_for_axis(axis))

    async def ahome_axis(self, axis: str) -> None:
        """Home one axis and wait for the homing-done status."""
        client = await self._require_client()
        homed = await client.home_and_wait(
            axis=0,
            speed=self.config.home_speed_steps,
            direction=self.config.home_direction,
            timeout_ms=self.config.home_timeout_ms,
            node_id=self.node_for_axis(axis),
            timeout=self.config.home_timeout_ms / 1000.0 + 10.0,
        )
        if not homed:
            raise RuntimeError(f"Homing axis {axis} failed or timed out")

    async def aget_position(self, axis: str) -> float:
        """Read one axis position (TPDO cache preferred)."""
        client = await self._require_client()
        steps = await client.get_position(axis=0, node_id=self.node_for_axis(axis))
        return self.to_units(axis, steps)

    # -- illumination -----------------------------------------------------------------

    async def aset_laser(self, channel: int, value: int) -> None:
        """Set a laser PWM channel on the laser node."""
        client = await self._require_client()
        await client.laser_set(channel=channel, pwm=value, node_id=self.config.node_laser)

    async def aled_fill(self, r: int, g: int, b: int) -> None:
        """Fill the LED matrix on the LED node."""
        client = await self._require_client()
        await client.led_fill(r=r, g=g, b=b, node_id=self.config.node_led)

    async def aled_off(self) -> None:
        """Turn the LED matrix off."""
        client = await self._require_client()
        await client.led_off(node_id=self.config.node_led)

    # -- galvo -----------------------------------------------------------------------

    async def agalvo_goto(self, x: int, y: int) -> None:
        """Issue a galvo GOTO via the command-word doorbell."""
        client = await self._require_client()
        await client.galvo_goto(x=x, y=y, node_id=self.config.node_galvo)

    async def agalvo_raster(
        self,
        x_min: int,
        x_max: int,
        y_min: int,
        y_max: int,
        nx: int,
        ny: int,
        pixel_dwell_us: int = 1,
        trigger_mode: int = 1,
        bidirectional: bool = False,
    ) -> None:
        """Configure and start a raster scan on the galvo node."""
        client = await self._require_client()
        await client.galvo_raster_scan(
            node_id=self.config.node_galvo,
            x_min=x_min,
            x_max=x_max,
            y_min=y_min,
            y_max=y_max,
            nx=nx,
            ny=ny,
            sample_period_us=pixel_dwell_us,
            enable_trigger=trigger_mode,
            bidirectional=bidirectional,
        )

    async def agalvo_stop(self) -> None:
        """Stop the galvo scan (CMD_STOP doorbell, never writes 0)."""
        client = await self._require_client()
        await client.galvo_stop(node_id=self.config.node_galvo)

    async def agalvo_status(self) -> dict[str, Any]:
        """Read decoded galvo status flags."""
        client = await self._require_client()
        return await client.galvo_status(node_id=self.config.node_galvo)

    # -- events -----------------------------------------------------------------------

    def subscribe(self) -> AsyncIterator[UC2Event]:
        """Yield typed UC2 events translated from CAN telemetry."""
        return self._broker.subscribe()
