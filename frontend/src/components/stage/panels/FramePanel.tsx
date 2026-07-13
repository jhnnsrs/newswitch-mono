import { Card } from "@/components/ui/card";
import { useExpanseState } from "@/apps/default/hooks/states";
import { useSelectionStore } from "@/store/imageStore";
import { useModeStore } from "@/store/modeStore";
import { useViewStore } from "@/store/viewStore";
import { useMemo } from "react";
import * as THREE from "three";

export const FramePanel = () => {
  // 1. Get Domain Data
  const selectedFrameId = useSelectionStore((s) => s.selectedFrameId);
  const selectedFrame = useExpanseState().data?.current_frames?.find(
    (f) => f.id === selectedFrameId,
  );
  const displayMode = useModeStore((s) => s.displayMode);
  const interactionMode = useModeStore((s) => s.interactionMode);

  // 2. Get Camera Data
  const viewProjectionMatrix = useViewStore((s) => s.viewProjectionMatrix);
  const viewportSize = useViewStore((s) => s.viewportSize);

  const affineMatrix = selectedFrame?.metadata.affine_matrix;
  const hasAffineMatrix = !!affineMatrix;

  // 3. Calculate 2D Screen Position
  const screenPos = useMemo(() => {
    if (!selectedFrameId || !viewProjectionMatrix || !viewportSize) return null;
    if (!hasAffineMatrix) {
      return {
        x: viewportSize.width / 2,
        y: viewportSize.height / 2,
      };
    }

    const affine = selectedFrame.metadata.affine_matrix;
    if (!affine || affine.length !== 4 || affine[0].length !== 4) return null;

    // Reconstruct the 4x4 matrix from the Python nested array
    const mat = new THREE.Matrix4();
    mat.set(
      affine[0][0],
      affine[0][1],
      affine[0][2],
      affine[0][3],
      affine[1][0],
      affine[1][1],
      affine[1][2],
      affine[1][3],
      affine[2][0],
      affine[2][1],
      affine[2][2],
      affine[2][3],
      affine[3][0],
      affine[3][1],
      affine[3][2],
      affine[3][3],
    );

    // Extract the anchor point in 3D world space (the origin of the affine matrix)
    const worldVector = new THREE.Vector3();
    worldVector.setFromMatrixPosition(mat);

    // Apply the camera's matrix to get Normalized Device Coordinates (NDC) [-1 to 1]
    worldVector.applyMatrix4(viewProjectionMatrix);

    // If Z is outside [-1, 1], the point is behind the camera or clipped out of view
    if (worldVector.z < -1 || worldVector.z > 1) return null;

    // Map NDC to actual screen pixels
    return {
      x: (worldVector.x * 0.5 + 0.5) * viewportSize.width,
      y: (worldVector.y * -0.5 + 0.5) * viewportSize.height,
    };
  }, [
    selectedFrame,
    selectedFrameId,
    viewProjectionMatrix,
    viewportSize,
    hasAffineMatrix,
  ]);

  // Early returns if data is missing or out of bounds
  if (displayMode !== "3D") return null;
  if (interactionMode === "META") return null;
  if (!selectedFrame || !screenPos) return null;

  return (
    <Card
      // Absolute positioning, centered on the calculated pixel coordinate
      className="absolute text-xs scale-90 z-20  shadow-2xl backdrop-blur-md p-4 flex flex-col"
      style={{ left: screenPos.x, top: screenPos.y }}
    >
      {selectedFrame.id}
    </Card>
  );
};
