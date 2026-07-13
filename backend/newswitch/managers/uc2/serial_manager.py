"""Serial manager talking JSON commands to the UC2 ESP32 board, plus mock handlers for it."""

import asyncio
from typing import AsyncGenerator, Dict

from koil import unkoil
from rekuest_next import messages

from newswitch.protocols.serial_manager import (
    JSONCommand,
    JSONResponse,
    SerialState,
    StateUpdate,
)
from typing import Protocol
from rekuest_next.actors.context import install_hook
from rekuest_next.actors.types import AssignmentHook
from rekuest_next.state.lock import acquired_locks

from newswitch.protocols.stage import StageState


class MockHandler(Protocol):
    """A stand-in for the ESP32 that answers a command by pushing to the response/state queues."""

    async def __call__(
        self,
        command: JSONCommand,
        response_queue: asyncio.Queue[JSONResponse],
        state_queue: asyncio.Queue[StateUpdate],
    ) -> None:
        """Handle the command, emitting its response and any resulting state updates."""
        ...


async def mock_handle_move_state(
    command: JSONCommand,
    response_queue: asyncio.Queue[JSONResponse],
    state_queue: asyncio.Queue[StateUpdate],
) -> None:
    """A mock handler for the move command that simulates a state update after a delay."""

    await asyncio.sleep(4)  # Simulate some processing delay

    y = command.assign_params.get("y", None)
    z = command.assign_params.get("z", None)
    x = command.assign_params.get("x", None)

    if y is not None:
        state_update = StateUpdate(
            state_name="stage_position_y",
            data=command.assign_params.get("y", 0),  # Example state data
        )
        await state_queue.put(state_update)
    if x is not None:
        state_update = StateUpdate(
            state_name="stage_position_x",
            data=command.assign_params.get("x", 0),  # Example state data
        )
        await state_queue.put(state_update)
    if z is not None:
        state_update = StateUpdate(
            state_name="stage_position_z",
            data=command.assign_params.get("z", 0),  # Example state data
        )
        await state_queue.put(state_update)
    await response_queue.put(JSONResponse(qid=command.qid, data={"status": "success"}))
    print(f"Mock handler processed command: {command} and updated state.")


MOCK_RESULTS: Dict[str, MockHandler] = {
    "move_stage": mock_handle_move_state,
}


