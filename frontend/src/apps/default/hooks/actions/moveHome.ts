import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const MoveHomeArgsSchema = z.object({});
export const MoveHomeReturnSchema = z.object({});

// --- Types ---
export type MoveHomeArgs = z.infer<typeof MoveHomeArgsSchema>;
export type MoveHomeReturn = z.infer<typeof MoveHomeReturnSchema>;

// --- Definition ---
export const MoveHomeDefinition: ActionDefinition<
  MoveHomeArgs,
  MoveHomeReturn
> = {
  name: 'move_home',
  appKey: 'default',
  description: 'Move stage to home position.',
  argsSchema: MoveHomeArgsSchema,
  returnSchema: MoveHomeReturnSchema,
  lockKeys: ['stage_position'],
};

/**
 * Move stage to home position.
 */
export const useMoveHome = () => {
  return useAction(MoveHomeDefinition);
};
