// --- 1. Local Types ---

import type { AbsolutePath } from "@zarrita/storage";
import type { ZarrStore } from "../hooks/zarr/zarr_stores/type";
import type {
  ArrayMetadataSchema,
  MetadataSchema,
} from "@/apps/default/hooks/states/ExpanseState";
import * as THREE from "three";
import { z } from "zod";

export type ArrayMetadata = z.infer<typeof ArrayMetadataSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;

export type ChunkData = {
  frame_id: string;
  store: ZarrStore;
  chunk_coord: string;
  chunk_key: AbsolutePath;
  chunk_shape: number[];
  z_index: number;
  min_value: number;
  max_value: number;
  metadata: Metadata;
  array_metadata: ArrayMetadata;
  colormapTexture: THREE.Texture | null;
};
