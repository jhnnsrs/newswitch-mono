"""
Illumination Manager Protocol

Defines the protocol for illumination/LED control and associated state.
"""

from typing import Any, AsyncGenerator, Protocol, runtime_checkable
from rekuest_next.agents.context import context
from rekuest_next import state
from dataclasses import dataclass
from newswitch.protocols.base import BackgroundManager


@dataclass
class JSONCommand:
    """
    Docstring for JSONCommand
    """

    task: str
    assign_params: dict[str, Any]
    qid: str


@dataclass
class JSONResponse:
    """A response from the ESP32. This is a placeholder for the actual implementation that would handle responses from the ESP32."""

    qid: str
    data: dict[str, Any]


@dataclass
class StateUpdate:
    """A state update from the ESP32. This is a placeholder for the actual implementation that would handle state updates from the ESP32."""

    state_name: str
    data: Any


@state
@dataclass
class SerialState:
    """Active illumination source configuration."""

    active: bool = False


@context
@runtime_checkable
class SerialManager(BackgroundManager, Protocol):
    """Protocol defining the interface for background managers."""

    state: SerialState

    def alisten_state(self) -> AsyncGenerator[StateUpdate, None]:
        """Listen for state updates from the ESP32. This is a placeholder for the actual implementation."""
        ...

    def run(
        self,
        command: JSONCommand,
        cancel_command: JSONCommand,
        pause_command: JSONCommand | None = None,
        unpause_command: JSONCommand | None = None,
    ) -> JSONResponse:
        """Run the interface in a synchronous context. This is a placeholder for the actual
        implementation that would handle serial communication in a blocking manner.
        """
        ...
