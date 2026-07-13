import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const MoveToStagePositionArgsSchema = z.object({
  position_x: z.number(),
  position_y: z.number(),
  position_z: z.number(),
});
export const MoveToStagePositionReturnSchema = z.object({});

// --- Types ---
export type MoveToStagePositionArgs = z.infer<
  typeof MoveToStagePositionArgsSchema
>;
export type MoveToStagePositionReturn = z.infer<
  typeof MoveToStagePositionReturnSchema
>;

// --- Definition ---
export const MoveToStagePositionDefinition: ActionDefinition<
  MoveToStagePositionArgs,
  MoveToStagePositionReturn
> = {
  name: 'move_to_stage_position',
  appKey: 'default',
  description: 'Move the stage to a specified position.',
  argsSchema: MoveToStagePositionArgsSchema,
  returnSchema: MoveToStagePositionReturnSchema,
  lockKeys: ['stage_position'],
};

/**
 * Move the stage to a specified position.
 */
export const useMoveToStagePosition = () => {
  return useAction(MoveToStagePositionDefinition);
};
