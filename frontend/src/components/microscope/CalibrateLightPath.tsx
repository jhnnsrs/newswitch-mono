import { CalibrateLightPathDefinition } from "@/apps/default/hooks/actions";
import { ActionButton } from "@/components/ActionButton";
import { useCalibrationState } from "@/apps/default/hooks/states";

export const CalibrateLightPath = () => {
  useCalibrationState({ subscribe: true });

  return (
    <div className="flex justify-center">
      <ActionButton
        action={CalibrateLightPathDefinition}
        args={{}}
        variant="outline"
        size="xs"
      >
        Calculate Pixel Sizes
      </ActionButton>
    </div>
  );
};
