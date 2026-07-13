import { useMemo } from "react";
import * as THREE from "three";

export const useThreeAffine = (affine_transformation?: number[][]) => {
  const matrix = useMemo(() => {
    const mat = new THREE.Matrix4();

    if (affine_transformation) {
      // Flatten the list of lists into a single 1D array
      const flat = affine_transformation.flat();

      // .set() expects 16 arguments in row-major order
      mat.set(
        flat[0],
        flat[1],
        flat[2],
        flat[3],
        flat[4],
        flat[5],
        flat[6],
        flat[7],
        flat[8],
        flat[9],
        flat[10],
        flat[11],
        flat[12],
        flat[13],
        flat[14],
        flat[15],
      );
    }

    return mat;
  }, [affine_transformation]);

  return matrix;
};
