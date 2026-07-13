// Shadcn UI Imports
import { LightPathStateRender } from "@/components/lightpathstate/LightPathStateRender";
import { Card } from "@/components/ui/card";
import { useExpanseState } from "@/apps/default/hooks/states";
import { useSelectionStore } from "@/store/imageStore";

export const ImageMetadataPanel = () => {
  // 1. Get Domain Data

  const selectedImageId = useSelectionStore((s) => s.selectedImageId);
  const setSelectedImageId = useSelectionStore((s) => s.setSelectedImageId);
  const { data } = useExpanseState();
  const selectedImage = data?.current_images?.find(
    (img) => img.id === selectedImageId,
  );

  if (!selectedImage) return null;

  // BUG/TODO: this panel is disabled by an unconditional early return that was added on top
  // of the real guard above - it never renders. Behaviour preserved here; the flag is typed
  // `boolean` (instead of a bare `return null`) so the JSX below stays reachable and keeps
  // being type-checked. Remove the flag to re-enable the panel.
  const PANEL_DISABLED: boolean = true;
  if (PANEL_DISABLED) return null;

  return (
    <Card
      className="absolute -translate-x-1/2 scale-90 h-[200px] w-[400px]  z-20 pointer-events-auto"
      style={{ left: "50%", top: "50%" }}
    >
      <button
        onClick={() => setSelectedImageId(null)}
        className="text-muted-foreground hover:text-white text-xs transition-colors"
      >
        ✕
      </button>

      <LightPathStateRender path={selectedImage.metadata?.light_state} />
    </Card>
  );
};
