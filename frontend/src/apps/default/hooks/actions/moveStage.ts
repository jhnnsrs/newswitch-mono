import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const MoveStageArgsSchema = z.object({
  /** X position (micrometers) */
  x: z.number().describe('X position (micrometers)').nullable().optional(),
  /** Y position (micrometers) */
  y: z.number().describe('Y position (micrometers)').nullable().optional(),
  /** Z position (micrometers) */
  z: z.number().describe('Z position (micrometers)').nullable().optional(),
  /** A (rotation) position */
  a: z.number().describe('A (rotation) position').nullable().optional(),
  /** If True, move to absolute position; if False, relative move */
  is_absolute: z
    .boolean()
    .describe('If True, move to absolute position; if False, relative move')
    .nullable()
    .optional(),
  /** Step size in micrometers for movement simulation (default: 1.0) */
  step_size: z
    .number()
    .describe('Step size in micrometers for movement simulation (default: 1.0)')
    .nullable()
    .optional(),
});
export const MoveStageReturnSchema = z.object({});

// --- Types ---
export type MoveStageArgs = z.infer<typeof MoveStageArgsSchema>;
export type MoveStageReturn = z.infer<typeof MoveStageReturnSchema>;

// --- Definition ---
export const MoveStageDefinition: ActionDefinition<
  MoveStageArgs,
  MoveStageReturn
> = {
  name: 'move_stage',
  appKey: 'default',
  description: 'Move the stage to a new position.',
  argsSchema: MoveStageArgsSchema,
  returnSchema: MoveStageReturnSchema,
  lockKeys: ['stage_position'],
};

/**
 * Move the stage to a new position.
 */
export const useMoveStage = () => {
  return useAction(MoveStageDefinition);
};

/** Optimistic state hooks for move_stage */

export const OptimisticStageState = {
  key: 'StageState',
  selector: (state: never) => state,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessor: (state: any, args: any) => ({
    ...state,
    x: args.x,
    y: args.y,
    z: args.z,
    a: args.a,
  }),
};
