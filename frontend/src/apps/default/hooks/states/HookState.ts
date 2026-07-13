import { z } from 'zod';
import { buildUseState, type StateDefinition } from '@/lib/rekuest/state';

// --- Sub-Schemas ---
export const RegisteredHookSchema = z
  .object({
    __identifier: z.literal('registered_hook').default('registered_hook'),
    type: z.string(),
  })
  .brand('registered_hook')
  .describe(
    'Data class representing a hook to be executed during acquisition.',
  );

// --- Main Schema ---
export const HookStateSchema = z.object({
  registered_hooks: z.array(
    RegisteredHookSchema.describe(
      'Data class representing a hook to be executed during acquisition.',
    ),
  ),
});

// --- Type ---
export type HookState = z.infer<typeof HookStateSchema>;

// --- Definition ---
export const HookStateDefinition: StateDefinition<HookState, 'HookState'> = {
  appKey: 'default',
  key: 'HookState',
  schema: HookStateSchema,
};

/**
 * Hook to sync HookState
 */
export const useHookState = buildUseState<HookState>(HookStateDefinition);
