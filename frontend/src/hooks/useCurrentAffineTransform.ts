import { useMemo } from "react";

export type AffineTransform4D = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
];

const DEFAULT_AFFINE_TRANSFORM: AffineTransform4D = [
  [0.32, 0, 0.0, 0.0],
  [0, 0.32, 0.0, 0.0],
  [0.0, 0.0, 0.32, 0.0],
  [0.0, 0.0, 0.0, 1.0],
];

export const useCurrentAffineTransform = (): AffineTransform4D => {
  return useMemo(() => DEFAULT_AFFINE_TRANSFORM, []);
};
