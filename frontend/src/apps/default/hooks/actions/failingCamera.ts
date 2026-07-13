import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const FailingCameraArgsSchema = z.object({
  intensity: z.number(),
});
export const FailingCameraReturnSchema = z.object({
  return0: z.string(),
});

// --- Types ---
export type FailingCameraArgs = z.infer<typeof FailingCameraArgsSchema>;
export type FailingCameraReturn = z.infer<typeof FailingCameraReturnSchema>;

// --- Definition ---
export const FailingCameraDefinition: ActionDefinition<
  FailingCameraArgs,
  FailingCameraReturn
> = {
  name: 'failing_camera',
  appKey: 'default',
  description: 'A function that always fails to test lock release.',
  argsSchema: FailingCameraArgsSchema,
  returnSchema: FailingCameraReturnSchema,
  lockKeys: ['stage_position'],
};

/**
 * A function that always fails to test lock release.
 */
export const useFailingCamera = () => {
  return useAction(FailingCameraDefinition);
};
