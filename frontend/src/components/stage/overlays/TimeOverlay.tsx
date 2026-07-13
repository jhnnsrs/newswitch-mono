"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExpanseState } from "@/apps/default/hooks/states";
import { useSelectionStore } from "@/store/imageStore";
import { useTimeStoreApi } from "@/store/timeStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const DEBOUNCE_MS = 180;
const IMAGE_ZOOM_WINDOW_PERCENT = 16;

export const TimeOverlay = () => {
  const { data: currentImages } = useExpanseState({
    subscribe: true,
    selector: (s) => s.current_images,
  });

  const [sliderValue, setSliderValue] = useState<[number, number]>([0, 100]);
  const [debouncedSliderValue, setDebouncedSliderValue] = useState<
    [number, number]
  >([0, 100]);
  const [isHovered, setIsHovered] = useState(false);

  const setSelectedImageId = useSelectionStore((s) => s.setSelectedImageId);
  const timeStoreApi = useTimeStoreApi();

  const imageTimesMs = useMemo(() => {
    return (currentImages ?? [])
      .map((image) => Date.parse(image.metadata.acquisition_time))
      .filter((ms) => Number.isFinite(ms))
      .sort((left, right) => left - right);
  }, [currentImages]);

  const timeBounds = useMemo(() => {
    if (imageTimesMs.length === 0) return null;
    const minTimeMs = imageTimesMs[0];
    const newestImageMs = imageTimesMs[imageTimesMs.length - 1];
    return {
      from: new Date(minTimeMs),
      to: new Date(newestImageMs),
      spanMs: Math.max(newestImageMs - minTimeMs, 1),
    };
  }, [imageTimesMs]);

  const timelineImages = useMemo(() => {
    if (!timeBounds) return [];
    const seen = new Set<string>();
    return (currentImages ?? [])
      .map((image) => {
        const ms = Date.parse(image.metadata.acquisition_time);
        if (!Number.isFinite(ms)) return null;
        const rawPercent =
          ((ms - timeBounds.from.getTime()) / timeBounds.spanMs) * 100;
        const percent = Math.max(
          0,
          Math.min(100, Number(rawPercent.toFixed(2))),
        );
        return {
          id: image.id,
          ms,
          percent,
          label: new Date(ms).toLocaleTimeString(),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => {
        const key = `${item.id}-${item.percent}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((left, right) => left.ms - right.ms);
  }, [currentImages, timeBounds]);

  const zoomToImage = (percent: number, imageId: string) => {
    const halfWindow = IMAGE_ZOOM_WINDOW_PERCENT / 2;
    let from = Math.max(0, percent - halfWindow);
    let to = Math.min(100, percent + halfWindow);
    if (to - from < IMAGE_ZOOM_WINDOW_PERCENT) {
      if (from === 0) to = Math.min(100, IMAGE_ZOOM_WINDOW_PERCENT);
      else if (to === 100) from = Math.max(0, 100 - IMAGE_ZOOM_WINDOW_PERCENT);
    }
    const nextValue: [number, number] = [from, to];
    setSelectedImageId(imageId);
    setSliderValue(nextValue);
    setDebouncedSliderValue(nextValue);
  };

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedSliderValue(sliderValue),
      DEBOUNCE_MS,
    );
    return () => window.clearTimeout(id);
  }, [sliderValue]);

  useEffect(() => {
    if (!timeBounds) return;
    timeStoreApi.getState().setRange(timeBounds.from, timeBounds.to);
  }, [timeBounds, timeStoreApi]);

  useEffect(() => {
    if (!timeBounds) return;
    const fromTime =
      timeBounds.from.getTime() +
      (timeBounds.spanMs * debouncedSliderValue[0]) / 100;
    const toTime =
      timeBounds.from.getTime() +
      (timeBounds.spanMs * debouncedSliderValue[1]) / 100;
    timeStoreApi
      .getState()
      .setInterval(new Date(fromTime), new Date(Math.max(fromTime, toTime)));
  }, [debouncedSliderValue, timeBounds, timeStoreApi]);

  if (!timeBounds) return null;

  return (
    <>
      {/* Transparent Trigger Zone (Bottom 15% of screen) */}
      <div
        className="absolute inset-x-0 bottom-0 z-[45] h-32 bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 120 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="absolute inset-x-0 bottom-6 z-50 flex justify-center px-6"
          >
            <div className="relative flex w-full max-w-4xl flex-col items-center rounded-full bg-background/80 px-8 py-6 shadow-2xl backdrop-blur-xl border border-border/50">
              <div className="relative w-full h-4 flex items-center">
                {/* Ticks */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  {timelineImages.map((tick) => (
                    <Popover key={tick.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="pointer-events-auto absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/60 transition-all hover:bg-primary hover:h-6 hover:w-[4px] shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                              style={{ left: `${tick.percent}%` }}
                              onClick={() => setSelectedImageId(tick.id)}
                            />
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">{tick.label}</TooltipContent>
                      </Tooltip>

                      <PopoverContent
                        className="w-64"
                        side="top"
                        align="center"
                      >
                        <PopoverHeader>
                          <PopoverTitle className="text-sm font-bold">
                            Image {tick.id}
                          </PopoverTitle>
                          <PopoverDescription className="text-xs">
                            {new Date(tick.ms).toLocaleString()}
                          </PopoverDescription>
                        </PopoverHeader>
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => zoomToImage(tick.percent, tick.id)}
                          >
                            Zoom to image
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>

                <Slider
                  className="w-full cursor-pointer [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-range]]:bg-primary/60"
                  value={sliderValue}
                  onValueChange={(value) =>
                    setSliderValue(value as [number, number])
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
