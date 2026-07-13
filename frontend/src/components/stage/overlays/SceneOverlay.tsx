import { ActionButton } from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ClearExpanseDefinition } from "@/apps/default/hooks/actions/clearExpanse";
import { useExpanseState } from "@/apps/default/hooks/states/ExpanseState";
import { useModeStore } from "@/store/modeStore";
import { RefreshCwIcon } from "lucide-react";
import { useViewerStore } from "@/store/viewerStore";

export const SceneOverlay = () => {
  const displayMode = useModeStore((s) => s.displayMode);
  const displayModeOptions = useModeStore((s) => s.displayModeOptions);
  const interactionModeOptions = useModeStore((s) => s.interactionModeOptions);
  const interactionMode = useModeStore((s) => s.interactionMode);
  const setInteractionMode = useModeStore((s) => s.setInteractionMode);
  const setDisplayMode = useModeStore((s) => s.setDisplayMode);
  const isDebug = useViewerStore((state) => state.debug);

  const setDebug = useViewerStore((state) => state.setDebug);
  const { data: expanseState } = useExpanseState({ subscribe: true });

  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex flex-row gap-4">
        <ButtonGroup className="">
          {displayModeOptions.map((mode) => (
            <Button
              variant={"outline"}
              size={"xs"}
              className="bg-black"
              key={mode.value}
              onClick={() => setDisplayMode(mode.value)}
              disabled={mode.value === displayMode} // Disable 3D view when in PAN mode
            >
              <span className="text-xs font-bold">{mode.label}</span>
            </Button>
          ))}
        </ButtonGroup>

        <ButtonGroup>
          {interactionModeOptions.map((mode) => (
            <Button
              variant={"outline"}
              size={"xs"}
              key={mode.value}
              onClick={() => setInteractionMode(mode.value)}
              disabled={interactionMode == mode.value} // Disable PAN mode when in 3D view
            >
              <span className="text-xs font-bold">{mode.label}</span>
            </Button>
          ))}
        </ButtonGroup>

        <ButtonGroup>
          <Button
            onClick={() => {
              setDebug(!isDebug);
            }}
            variant={isDebug ? "destructive" : "outline"}
            size={"xs"}
          >
            {isDebug ? "Disable Debug" : "Enable Debug"}
          </Button>
        </ButtonGroup>
      </div>
      <div className="absolute bottom-2 right-2 rounded bg-black/80 p-2 font-mono text-[10px] text-white">
        {expanseState?.current_images?.length ?? 0} IMAGES{" "}
        {expanseState?.current_frames?.length ?? 0} FRAMES
        <ActionButton
          action={ClearExpanseDefinition}
          args={{}}
          size={"icon-xs"}
          variant={"outline"}
        >
          <RefreshCwIcon />
        </ActionButton>
      </div>
    </>
  );
};
