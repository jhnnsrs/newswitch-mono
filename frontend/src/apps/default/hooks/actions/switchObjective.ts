import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const SwitchObjectiveArgsSchema = z.object({
  /** Objective slot number */
  slot: z.number().describe('Objective slot number'),
});
export const SwitchObjectiveReturnSchema = z.object({});

// --- Types ---
export type SwitchObjectiveArgs = z.infer<typeof SwitchObjectiveArgsSchema>;
export type SwitchObjectiveReturn = z.infer<typeof SwitchObjectiveReturnSchema>;

// --- Definition ---
export const SwitchObjectiveDefinition: ActionDefinition<
  SwitchObjectiveArgs,
  SwitchObjectiveReturn
> = {
  name: 'switch_objective',
  appKey: 'default',
  description: 'Switch to a specific objective slot.',
  argsSchema: SwitchObjectiveArgsSchema,
  returnSchema: SwitchObjectiveReturnSchema,
  lockKeys: ['objective'],
};

/**
 * Switch to a specific objective slot.
 */
export const useSwitchObjective = () => {
  return useAction(SwitchObjectiveDefinition);
};
