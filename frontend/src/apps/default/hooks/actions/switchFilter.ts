import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---
export const FilterSchema = z
  .object({
    __identifier: z.literal('filter').default('filter'),
    slot: z.number(),
    name: z.string(),
    center_wavelength: z.number(),
    bandwidth: z.number(),
    transmission: z.number(),
    is_active: z.boolean(),
  })
  .brand('filter')
  .describe('The newly active filter.');

// --- Schemas ---
export const SwitchFilterArgsSchema = z.object({
  /** Filter slot number */
  slot: z.number().describe('Filter slot number'),
});
export const SwitchFilterReturnSchema = z.object({
  /** The newly active filter. */
  return0: FilterSchema.describe('The newly active filter.'),
});

// --- Types ---
export type SwitchFilterArgs = z.infer<typeof SwitchFilterArgsSchema>;
export type SwitchFilterReturn = z.infer<typeof SwitchFilterReturnSchema>;

// --- Definition ---
export const SwitchFilterDefinition: ActionDefinition<
  SwitchFilterArgs,
  SwitchFilterReturn
> = {
  name: 'switch_filter',
  appKey: 'default',
  description: 'Switch to a specific filter slot.',
  argsSchema: SwitchFilterArgsSchema,
  returnSchema: SwitchFilterReturnSchema,
  lockKeys: ['filter_bank'],
};

/**
 * Switch to a specific filter slot.
 */
export const useSwitchFilter = () => {
  return useAction(SwitchFilterDefinition);
};
