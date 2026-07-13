import { useStageState } from "@/apps/default/hooks/states/StageState";
import { useModeStore } from "@/store/modeStore";

/**
 * StagePlane
 * A purely visual representation of the stage's physical extent and position.
 * Has no interactive event listeners.
 */
export const StagePlane = () => {
  const { data: stageState } = useStageState({ subscribe: true });
  const interactionMode = useModeStore((s) => s.interactionMode);

  if (!stageState) return null;
  if (interactionMode === "META") return null;

  const stageRangeX = Math.max(
    200,
    (stageState?.max_x ?? 100) - (stageState?.min_x ?? -100),
  );
  const stageRangeY = Math.max(
    200,
    (stageState?.max_y ?? 100) - (stageState?.min_y ?? -100),
  );

  const gridSize = Math.max(stageRangeX, stageRangeY);
  const divisions = 20;

  return (
    <group position={[stageState.x, stageState.y, stageState.z]}>
      {/* 1. The Solid Base */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[stageRangeX, stageRangeY]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>

      {/* 2. The Functional Grid Overlay */}
      <gridHelper
        args={[gridSize, divisions, "#475569", "#1e293b"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.95]}
      />

      {/* 3. The Wireframe Boundary */}
      <mesh position={[0, 0, -0.9]}>
        <planeGeometry args={[stageRangeX, stageRangeY]} />
        <meshBasicMaterial color="#334155" wireframe wireframeLinewidth={5} />
      </mesh>
    </group>
  );
};
