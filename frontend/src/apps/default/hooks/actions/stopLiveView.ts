import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const StopLiveViewArgsSchema = z.object({});
export const StopLiveViewReturnSchema = z.object({
  return0: z.string(),
});

// --- Types ---
export type StopLiveViewArgs = z.infer<typeof StopLiveViewArgsSchema>;
export type StopLiveViewReturn = z.infer<typeof StopLiveViewReturnSchema>;

// --- Definition ---
export const StopLiveViewDefinition: ActionDefinition<
  StopLiveViewArgs,
  StopLiveViewReturn
> = {
  name: 'stop_live_view',
  appKey: 'default',
  description:
    'Call this to stop streaming frames captured by the detector\nto connected video clients.',
  argsSchema: StopLiveViewArgsSchema,
  returnSchema: StopLiveViewReturnSchema,
  lockKeys: ['camera_parameters'],
};

/**
 * Call this to stop streaming frames captured by the detector
to connected video clients.
 */
export const useStopLiveView = () => {
  return useAction(StopLiveViewDefinition);
};
