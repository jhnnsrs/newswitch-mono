"""LightPathManager for calculating and managing the current light path through the microscope based on the current configuration of objectives, filters, illumination, and detectors."""

from __future__ import annotations

import math

from kaffine import Affine

from newswitch.protocols.core import (
    DetectorKube,
    DichroicKube,
    FilterBankKube,
    FilterKube,
    IlluminationKube,
    LightEdge,
    LightPath,
    ObjectiveTurretKube,
    StageKube,
)
from newswitch.protocols.detector import CameraState, Detector
from newswitch.protocols.filter_bank import Filter, FilterBankState
from newswitch.protocols.illumination import IlluminationState
from newswitch.protocols.light_path import LightPathState
from newswitch.protocols.objective import ObjectiveLens, ObjectiveState

# Create a transform: Move 10 units X, then Rotate 45 deg Z
# (Note: Order is intuitive "Operation 1 -> Operation 2")


def create_affine_matrix(
    position_x: float, position_y: float, position_z: float
) -> list[list[float]]:
    """Helper function to create a simple affine transformation matrix based on the provided position."""
    # This is a placeholder implementation. In a real implementation, this would involve more complex logic to create an affine transformation matrix based on the microscope's optical configuration.
    return [
        [1.0, 0.0, 0.0, position_x],
        [0.0, 1.0, 0.0, position_y],
        [0.0, 0.0, 1.0, position_z],
        [0.0, 0.0, 0.0, 1.0],
    ]


class LightPathManager:
    """Registry and execution for acquisition hooks."""

    def __init__(
        self,
        light_path_state: LightPathState,
        illumination_state: IlluminationState,
        filter_bank_state: FilterBankState,
        objective_state: ObjectiveState,
        camera_state: CameraState,
    ) -> None:
        """Initialize the LightPathManager with the provided ObjectiveState and CameraState."""
        self.state = light_path_state
        self.objective_state = objective_state
        self.filter_bank_state = filter_bank_state
        self.camera_state = camera_state
        self.illumination_state = illumination_state

    def _calculate_kube_hash(
        self, objective: ObjectiveLens, detector: Detector, filter: Filter
    ) -> str:
        """Calculate a unique hash for the current light path configuration."""
        # Placeholder logic to calculate a hash based on the objective and camera states
        # In a real implementation, this would involve more complex logic based on the microscope's optical configuration
        return f"hash_{objective.slot}_{detector.slot}_{filter.slot}"

    def calculate_possible_light_paths(self) -> list[LightPath]:
        """Calculate possible light paths based on the current microscope configuration."""
        # Placeholder logic to calculate possible light paths based on the objective and camera states
        # In a real implementation, this would involve more complex logic based on the microscope's optical configuration
        possible_light_paths: list[LightPath] = []
        for detector in self.camera_state.detectors:
            illumination_kubes: list[IlluminationKube] = []
            ill_dichroic_edges: list[LightEdge] = []

            dichroic_kube = DichroicKube(
                kube_id="dichroic_0",
                slot_id=0,  # Dichroic doesn't have a physical slot, so we can set this to a default value or calculate it based on the objective and filter
                affine_matrix=Affine.new().translate_z(120).to_four_by_four_list(),
            )

            arc_length = 360 / max(1, len(self.illumination_state.illuminations))
            radial_distance = 40

            for il, illumination in enumerate(self.illumination_state.illuminations):
                x_position = radial_distance * math.cos(math.radians(il * arc_length))
                y_position = radial_distance * math.sin(math.radians(il * arc_length))

                illumination_kubes.append(
                    IlluminationKube(
                        kube_id=f"illumination_{illumination.slot}",
                        slot_id=illumination.slot,
                        affine_matrix=Affine.new()
                        .translate_z(180)
                        .translate_x(x_position)
                        .translate_y(y_position)
                        .to_four_by_four_list(),
                    )
                )
                ill_dichroic_edges.append(
                    LightEdge(
                        source=f"illumination_{illumination.slot}",
                        target=dichroic_kube.kube_id,
                        intensity=1.0,
                    )
                )

            uv_filter = FilterKube(
                kube_id="uv_filter_0",
                wavelength=365,
                affine_matrix=Affine.new().translate_z(100).to_four_by_four_list(),
            )

            stage_kube = StageKube(
                kube_id="stage_0",
                slot_id=0,
                affine_matrix=Affine.new().translate_z(0).to_four_by_four_list(),
            )

            objective_turret_kube = ObjectiveTurretKube(
                kube_id="objectiveturret_0",
                affine_matrix=Affine.new().rotate_x(180).translate_z(-70).to_four_by_four_list(),
            )

            filter_bank_kube = FilterBankKube(
                kube_id="filterbank_0",
                affine_matrix=Affine.new().translate_z(-150).to_four_by_four_list(),
            )

            detector_kube = DetectorKube(
                kube_id=f"detector_{detector.slot}",
                slot_id=detector.slot,
                affine_matrix=Affine.new().rotate_x(180).translate_z(-240).to_four_by_four_list(),
            )

            light_path = LightPath(
                kubes=[
                    *illumination_kubes,
                    dichroic_kube,
                    uv_filter,
                    stage_kube,
                    objective_turret_kube,
                    filter_bank_kube,
                    detector_kube,
                ],
                edges=[
                    *ill_dichroic_edges,
                    LightEdge(
                        source=dichroic_kube.kube_id,
                        target=stage_kube.kube_id,
                        intensity=1.0,
                    ),
                    LightEdge(
                        source=stage_kube.kube_id,
                        target=objective_turret_kube.kube_id,
                        intensity=1.0,
                    ),
                    LightEdge(
                        source=stage_kube.kube_id,
                        target=objective_turret_kube.kube_id,
                        intensity=1.0,
                    ),
                    LightEdge(
                        source=objective_turret_kube.kube_id,
                        target=filter_bank_kube.kube_id,
                        intensity=1.0,
                    ),
                    LightEdge(
                        source=filter_bank_kube.kube_id,
                        target=detector_kube.kube_id,
                        intensity=1.0,
                    ),
                    LightEdge(
                        source=detector_kube.kube_id,
                        target=detector_kube.kube_id,
                        intensity=1.0,
                    ),
                ],
                detector=detector.slot,
            )
            possible_light_paths.append(light_path)
        self.state.light_paths = possible_light_paths
        return possible_light_paths

    def get_light_path_for_detector(self, detector_slot: int) -> LightPath:
        """Get the current light path based on the objective state."""
        # Placeholder logic to determine the current light path based on the objective state
        # In a real implementation, this would involve more complex logic based on the microscope's optical configuration

        for light_path in self.state.light_paths:
            if light_path.detector == detector_slot:
                self.state.current_light_path = light_path
                return light_path

        raise ValueError(
            f"No light path found for detector slot {detector_slot}. This is likely because it is not a valid combination or because calculate_possible_light_paths() has not been called to populate the light paths."
        )
