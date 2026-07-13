"""
Virtual Stage Manager

A virtual stage/positioner manager for microscopy simulation.
Handles X, Y, Z, and A (angle) positioning.
"""

from dataclasses import dataclass
from typing import Optional
import uuid

from newswitch.protocols.stage import StageState
from newswitch.protocols.serial_manager import SerialManager
from rekuest_next import model
from .serial_manager import JSONCommand


@model
@dataclass
class StageConfig:
    """Configuration for the virtual stage."""

    z_steps: int = 100
    pattern: str = "raster"
    min_x: float = -10000.0
    max_x: float = 10000.0


class UC2GalvoScanner:
    """
    Docstring for Manager
    """

    state: StageState

    def __init__(self, stage_state: StageState, serial_manager: SerialManager) -> None:
        """Start the manager with the given state and serial manager."""
        self.serial_manager = serial_manager
        self.stage_state = stage_state
        self.state = stage_state

    def move(
        self,
        x: Optional[float] = None,
        y: Optional[float] = None,
        z: Optional[float] = None,
        a: Optional[float] = None,
        step_size: Optional[float] = None,
        is_absolute: bool = False,
    ) -> None:
        """
        Move the stage to a new position (protocol method).

        Args:
            x: X position (absolute) or offset (relative)
            y: Y position (absolute) or offset (relative)
            z: Z position (absolute) or offset (relative)
            a: Angle position (absolute) or offset (relative)
            is_absolute: If True, values are absolute positions.
                        If False, values are relative offsets.

        Returns:
            The new stage position after the move.
        """
        qid = uuid.uuid4().hex

        self.serial_manager.run(
            JSONCommand(
                task="move_stage",
                assign_params={
                    "x": x,
                    "y": y,
                    "z": z,
                    "a": a,
                    "is_absolute": is_absolute,
                    "step_size": step_size,
                },
                qid=qid,
            ),
            cancel_command=JSONCommand(
                task="cancel_move_stage",
                assign_params={
                    "x": x,
                    "y": y,
                    "z": z,
                    "a": a,
                    "is_absolute": is_absolute,
                },
                qid=qid,
            ),
            pause_command=JSONCommand(
                task="pause_move_stage",
                assign_params={
                    "x": x,
                    "y": y,
                    "z": z,
                    "a": a,
                    "is_absolute": is_absolute,
                },
                qid=qid,
            ),
            unpause_command=JSONCommand(
                task="unpause_move_stage",
                assign_params={
                    "x": x,
                    "y": y,
                    "z": z,
                    "a": a,
                    "is_absolute": is_absolute,
                },
                qid=qid,
            ),
        )

    def move_home(self) -> None:
        """Move the stage to the home position (0, 0, 0, 0) (protocol method)."""
        return self.move(x=0.0, y=0.0, z=0.0, a=0.0, is_absolute=True)

    @staticmethod
    def _clamp(value: float, min_val: float, max_val: float) -> float:
        """Clamp a value to the specified range."""
        return max(min_val, min(max_val, value))
