import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---

// --- Schemas ---
export const LongStuffRunningArgsSchema = z.object({});
export const LongStuffRunningReturnSchema = z.object({});

// --- Types ---
export type LongStuffRunningArgs = z.infer<typeof LongStuffRunningArgsSchema>;
export type LongStuffRunningReturn = z.infer<
  typeof LongStuffRunningReturnSchema
>;

// --- Definition ---
export const LongStuffRunningDefinition: ActionDefinition<
  LongStuffRunningArgs,
  LongStuffRunningReturn
> = {
  name: 'long_stuff_running',
  appKey: 'default',
  description:
    'A long-running function to test optimistic updates and progress.',
  argsSchema: LongStuffRunningArgsSchema,
  returnSchema: LongStuffRunningReturnSchema,
  lockKeys: [],
};

/**
 * A long-running function to test optimistic updates and progress.
 */
export const useLongStuffRunning = () => {
  return useAction(LongStuffRunningDefinition);
};