class UC2SerialManager:
    """A manager for handling serial communication with the ESP32. This is a placeholder for the actual implementation that would handle serial communication with the ESP32."""

    stage_state: StageState
    state: SerialState
    _running_commands: dict[str, JSONCommand] = {}
    _running_tasks: dict[str, asyncio.Task[JSONResponse]] = {}
    _running_futures: dict[str, asyncio.Future[JSONResponse]] = {}
    _send_queue: asyncio.Queue[JSONCommand] | None = None
    _receive_queue: asyncio.Queue[JSONResponse] | None = None
    _state_queue: asyncio.Queue[StateUpdate] | None = None

    def __init__(
        self, state: SerialState, stage_state: StageState, port: str, baudrate: int
    ) -> None:
        """initialize the serial interface, set up queues for sending and receiving commands and responses."""
        self.state = state
        self.stage_state = stage_state
        self.port = port  # Placeholder for serial port configuration
        self.baudrate = baudrate  # Placeholder for baudrate configuration
        self._running_commands = {}
        self._running_tasks = {}
        self._receive_queue = None
        self._state_queue = None

    async def aprocess_state(self) -> None:
        """Run the manager in the background. This is a placeholder for the actual implementation."""
        print("Running Manager in the background (not implemented).")
        if self._state_queue is None:
            raise RuntimeError("ESP32Interface not initialized with a state queue")

        with acquired_locks("stage_position"):
            while True:
                message = await self._state_queue.get()
                print(f"Received state update: {message}")
                if message.state_name == "stage_position_y":
                    print(f"Updating stage state with new Y position: {message.data}")
                    self.stage_state.y = message.data
                elif message.state_name == "stage_position_x":
                    print(f"Updating stage state with new X position: {message.data}")
                    self.stage_state.x = message.data
                elif message.state_name == "stage_position_z":
                    print(f"Updating stage state with new Z position: {message.data}")
                    self.stage_state.z = message.data
                else:
                    print(f"Unknown state update received: {message.state_name}")

    async def asend_command(self, command: JSONCommand) -> None:
        """Send a command to the ESP32."""
        print(f"Sending command to ESP32: {command}")
        if self._send_queue is None:
            raise RuntimeError("ESP32Interface not initialized with a send queue")
        self._running_commands[command.qid] = command
        await self._send_queue.put(command)

    async def areceive_response(self) -> None:
        """Receive a response from the ESP32."""
        # In a real implementation, this would read from a serial port or network socket
        # For this mock, we just wait for a response to be put in the receive queue
        while True:
            response = await self._receive_queue.get()
            print(f"Received response from ESP32: {response}")

            if response.qid in self._running_futures:
                future = self._running_futures.pop(response.qid)
                future.set_result(response)
            else:
                print(f"Received response with unknown qid: {response.qid}")

    async def mock_resolver(self) -> None:
        """A mock resolver that simulates receiving responses from the ESP32."""
        while True:
            if (
                self._send_queue is not None
                and self._receive_queue is not None
                and self._state_queue is not None
            ):
                command = await self._send_queue.get()
                # Simulate processing the command and generating a response
                method = MOCK_RESULTS.get(command.task)
                if method is not None:
                    await method(command, self._receive_queue, self._state_queue)
                else:
                    response = JSONResponse(qid=command.qid, data={"status": "failure"})
                    await self._receive_queue.put(response)
            else:
                await asyncio.sleep(0.1)  # Wait for queues to be initialized

    async def astart(self, prebuffered: list[JSONCommand] | None = None) -> None:
        """Initialize the ESP32 interface with a send queue."""
        self._send_queue = asyncio.Queue()
        self._receive_queue = asyncio.Queue()
        self._state_queue = asyncio.Queue()
        self._receiver_task = asyncio.create_task(self.areceive_response())
        self._receiver_task.add_done_callback(
            lambda t: print(f"Receiver task ended with exception: {t.exception()}")
        )
        self._state_task = asyncio.create_task(self.aprocess_state())
        await self.mock_resolver()

    def create_pause_hook(self, pause_command: JSONCommand) -> AssignmentHook:
        """Create a hook that can be used to pause the current command."""

        async def hook(message: messages.ToAgentMessage) -> None:
            print("Pause hook triggered, sending pause command to ESP32.")
            await self.asend_command(pause_command)

        return AssignmentHook(kind="pause", hook=hook)

    def create_unpause_hook(self, unpause_command: JSONCommand) -> AssignmentHook:
        """Create a hook that can be used to unpause the current command."""

        async def hook(message: messages.ToAgentMessage) -> None:
            print("Unpause hook triggered, sending unpause command to ESP32.")
            await self.asend_command(unpause_command)

        return AssignmentHook(kind="unpause", hook=hook)

    async def arun(
        self,
        command: JSONCommand,
        cancel_command: JSONCommand | None = None,
        pause_command: JSONCommand | None = None,
        unpause_command: JSONCommand | None = None,
    ) -> JSONResponse:
        """Send a command to the ESP32 and await its response.

        Installs pause/unpause actor hooks when those commands are given, and sends
        `cancel_command` to the board if the awaiting task is cancelled.
        """
        # We install actor-hooks for pausing and unpausing if they are provided. These hooks can be triggered by the actor to pause or unpause the command execution.
        if pause_command:
            install_hook(self.create_pause_hook(pause_command))
        if unpause_command:
            install_hook(self.create_unpause_hook(unpause_command))

        # We store the running command and a future that will be completed when the response is received. We then send the command to the ESP32 and wait for the future to be completed with the response. If the future is cancelled (e.g., if the actor triggers a cancellation), we send the cancel command to the ESP32.
        self._running_commands[command.qid] = command
        self._running_futures[command.qid] = asyncio.Future()
        await self.asend_command(command)
        try:
            # We wait for the response to be received and return it. If the future is cancelled, we send the cancel command to the ESP32 and re-raise the cancellation.
            return await self._running_futures[command.qid]
        except asyncio.CancelledError:
            # If the command is cancelled, we send the cancel command to the ESP32 to stop the execution of the command, we can fire and forget,
            # or potentially check for a response before raising the cancellation to ensure that the command was cancelled successfully.
            if cancel_command:
                await self.asend_command(cancel_command)
            raise

    def run(
        self,
        command: JSONCommand,
        cancel_command: JSONCommand | None = None,
        pause_command: JSONCommand | None = None,
        unpause_command: JSONCommand | None = None,
    ) -> JSONResponse:
        """Run the interface in a synchronous context. This is a placeholder for the actual
        implementation that would handle serial communication in a blocking manner.
        """
        print("Running ESP32Interface in synchronous mode (not implemented).")
        return unkoil(self.arun, command, cancel_command, pause_command, unpause_command)

    async def abackground(self) -> None:
        """Background task for the virtual detector manager."""
        # For this simple implementation, we don't need a background loop
        # since all operations are synchronous and triggered by registered functions.
        return await self.astart()

    async def alisten_state(self) -> AsyncGenerator[StateUpdate, None]:
        """An async generator that yields state updates from the ESP32."""
        if self._state_queue is None:
            raise RuntimeError("ESP32Interface not initialized with a state queue")
        while True:
            state_update = await self._state_queue.get()
            yield state_update
