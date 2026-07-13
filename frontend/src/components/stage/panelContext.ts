import { useThree } from "@react-three/fiber";
import { createContext, useContext } from "react";
import type { Vector3 } from "three";

export type RegisteredPanels = "clickWidget" | "otherPanelTypes";

export type PanelData = {
  screenPos: { x: number; y: number };
  worldPos: Vector3;
  panelType: RegisteredPanels;
};

export interface PanelContextType {
  activePanel: PanelData | null;
  openPanel: (options: PanelData) => void;
  closePanel: () => void;
}

export const PanelContext = createContext<PanelContextType | undefined>(
  undefined,
);

export const usePanel = () => {
  const context = useContext(PanelContext);
  if (!context) throw new Error("usePanel must be used within PanelProvider");
  return context;
};

export const usePanelOpen = () => {
  const { activePanel, closePanel, openPanel } = usePanel();
  const { camera, size } = useThree();
  // Note: This needs to be a child of Canvas OR we pass gl/camera manually.
  // To keep it TRULY outside, we'll use a small helper inside the canvas
  // to update the screen pixel position.

  const open = (worldPos: Vector3, panelType: RegisteredPanels) => {
    // Project the 3D world position to 2D screen coordinates
    const vector = worldPos.clone().project(camera);
    const x = ((vector.x + 1) / 2) * size.width;
    const y = ((-vector.y + 1) / 2) * size.height; // Invert Y for screen coords
    console.log(
      "Opening panel at world pos",
      worldPos,
      "which projects to screen pos",
      { x, y },
    );
    openPanel({ screenPos: { x, y }, worldPos, panelType });
  };

  return { open: open, close: closePanel, activePanel };
};
