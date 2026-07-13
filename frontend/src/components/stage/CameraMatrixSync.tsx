import { useFrame, useThree } from "@react-three/fiber";
import { useViewStore } from "@/store/viewStore";
import * as THREE from "three";
import { useRef } from "react";

export const CameraMatrixSync = () => {
  const updateCameraData = useViewStore((s) => s.updateCameraData);
  const { camera, size } = useThree();

  // Use refs to avoid allocating new objects every frame
  const matrixRef = useRef(new THREE.Matrix4());
  const lastMatrixString = useRef("");

  useFrame(() => {
    // Combine projection and world-inverse matrices
    matrixRef.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );

    // Fast equality check: convert to string to see if the camera actually moved
    // This prevents React from re-rendering your UI 60 times a second if the camera is still!
    const matrixString = matrixRef.current.elements.join(",");

    if (matrixString !== lastMatrixString.current) {
      lastMatrixString.current = matrixString;

      // Push clone to store so external components get the new reference
      updateCameraData(matrixRef.current.clone(), {
        width: size.width,
        height: size.height,
      });
    }
  });

  return null;
};
