import { useExpanseState } from "@/apps/default/hooks/states";
import { useSelectionStore } from "@/store/imageStore";

export const useSelectedFrame = () => {
  const selectedFrameId = useSelectionStore((s) => s.selectedFrameId);
  const { data } = useExpanseState();
  const selectedFrame = data?.current_frames?.find(
    (frame) => frame.id === selectedFrameId,
  );
  return selectedFrame;
};
