import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';

// --- Shared Models ---
export const DetectorSchema = z
  .object({
    __identifier: z.literal('detector').default('detector'),
    slot: z.number(),
    name: z.string(),
    width: z.number(),
    height: z.number(),
    is_active: z.boolean(),
    current_exposure_time: z.number(),
    current_gain: z.number(),
    current_colormap: z.string(),
    pixel_size_um: z.number(),
    preset_exposure_times: z.array(z.number()),
    max_exposure_time: z.number(),
    min_exposure_time: z.number(),
    max_gain: z.number(),
    min_gain: z.number(),
    is_acquiring: z.boolean(),
    data_type: z.string(),
  })
  .brand('detector')
  .describe('Shared state for detector parameters.');

// --- Schemas ---
export const UpdateDetectorArgsSchema = z.object({
  /** Detector slot number */
  slot: z.number().describe('Detector slot number'),
  /** Exposure time in seconds (optional) */
  exposure_time: z
    .number()
    .describe('Exposure time in seconds (optional)')
    .nullable()
    .optional(),
  /** Gain value (optional) */
  gain: z.number().describe('Gain value (optional)').nullable().optional(),
});
export const UpdateDetectorReturnSchema = z.object({
  /** Shared state for detector parameters. */
  return0: DetectorSchema.describe('Shared state for detector parameters.'),
});

// --- Types ---
export type UpdateDetectorArgs = z.infer<typeof UpdateDetectorArgsSchema>;
export type UpdateDetectorReturn = z.infer<typeof UpdateDetectorReturnSchema>;

// --- Definition ---
export const UpdateDetectorDefinition: ActionDefinition<
  UpdateDetectorArgs,
  UpdateDetectorReturn
> = {
  name: 'update_detector',
  appKey: 'default',
  description: 'Update detector settings.',
  argsSchema: UpdateDetectorArgsSchema,
  returnSchema: UpdateDetectorReturnSchema,
  lockKeys: ['camera_parameters'],
};

/**
 * Update detector settings.
 */
export const useUpdateDetector = () => {
  return useAction(UpdateDetectorDefinition);
};
