"""Estimation and validation of the 3D affine matrix mapping pixel to stage coordinates."""

import numpy as np
from dataclasses import dataclass
from typing import List
from pystackreg import StackReg

from newswitch.protocols.stage import StageState
from newswitch.protocols.objective import ObjectiveLens
from newswitch.protocols.detector import Detector


@dataclass
class AffineMatrix:
    """A fitted 4x4 pixel-to-stage affine matrix together with its least-squares fit quality."""

    matrix: np.ndarray
    residuals: np.ndarray
    rank: int
    singular_values: np.ndarray


def calculate_3d_affine(
    images: List[np.ndarray], stage_positions: List[StageState]
) -> AffineMatrix:
    """
    Calculates the 4x4 3D affine matrix mapping [x, y, z, 1] pixel coordinates
    to [X, Y, Z, 1] stage microns.

    :param images: List of numpy arrays (2D images).
    :param stage_positions: List of StageTest dataclass objects.
    :return: 4x4 Affine Matrix.
    """
    if len(images) != len(stage_positions):
        raise ValueError("Image list and stage position list must be the same length.")

    sr = StackReg(StackReg.TRANSLATION)

    # We define the first image as the origin in 'Voxel Space'
    voxel_coords = [[0.0, 0.0, 0.0]]
    # We take the absolute 'World Space' coordinates directly
    world_coords = [[p.x, p.y, p.z] for p in stage_positions]

    current_px_x = 0.0
    current_px_y = 0.0

    # Calculate relative pixel shifts and accumulate them
    for i in range(len(images) - 1):
        # Register images[i+1] relative to images[i]
        tmat = sr.register(images[i], images[i + 1])

        # tmat[0, 2] is shift in x, tmat[1, 2] is shift in y
        current_px_x += tmat[0, 2]
        current_px_y += tmat[1, 2]

        # We assume each image in the list represents one 'step' in the Z-stack
        current_px_z = float(i + 1)

        voxel_coords.append([current_px_x, current_px_y, current_px_z])

    # Convert to Homogeneous coordinates by adding a column of ones
    # V: Voxel/Pixel Matrix (N x 4)
    # W: World/Stage Matrix (N x 4)
    V = np.hstack([np.array(voxel_coords), np.ones((len(voxel_coords), 1))])
    W = np.hstack([np.array(world_coords), np.ones((len(world_coords), 1))])

    # Solve the linear system: W = V @ M.T
    # This finds the matrix M that best maps V to W in a least-squares sense.
    affine_matrix_T, residuals, rank, singular_values = np.linalg.lstsq(V, W, rcond=None)
    affine_matrix = affine_matrix_T.T

    return AffineMatrix(
        matrix=affine_matrix, residuals=residuals, rank=int(rank), singular_values=singular_values
    )


@dataclass
class CalibrationMetrics:
    """Strongly typed container for all physical validation metrics."""

    mag_deviation_pct: float
    aspect_ratio: float
    ortho_error_deg: float
    determinant_sign: float
    mean_squared_error: float
    z_scaling_um: float


@dataclass
class ValidationResult:
    """Outcome of the calibration sanity checks run against a fitted affine matrix."""

    is_valid: bool
    summary: str
    metrics: CalibrationMetrics
    warnings: List[str]


def check_calibration(
    affine_matrix: AffineMatrix,
    objective: ObjectiveLens,
    detector: Detector,
    tolerance_pct: float = 15.0,
) -> ValidationResult:
    """
    Runs a battery of tests to verify the integrity of the 3D affine matrix
    and returns a typed ValidationResult.
    """
    # 1. Vector Extraction
    # Columns of the matrix are the basis vectors (microns per unit pixel)
    vec_x = affine_matrix.matrix[:3, 0]
    vec_y = affine_matrix.matrix[:3, 1]
    vec_z = affine_matrix.matrix[:3, 2]

    # 2. Magnification Check
    # Area scaling in XY
    measured_px_size = np.sqrt(np.abs(np.linalg.det(affine_matrix.matrix[:2, :2])))
    theoretical_px_size = detector.pixel_size_um / objective.magnification
    mag_error = abs(measured_px_size - theoretical_px_size) / theoretical_px_size * 100

    # 3. Aspect Ratio (X scale vs Y scale)
    scale_x, scale_y = np.linalg.norm(vec_x[:2]), np.linalg.norm(vec_y[:2])
    aspect_ratio = scale_x / scale_y

    # 4. Orthogonality (Shear)
    dot_prod = np.dot(vec_x[:2], vec_y[:2])
    cos_theta = dot_prod / (scale_x * scale_y)
    ortho_error = abs(90 - np.degrees(np.arccos(np.clip(cos_theta, -1.0, 1.0))))

    # 5. Statistical & Handedness
    det_sign = np.sign(np.linalg.det(affine_matrix.matrix[:2, :2]))
    mse = np.mean(affine_matrix.residuals) if affine_matrix.residuals.size > 0 else 0.0
    z_scale = np.linalg.norm(vec_z)

    # --- Validation Logic ---
    warnings: list[str] = []
    pass_mag = mag_error <= tolerance_pct
    if not pass_mag:
        warnings.append(f"Mag mismatch: {mag_error:.1f}% deviation")

    pass_aspect = 0.95 <= aspect_ratio <= 1.05
    if not pass_aspect:
        warnings.append(f"Non-square pixels: aspect ratio {aspect_ratio:.3f}")

    pass_ortho = ortho_error < 2.0
    if not pass_ortho:
        warnings.append(f"Axes skew detected: {ortho_error:.2f}° from 90°")

    pass_mse = mse < 1.0
    if not pass_mse:
        warnings.append(f"High fit error: MSE {mse:.4f}")

    # Build typed metrics object
    metrics = CalibrationMetrics(
        mag_deviation_pct=mag_error,
        aspect_ratio=aspect_ratio,
        ortho_error_deg=ortho_error,
        determinant_sign=det_sign,
        mean_squared_error=mse,
        z_scaling_um=z_scale,
    )

    overall_pass = all([pass_mag, pass_aspect, pass_ortho, pass_mse])
    status_msg = "✅ CALIBRATION VALID" if overall_pass else "❌ CALIBRATION INVALID"

    return ValidationResult(
        is_valid=overall_pass, summary=status_msg, metrics=metrics, warnings=warnings
    )
