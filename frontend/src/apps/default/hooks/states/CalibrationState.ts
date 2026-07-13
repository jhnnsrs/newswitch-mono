import { z } from 'zod';
import { buildUseState, type StateDefinition } from '@/lib/rekuest/state';

// --- Sub-Schemas ---
export const CalibratedLightPathSchema = z
  .object({
    __identifier: z
      .literal('calibrated_light_path')
      .default('calibrated_light_path'),
    /** 4x4 affine transformation matrix for mapping between coordinate systems */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe(
        '4x4 affine transformation matrix for mapping between coordinate systems',
      ),
    /** Field of view width in micrometers */
    fov_width: z.number().describe('Field of view width in micrometers'),
    /** Field of view height in micrometers */
    fov_height: z.number().describe('Field of view height in micrometers'),
    /** Hash of the light path configuration this affine matrix corresponds to */
    light_path_state_hash: z
      .string()
      .describe(
        'Hash of the light path configuration this affine matrix corresponds to',
      ),
  })
  .brand('calibrated_light_path')
  .describe('Shared state for affine transformation parameters.');

// --- Main Schema ---
export const CalibrationStateSchema = z.object({
  calibrated_light_paths: z.array(
    CalibratedLightPathSchema.describe(
      'Shared state for affine transformation parameters.',
    ),
  ),
});

// --- Type ---
export type CalibrationState = z.infer<typeof CalibrationStateSchema>;

// --- Definition ---
export const CalibrationStateDefinition: StateDefinition<
  CalibrationState,
  'CalibrationState'
> = {
  appKey: 'default',
  key: 'CalibrationState',
  schema: CalibrationStateSchema,
};

/**
 * Hook to sync CalibrationState
 */
export const useCalibrationState = buildUseState<CalibrationState>(
  CalibrationStateDefinition,
);
