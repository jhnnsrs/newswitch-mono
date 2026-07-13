import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const ClearExpanseArgsSchema = z.object({});
export const ClearExpanseReturnSchema = z.object({});

// --- Types ---
export type ClearExpanseArgs = z.infer<typeof ClearExpanseArgsSchema>;
export type ClearExpanseReturn = z.infer<typeof ClearExpanseReturnSchema>;

// --- Definition ---
export const ClearExpanseDefinition: ActionDefinition<
  ClearExpanseArgs,
  ClearExpanseReturn
> = {
  name: 'clear_expanse',
  appKey: 'default',
  description: 'Clear the expanse state, removing all current images.',
  argsSchema: ClearExpanseArgsSchema,
  returnSchema: ClearExpanseReturnSchema,
  lockKeys: ['expanse_state'],
};

/**
 * Clear the expanse state, removing all current images.
 */
export const useClearExpanse = () => {
  return useAction(ClearExpanseDefinition);
};
