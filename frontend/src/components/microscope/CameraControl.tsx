import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useActivateDetector,
  useCaptureImage,
  useDeactivateDetector,
  useStartLiveView,
  useStopLiveView,
  useUpdateDetector,
} from "@/apps/default/hooks/actions";
import { useCameraState } from "@/apps/default/hooks/states";
import { cn } from "@/lib/utils";
import { Gauge, MonitorUp, Timer } from "lucide-react";
import { useState } from "react";
import { OptimisticSlider } from "../ui/optimistic_slider";
import { ResponsiveGrid } from "../ui/responsive-grid";

export function CameraControl() {
  const { data: cameraState, loading: stateLoading } = useCameraState({
    subscribe: true,
  });
  const {
    assign: captureImage,
    isLoading: isCapturing,
    isLocked: isCapturingLocked,
  } = useCaptureImage();
  const { assign: startLiveView, isLoading: isStartingLive } =
    useStartLiveView();
  const { assign: stopLiveView, isLoading: isStoppingLive } = useStopLiveView();
  const { assign: activateDetector, isLoading: isActivating } =
    useActivateDetector();
  const { assign: deactivateDetector, isLoading: isDeactivating } =
    useDeactivateDetector();
  const { call: updateDetector, isLoading: isUpdating } = useUpdateDetector();

  // Local state for slider dragging
  const [localExposures, setLocalExposures] = useState<Record<number, number>>(
    {},
  );
  const [localGains, setLocalGains] = useState<Record<number, number>>({});
  const [selectedDetectorSlot, setSelectedDetectorSlot] = useState<
    number | null
  >(null);

  const isLive = cameraState?.is_acquiring ?? false;
  const detectors = cameraState?.detectors ?? [];
  const activeDetectors = detectors.filter((d) => d.is_active);
  const activeSlots = new Set(activeDetectors.map((d) => d.slot));
  const hasActiveDetectors = activeSlots.size > 0;

  const getActiveDetector = (slot: number) => {
    return detectors.find((d) => d.slot === slot && d.is_active);
  };

  const handleToggleDetector = (slot: number, enabled: boolean) => {
    if (enabled) {
      activateDetector({ slot });
    } else {
      deactivateDetector({ slot });
    }
  };

  const handleExposureChange = (slot: number, value: number) => {
    setLocalExposures((prev) => ({ ...prev, [slot]: value }));
  };

  const handleExposureCommit = (slot: number) => {
    const exposure = localExposures[slot];
    if (exposure !== undefined) {
      updateDetector({ slot, exposure_time: exposure });
      setLocalExposures((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
    }
  };

  const handleGainChange = (slot: number, value: number) => {
    setLocalGains((prev) => ({ ...prev, [slot]: value }));
  };

  const handleGainCommit = (slot: number) => {
    const gain = localGains[slot];
    if (gain !== undefined) {
      updateDetector({ slot, gain });
      setLocalGains((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
    }
  };

  const handleToggleLiveView = () => {
    if (isLive) {
      stopLiveView({});
    } else {
      startLiveView({});
    }
  };

  const handleCapture = () => {
    captureImage({});
  };

  const isLiveLoading = isStartingLive || isStoppingLive;
  const isDetectorLoading = isActivating || isDeactivating;

  return (
    <div className="space-y-4">
      {/* Detectors */}
      <ResponsiveGrid>
        {detectors?.map((detector) => {
          const isActive = detector.is_active;
          const currentExposure =
            localExposures[detector.slot] ??
            detector.current_exposure_time ??
            detector.min_exposure_time;
          const currentGain =
            localGains[detector.slot] ??
            detector.current_gain ??
            detector.min_gain;
          const isExpanded = selectedDetectorSlot === detector.slot;

          return (
            <div
              key={detector.slot}
              className={cn(
                "@container min-w-0 overflow-hidden rounded-lg border transition-all",
                isActive
                  ? "bg-primary/5 border-primary/30"
                  : "bg-muted/30 border-transparent",
              )}
            >
              {/* Detector Header */}
              <div
                className="cursor-pointer p-3"
                onClick={() =>
                  setSelectedDetectorSlot(isExpanded ? null : detector.slot)
                }
              >
                <div className="flex flex-col gap-2 @[280px]:flex-row @[280px]:items-start @[280px]:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <MonitorUp
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive && "text-green-500",
                      )}
                    />
                    <span className="truncate text-sm font-medium">
                      {detector.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 @[280px]:justify-end">
                    {isActive && (
                      <span className="hidden text-xs font-mono text-muted-foreground @[340px]:inline">
                        {detector.current_exposure_time.toFixed(0)}ms /{" "}
                        {detector.current_gain.toFixed(1)}×
                      </span>
                    )}
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        handleToggleDetector(detector.slot, checked)
                      }
                      disabled={isDetectorLoading}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Compact info */}
                <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground @[360px]:grid-cols-3">
                  <span className="text-xs text-muted-foreground">
                    {detector.width}×{detector.height}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {detector.pixel_size_um}µm
                  </span>
                  <span className="hidden text-xs text-muted-foreground @[360px]:inline">
                    Slot {detector.slot}
                  </span>
                </div>
              </div>

              {/* Expanded Controls */}
              {isExpanded && isActive && (
                <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                  {/* Exposure Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Exposure
                        </span>
                      </div>
                      <span className="text-xs font-mono">
                        {currentExposure.toFixed(1)} ms
                      </span>
                    </div>
                    <OptimisticSlider
                      value={[currentExposure]}
                      onSave={(v) =>
                        updateDetector({
                          slot: detector.slot,
                          exposure_time: v[0],
                        })
                      }
                      min={detector.min_exposure_time}
                      max={detector.max_exposure_time}
                      step={0.1}
                      className="flex-1"
                      disabled={isUpdating}
                    />
                    {detector.preset_exposure_times?.length > 0 && (
                      <div className="hidden flex-wrap gap-1 @[360px]:flex">
                        {detector.preset_exposure_times
                          .slice(0, 6)
                          .map((val) => (
                            <Button
                              key={val}
                              size="sm"
                              variant={
                                Math.abs(
                                  (detector.current_exposure_time ?? 0) - val,
                                ) < 0.5
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                updateDetector({
                                  slot: detector.slot,
                                  exposure_time: val,
                                })
                              }
                              className="h-6 text-xs px-2"
                              disabled={isUpdating}
                            >
                              {val >= 1000 ? `${val / 1000}s` : `${val}ms`}
                            </Button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Gain Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Gain
                        </span>
                      </div>
                      <span className="text-xs font-mono">
                        {currentGain.toFixed(1)}×
                      </span>
                    </div>
                    <OptimisticSlider
                      value={[currentGain]}
                      onValueChange={(v) =>
                        handleGainChange(detector.slot, v[0])
                      }
                      onValueCommit={() => handleGainCommit(detector.slot)}
                      min={detector.min_gain}
                      max={detector.max_gain}
                      step={0.1}
                      className="flex-1"
                      disabled={isUpdating}
                    />
                    <div className="hidden gap-1 @[360px]:flex">
                      {[1, 2, 4, 8, 16, 32]
                        .filter(
                          (v) =>
                            v >= detector.min_gain && v <= detector.max_gain,
                        )
                        .map((val) => (
                          <Button
                            key={val}
                            size="sm"
                            variant={
                              Math.abs((detector.current_gain ?? 0) - val) < 0.1
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateDetector({ slot: detector.slot, gain: val })
                            }
                            className="flex-1 h-6 text-xs px-1"
                            disabled={isUpdating}
                          >
                            {val}×
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(!detectors || detectors.length === 0) && !stateLoading && (
          <div className="text-center py-4 text-sm text-muted-foreground col-span-full">
            No detectors available
          </div>
        )}
      </ResponsiveGrid>
    </div>
  );
}
