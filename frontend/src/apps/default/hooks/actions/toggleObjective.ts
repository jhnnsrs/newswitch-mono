import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const ToggleObjectiveArgsSchema = z.object({});
export const ToggleObjectiveReturnSchema = z.object({});

// --- Types ---
export type ToggleObjectiveArgs = z.infer<typeof ToggleObjectiveArgsSchema>;
export type ToggleObjectiveReturn = z.infer<typeof ToggleObjectiveReturnSchema>;

// --- Definition ---
export const ToggleObjectiveDefinition: ActionDefinition<
  ToggleObjectiveArgs,
  ToggleObjectiveReturn
> = {
  name: 'toggle_objective',
  appKey: 'default',
  description: 'Toggle to the next objective in the turret.',
  argsSchema: ToggleObjectiveArgsSchema,
  returnSchema: ToggleObjectiveReturnSchema,
  lockKeys: ['objective'],
};

/**
 * Toggle to the next objective in the turret.
 */
export const useToggleObjective = () => {
  return useAction(ToggleObjectiveDefinition);
};
