import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useBlockingLock } from "@/lib/rekuest/locks/store";
import { Lock } from "lucide-react";
import * as React from "react";

interface LockedSliderProps extends React.ComponentProps<typeof Slider> {
  lockKeys?: string[];
}

export function LockedSlider({
  lockKeys = [],
  className,
  disabled,
  ...props
}: LockedSliderProps) {
  const { isLocked, lockKey: blockingLock, lockingTaskId: blockingTaskId } =
    useBlockingLock(lockKeys);

  const slider = (
    <div className={cn("relative", isLocked && "opacity-60")}>
      <Slider
        className={cn(className)}
        disabled={disabled || isLocked}
        {...props}
      />
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );

  if (isLocked && !disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{slider}</TooltipTrigger>
          <TooltipContent>
            <p>Blocked by task: {blockingTaskId}</p>
            {blockingLock && (
              <p className="text-xs text-muted-foreground">
                Lock: {blockingLock}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return slider;
}
