import { useStageState } from "@/apps/default/hooks/states/StageState";
import { useModeStore } from "@/store/modeStore";
import { Line } from "@react-three/drei";

export const StageAxis = () => {
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

  return (
    <group>
      <Line
        points={[
          [-stageRangeX / 2, 0, 0.1],
          [stageRangeX / 2, 0, 0.1],
        ]}
        color="#ef4444"
        lineWidth={1}
      />
      <Line
        points={[
          [0, -stageRangeY / 2, 0.1],
          [0, stageRangeY / 2, 0.1],
        ]}
        color="#22c55e"
        lineWidth={1}
      />
    </group>
  );
};
