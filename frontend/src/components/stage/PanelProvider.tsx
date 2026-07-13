import type { ReactNode } from 'react';
import { useState } from 'react';
import type { Vector3 } from 'three';
import {
  PanelContext,
  type PanelContextType,
  type RegisteredPanels,
} from './panelContext';

export const PanelProvider = ({ children }: { children: ReactNode }) => {
  const [activePanel, setActivePanel] =
    useState<PanelContextType['activePanel']>(null);

  const openPanel = (options: {
    screenPos: { x: number; y: number };
    worldPos: Vector3;
    panelType: RegisteredPanels;
  }) => {
    // We store the 3D position to calculate screen projection,
    // and the raw world coords for the text display.
    setActivePanel({ ...options });
  };

  const closePanel = () => setActivePanel(null);

  return (
    <PanelContext.Provider value={{ activePanel, openPanel, closePanel }}>
      {children}
    </PanelContext.Provider>
  );
};
