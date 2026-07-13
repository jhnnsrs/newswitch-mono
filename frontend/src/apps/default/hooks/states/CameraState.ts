import { z } from 'zod';
import { buildUseState, type StateDefinition } from '@/lib/rekuest/state';

// --- Sub-Schemas ---
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
export type Detector = z.input<typeof DetectorSchema>;
export type DetectorOutput = z.infer<typeof DetectorSchema>;

// --- Main Schema ---
export const CameraStateSchema = z.object({
  is_acquiring: z.boolean(),
  detectors: z.array(
    DetectorSchema.describe('Shared state for detector parameters.'),
  ),
});

// --- Type ---
export type CameraState = z.infer<typeof CameraStateSchema>;

// --- Definition ---
export const CameraStateDefinition: StateDefinition<
  CameraState,
  'CameraState'
> = {
  appKey: 'default',
  key: 'CameraState',
  schema: CameraStateSchema,
};

/**
 * Hook to sync CameraState
 */
export const useCameraState = buildUseState<CameraState>(CameraStateDefinition);
