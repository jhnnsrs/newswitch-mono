import { useMemo } from "react";

export const useCurrentPixelDimensions = (): {
  width: number;
  height: number;
} => {
  return useMemo(() => ({ width: 1024, height: 1024 }), []);
};
