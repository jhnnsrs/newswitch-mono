import { z } from 'zod';
import { useAction, type ActionDefinition } from '@/lib/rekuest/task';
import { createIndexedUnion } from './utils';

// --- Shared Models ---
export const ObjectiveKubeStateSchema = z
  .object({
    __identifier: z
      .literal('objective_kube_state')
      .default('objective_kube_state'),
    kube_id: z.string(),
    slot_id: z.number(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the objective lens (e.g., 'Plan-Apochromat 63x/1.4 Oil DIC M27') */
    model_name: z
      .string()
      .describe(
        "Model name of the objective lens (e.g., 'Plan-Apochromat 63x/1.4 Oil DIC M27')",
      )
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the objective lens */
    model_file: z
      .string()
      .describe(
        'Path to a file containing the physical model of the objective lens',
      )
      .nullable()
      .optional(),
  })
  .brand('objective_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const DetectorKubeStateSchema = z
  .object({
    __identifier: z
      .literal('detector_kube_state')
      .default('detector_kube_state'),
    kube_id: z.string(),
    gain: z.number(),
    exposure_time: z.number(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the detector (e.g., 'Pco Edge 4.2m') */
    model_name: z
      .string()
      .describe("Model name of the detector (e.g., 'Pco Edge 4.2m')")
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the detector */
    model_file: z
      .string()
      .describe('Path to a file containing the physical model of the detector')
      .nullable()
      .optional(),
  })
  .brand('detector_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const FilterKubeStateSchema = z
  .object({
    __identifier: z.literal('filter_kube_state').default('filter_kube_state'),
    kube_id: z.string(),
    wavelength: z.number(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the objective lens (e.g., 'Plan-Apochromat 63x/1.4 Oil DIC M27') */
    model_name: z
      .string()
      .describe(
        "Model name of the objective lens (e.g., 'Plan-Apochromat 63x/1.4 Oil DIC M27')",
      )
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the objective lens */
    model_file: z
      .string()
      .describe(
        'Path to a file containing the physical model of the objective lens',
      )
      .nullable()
      .optional(),
  })
  .brand('filter_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const IlluminationKubeStateSchema = z
  .object({
    __identifier: z
      .literal('illumination_kube_state')
      .default('illumination_kube_state'),
    kube_id: z.string(),
    slot_id: z.number(),
    intensity: z.number(),
    wavelength: z.number(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the objective lens (e.g., 'Plan-Apochromat 63x/1.4 Oil DIC M27') */
    model_name: z
      .string()
      .describe(
        "Model name of the objective lens (e.g., 'Plan-Apochromat 63x/1.4 Oil DIC M27')",
      )
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the objective lens */
    model_file: z
      .string()
      .describe(
        'Path to a file containing the physical model of the objective lens',
      )
      .nullable()
      .optional(),
  })
  .brand('illumination_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const GenericKubeStateSchema = z
  .object({
    __identifier: z.literal('generic_kube_state').default('generic_kube_state'),
    kube_id: z.string(),
    other_metadata: z.record(z.string(), z.string()),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the stage (e.g., 'Stage 100x/0.8 NA') */
    model_name: z
      .string()
      .describe("Model name of the stage (e.g., 'Stage 100x/0.8 NA')")
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the stage */
    model_file: z
      .string()
      .describe('Path to a file containing the physical model of the stage')
      .nullable()
      .optional(),
  })
  .brand('generic_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const StageKubeStateSchema = z
  .object({
    __identifier: z.literal('stage_kube_state').default('stage_kube_state'),
    kube_id: z.string(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the stage (e.g., 'Stage 100x/0.8 NA') */
    model_name: z
      .string()
      .describe("Model name of the stage (e.g., 'Stage 100x/0.8 NA')")
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the stage */
    model_file: z
      .string()
      .describe('Path to a file containing the physical model of the stage')
      .nullable()
      .optional(),
  })
  .brand('stage_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const DichroicKubeStateSchema = z
  .object({
    __identifier: z
      .literal('dichroic_kube_state')
      .default('dichroic_kube_state'),
    kube_id: z.string(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the dichroic mirror (e.g., 'Dichroic 405/488/561/640 nm') */
    model_name: z
      .string()
      .describe(
        "Model name of the dichroic mirror (e.g., 'Dichroic 405/488/561/640 nm')",
      )
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the dichroic mirror */
    model_file: z
      .string()
      .describe(
        'Path to a file containing the physical model of the dichroic mirror',
      )
      .nullable()
      .optional(),
  })
  .brand('dichroic_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const FilterBankKubeStateSchema = z
  .object({
    __identifier: z
      .literal('filter_bank_kube_state')
      .default('filter_bank_kube_state'),
    kube_id: z.string(),
    slot_id: z.number(),
    center_wavelength: z.number(),
    bandwidth: z.number(),
    transmission: z.number(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the filter bank (e.g., 'Filter Bank 405/488/561/640 nm') */
    model_name: z
      .string()
      .describe(
        "Model name of the filter bank (e.g., 'Filter Bank 405/488/561/640 nm')",
      )
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the objective lens */
    model_file: z
      .string()
      .describe(
        'Path to a file containing the physical model of the objective lens',
      )
      .nullable()
      .optional(),
  })
  .brand('filter_bank_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const ObjectiveTurretKubeStateSchema = z
  .object({
    __identifier: z
      .literal('objective_turret_kube_state')
      .default('objective_turret_kube_state'),
    kube_id: z.string(),
    slot: z.number(),
    magnification: z.number(),
    numerical_aperture: z.number(),
    /** Affine transformation matrix of the kube */
    affine_matrix: z
      .array(z.array(z.number()))
      .describe('Affine transformation matrix of the kube'),
    /** Model name of the objective turret (e.g., 'Objective Turret 40x/0.6 NA') */
    model_name: z
      .string()
      .describe(
        "Model name of the objective turret (e.g., 'Objective Turret 40x/0.6 NA')",
      )
      .nullable()
      .optional(),
    /** Path to a file containing the physical model of the objective turret */
    model_file: z
      .string()
      .describe(
        'Path to a file containing the physical model of the objective turret',
      )
      .nullable()
      .optional(),
  })
  .brand('objective_turret_kube_state')
  .describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  );

export const KubeUnionSchema = createIndexedUnion([
  ObjectiveKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  DetectorKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  FilterKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  IlluminationKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  GenericKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  StageKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  DichroicKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  FilterBankKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
  ObjectiveTurretKubeStateSchema.describe(
    'Data class representing metadata for a kube, including its ID and affine transformation matrix.',
  ),
]);

export const LightEdgeStateSchema = z
  .object({
    __identifier: z.literal('light_edge_state').default('light_edge_state'),
    /** Source identifier (e.g., ID of LED or laser) */
    source: z.string().describe('Source identifier (e.g., ID of LED or laser)'),
    /** Target identifier (e.g., ID of sample or detector) */
    target: z
      .string()
      .describe('Target identifier (e.g., ID of sample or detector)'),
    /** Intensity of the light source (arbitrary units) */
    intensity: z
      .number()
      .describe('Intensity of the light source (arbitrary units)')
      .nullable()
      .optional(),
    /** Polarization state of the light (e.g., 'linear', 'circular') */
    polarization: z
      .string()
      .describe("Polarization state of the light (e.g., 'linear', 'circular')")
      .nullable()
      .optional(),
  })
  .brand('light_edge_state')
  .describe(
    'Data class representing the light path used for an image, including illumination settings.',
  );

export const LightPathStateSchema = z
  .object({
    __identifier: z.literal('light_path_state').default('light_path_state'),
    /** Hash of the light path configuration, used to uniquely describe the optical path for this image */
    hash: z
      .string()
      .describe(
        'Hash of the light path configuration, used to uniquely describe the optical path for this image',
      ),
    /** List of kubes representing the optical components in the light path (e.g., objective, detector) */
    kubes: z
      .array(KubeUnionSchema)
      .describe(
        'List of kubes representing the optical components in the light path (e.g., objective, detector)',
      ),
    /** List of edges representing the light path from source to sample */
    edges: z.array(
      LightEdgeStateSchema.describe(
        'Data class representing the light path used for an image, including illumination settings.',
      ),
    ),
    /** Hash indicating if the kube is affecting the transformation from sample to pixel coordinates, which is used to determine if we can reuse the affine matrix from a previous image */
    transformation_hash: z
      .string()
      .describe(
        'Hash indicating if the kube is affecting the transformation from sample to pixel coordinates, which is used to determine if we can reuse the affine matrix from a previous image',
      ),
  })
  .brand('light_path_state')
  .describe(
    'Data class representing the light path used for an image, including illumination settings.',
  );

export const MetadataSchema = z
  .object({
    __identifier: z.literal('metadata').default('metadata'),
    affine_matrix: z.array(z.array(z.number())),
    fov_width: z.number(),
    fov_height: z.number(),
    /** Data class representing the light path used for an image, including illumination settings. */
    light_state: LightPathStateSchema.describe(
      'Data class representing the light path used for an image, including illumination settings.',
    ),
    acquisition_time: z.string(),
    colormap: z.string(),
    min_value: z.number().nullable().optional(),
    max_value: z.number().nullable().optional(),
  })
  .brand('metadata')
  .describe(
    'Data class representing metadata for an image, including its ID and affine transformation matrix.',
  );

export const ImageSchema = z
  .object({
    __identifier: z.literal('image').default('image'),
    id: z.string(),
    /** Data class representing metadata for an image, including its ID and affine transformation matrix. */
    metadata: MetadataSchema.describe(
      'Data class representing metadata for an image, including its ID and affine transformation matrix.',
    ),
  })
  .brand('image')
  .describe('Represents a single image captured by the detector.');

// --- Schemas ---
export const ScanRegionArgsSchema = z.object({
  /** Defines the order in which stage positions are visited during acquisition. */
  scan_order: z.union([
    z
      .literal('SNAKE_ROW')
      .describe(
        'Defines the order in which stage positions are visited during acquisition.',
      ),
    z
      .literal('SNAKE_COL')
      .describe(
        'Defines the order in which stage positions are visited during acquisition.',
      ),
    z
      .literal('RASTER_ROW')
      .describe(
        'Defines the order in which stage positions are visited during acquisition.',
      ),
    z
      .literal('RASTER_COL')
      .describe(
        'Defines the order in which stage positions are visited during acquisition.',
      ),
  ]),
  start_x: z.number(),
  start_y: z.number(),
  end_x: z.number(),
  end_y: z.number(),
  overlap: z.number().nullable().optional(),
  detector_slot: z.number().nullable().optional(),
});
export const ScanRegionReturnSchema = z.object({
  /** List of acquired images with metadata. */
  return0: z.array(
    ImageSchema.describe('Represents a single image captured by the detector.'),
  ),
});

// --- Types ---
export type ScanRegionArgs = z.infer<typeof ScanRegionArgsSchema>;
export type ScanRegionReturn = z.infer<typeof ScanRegionReturnSchema>;

// --- Definition ---
export const ScanRegionDefinition: ActionDefinition<
  ScanRegionArgs,
  ScanRegionReturn
> = {
  name: 'scan_region',
  appKey: 'default',
  description:
    'Simulate the acquisition of a multidimensional dataset based on the provided configuration.',
  argsSchema: ScanRegionArgsSchema,
  returnSchema: ScanRegionReturnSchema,
  lockKeys: ['camera_parameters', 'expanse_state', 'io', 'stage_position'],
};

/**
 * Simulate the acquisition of a multidimensional dataset based on the provided configuration.
 */
export const useScanRegion = () => {
  return useAction(ScanRegionDefinition);
};
