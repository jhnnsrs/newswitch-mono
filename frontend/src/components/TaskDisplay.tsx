
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useCancelTask } from "@/apps/default/hooks/useCancelTask";
import { useResumeTask } from "@/apps/default/hooks/useResumeTask";
import { usePauseTask } from "@/apps/default/hooks/usePauseTask";
import { useTaskStore } from "@/apps/default/hooks/useTaskStore";
import { selectTask } from "@/lib/rekuest/task/store";

export const ProgressDisplay = (props: {
  activeTaskId: string | null | undefined;

}) => {
  const activeTaskId = props.activeTaskId;

  // Use the built-in selector which safely resolves both local references and server IDs
  const task = useTaskStore(
    activeTaskId ? selectTask(activeTaskId) : () => undefined,
  );

  const cancel = useCancelTask();
  const resume = useResumeTask();
  const pause = usePauseTask();

  // 1. No active lock at all
  if (!activeTaskId) return null;

  // 2. Lock exists, but the task is not in our local store (initiated by another user/app)
  if (!task) {
    return (
      <div className="flex items-center justify-between text-muted-foreground text-sm p-3 bg-muted/50 rounded-lg">
        <span>Another app is controlling the stage</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => cancel(activeTaskId)}
        >
          Cancel
        </Button>
      </div>
    );
  }

  // 3. Lock exists AND the task was initiated locally (we have progress and status)
  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Moving stage...</span>
        {task.progress !== null && task.progress !== undefined && (
          <span className="font-mono font-semibold">
            {Math.round(task.progress)}%
          </span>
        )}
      </div>
      <Progress value={task.progress ?? 0} className="h-1.5" />
      <div className="flex flex-row w-full gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => cancel(activeTaskId)}
        >
          Cancel
        </Button>
        {task.status === "paused" ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 animate-pulse"
            onClick={() => resume(activeTaskId)}
          >
            Resume
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => pause(activeTaskId)}
          >
            Pause
          </Button>
        )}
      </div>
    </div>
  );
};
