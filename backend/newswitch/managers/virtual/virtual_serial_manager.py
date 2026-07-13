"""A simulated serial manager that stands in for the UC2 ESP32 board."""

from typing import AsyncGenerator

from newswitch.protocols.serial_manager import (
    JSONResponse,
    SerialState,
    JSONCommand,
    StateUpdate,
)


class VirtualSerialManager:
    """A virtual implementation of the SerialManager protocol for testing and development purposes."""

    state: SerialState

    def __init__(self, state: SerialState) -> None:
        """Initialize the manager with the shared serial state it reports on."""
        self.state = state

    async def abackground(self) -> None:
        """Run the manager in the background. This is a placeholder for the actual implementation."""
        print("Running VirtualSerialManager in the background (not implemented).")

    async def alisten_state(self) -> AsyncGenerator[StateUpdate, None]:
        """A mock implementation of the state listener that simulates receiving state updates from the ESP32."""
        while True:
            yield StateUpdate(state_name="example_state", data={"value": 42})
            raise Exception(
                "You are using a virtual serial manager that is not fully implemented. In a real implementation, this would listen for state updates from the ESP32 and yield them as they are received."
            )

    def run(
        self,
        command: JSONCommand,
        cancel_command: JSONCommand,
        pause_command: JSONCommand | None = None,
        unpause_command: JSONCommand | None = None,
    ) -> JSONResponse:
        """Run the interface in a synchronous context. This is a placeholder for the actual implementation that would handle serial communication in a blocking manner."""
        print(f"Received command: {command}")
        return JSONResponse(qid=command.qid, data={"status": "success"})

    async def arun(
        self,
        command: JSONCommand,
        cancel_command: JSONCommand,
        pause_command: JSONCommand | None = None,
        unpause_command: JSONCommand | None = None,
    ) -> JSONResponse:
        """Run the interface in an asynchronous context. This is a placeholder for the actual implementation that would handle serial communication in an async manner."""
        print(f"Received async command: {command}")
        return JSONResponse(qid=command.qid, data={"status": "success"})
