import { z } from 'zod';
import { buildUseState, type StateDefinition } from '@/lib/rekuest/state';

// --- Sub-Schemas ---

// --- Main Schema ---
export const SerialStateSchema = z.object({
  active: z.boolean(),
});

// --- Type ---
export type SerialState = z.infer<typeof SerialStateSchema>;

// --- Definition ---
export const SerialStateDefinition: StateDefinition<
  SerialState,
  'SerialState'
> = {
  appKey: 'default',
  key: 'SerialState',
  schema: SerialStateSchema,
};

/**
 * Hook to sync SerialState
 */
export const useSerialState = buildUseState<SerialState>(SerialStateDefinition);
