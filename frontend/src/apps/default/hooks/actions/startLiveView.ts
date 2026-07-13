import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const StartLiveViewArgsSchema = z.object({});
export const StartLiveViewReturnSchema = z.object({
  return0: z.string(),
});

// --- Types ---
export type StartLiveViewArgs = z.infer<typeof StartLiveViewArgsSchema>;
export type StartLiveViewReturn = z.infer<typeof StartLiveViewReturnSchema>;

// --- Definition ---
export const StartLiveViewDefinition: ActionDefinition<
  StartLiveViewArgs,
  StartLiveViewReturn
> = {
  name: 'start_live_view',
  appKey: 'default',
  description:
    'Call this to begin streaming frames captured by the detector\nto connected video clients.',
  argsSchema: StartLiveViewArgsSchema,
  returnSchema: StartLiveViewReturnSchema,
  lockKeys: ['camera_parameters'],
};

/**
 * Call this to begin streaming frames captured by the detector
to connected video clients.
 */
export const useStartLiveView = () => {
  return useAction(StartLiveViewDefinition);
};
