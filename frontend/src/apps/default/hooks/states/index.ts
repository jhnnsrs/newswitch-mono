import type { StateDefinition } from '@/lib/rekuest/state';
import { CalibrationStateDefinition } from './CalibrationState';
import { CameraStateDefinition } from './CameraState';
import { ExpanseStateDefinition } from './ExpanseState';
import { FilterBankStateDefinition } from './FilterBankState';
import { HookStateDefinition } from './HookState';
import { IOStateDefinition } from './IOState';
import { IlluminationStateDefinition } from './IlluminationState';
import { LightPathStateDefinition } from './LightPathState';
import { ObjectiveStateDefinition } from './ObjectiveState';
import { SerialStateDefinition } from './SerialState';
import { StageStateDefinition } from './StageState';

export { createIndexedUnion } from './utils';
export {
  CalibratedLightPathSchema,
  CalibrationStateSchema,
  CalibrationStateDefinition,
  useCalibrationState,
} from './CalibrationState';
export type {
  CalibratedLightPath,
  CalibratedLightPathOutput,
  CalibrationState,
} from './CalibrationState';
export {
  DetectorSchema,
  CameraStateSchema,
  CameraStateDefinition,
  useCameraState,
} from './CameraState';
export type { Detector, DetectorOutput, CameraState } from './CameraState';
export {
  ObjectiveKubeStateSchema,
  DetectorKubeStateSchema,
  FilterKubeStateSchema,
  IlluminationKubeStateSchema,
  GenericKubeStateSchema,
  StageKubeStateSchema,
  DichroicKubeStateSchema,
  FilterBankKubeStateSchema,
  ObjectiveTurretKubeStateSchema,
  LightEdgeStateSchema,
  MetadataSchema,
  ImageSchema,
  ScaleSchema,
  ArrayMetadataSchema,
  FrameSchema,
  ExpanseStateSchema,
  ExpanseStateDefinition,
  useExpanseState,
} from './ExpanseState';
export type {
  ObjectiveKubeState,
  ObjectiveKubeStateOutput,
  DetectorKubeState,
  DetectorKubeStateOutput,
  FilterKubeState,
  FilterKubeStateOutput,
  IlluminationKubeState,
  IlluminationKubeStateOutput,
  GenericKubeState,
  GenericKubeStateOutput,
  StageKubeState,
  StageKubeStateOutput,
  DichroicKubeState,
  DichroicKubeStateOutput,
  FilterBankKubeState,
  FilterBankKubeStateOutput,
  ObjectiveTurretKubeState,
  ObjectiveTurretKubeStateOutput,
  LightEdgeState,
  LightEdgeStateOutput,
  LightPathStateOutput,
  Metadata,
  MetadataOutput,
  Image,
  ImageOutput,
  Scale,
  ScaleOutput,
  ArrayMetadata,
  ArrayMetadataOutput,
  Frame,
  FrameOutput,
  ExpanseState,
} from './ExpanseState';
export {
  FilterSchema,
  FilterBankStateSchema,
  FilterBankStateDefinition,
  useFilterBankState,
} from './FilterBankState';
export type { Filter, FilterOutput, FilterBankState } from './FilterBankState';
export {
  RegisteredHookSchema,
  HookStateSchema,
  HookStateDefinition,
  useHookState,
} from './HookState';
export type {
  RegisteredHook,
  RegisteredHookOutput,
  HookState,
} from './HookState';
export { IOStateSchema, IOStateDefinition, useIOState } from './IOState';
export type { IOState } from './IOState';
export {
  IlluminationSchema,
  IlluminationStateSchema,
  IlluminationStateDefinition,
  useIlluminationState,
} from './IlluminationState';
export type {
  Illumination,
  IlluminationOutput,
  IlluminationState,
} from './IlluminationState';
export {
  ObjectiveKubeSchema,
  DetectorKubeSchema,
  FilterKubeSchema,
  IlluminationKubeSchema,
  GenericKubeSchema,
  StageKubeSchema,
  DichroicKubeSchema,
  FilterBankKubeSchema,
  ObjectiveTurretKubeSchema,
  LightEdgeSchema,
  LightPathSchema,
  LightPathStateDefinition,
  useLightPathState,
} from './LightPathState';
export type {
  ObjectiveKube,
  ObjectiveKubeOutput,
  DetectorKube,
  DetectorKubeOutput,
  FilterKube,
  FilterKubeOutput,
  IlluminationKube,
  IlluminationKubeOutput,
  GenericKube,
  GenericKubeOutput,
  StageKube,
  StageKubeOutput,
  DichroicKube,
  DichroicKubeOutput,
  FilterBankKube,
  FilterBankKubeOutput,
  ObjectiveTurretKube,
  ObjectiveTurretKubeOutput,
  LightEdge,
  LightEdgeOutput,
  LightPath,
  LightPathOutput,
} from './LightPathState';
export {
  ObjectiveLensSchema,
  ObjectiveStateSchema,
  ObjectiveStateDefinition,
  useObjectiveState,
} from './ObjectiveState';
export type {
  ObjectiveLens,
  ObjectiveLensOutput,
  ObjectiveState,
} from './ObjectiveState';
export {
  SerialStateSchema,
  SerialStateDefinition,
  useSerialState,
} from './SerialState';
export type { SerialState } from './SerialState';
export {
  StageStateSchema,
  StageStateDefinition,
  useStageState,
} from './StageState';
export type { StageState } from './StageState';

export const globalStateDefinition = {
  CalibrationState: CalibrationStateDefinition,
  CameraState: CameraStateDefinition,
  ExpanseState: ExpanseStateDefinition,
  FilterBankState: FilterBankStateDefinition,
  HookState: HookStateDefinition,
  IOState: IOStateDefinition,
  IlluminationState: IlluminationStateDefinition,
  LightPathState: LightPathStateDefinition,
  ObjectiveState: ObjectiveStateDefinition,
  SerialState: SerialStateDefinition,
  StageState: StageStateDefinition,
} satisfies Record<string, StateDefinition<unknown>>;

type InferStateDefinition<TDefinition> =
  TDefinition extends StateDefinition<infer TState, string> ? TState : never;

export type GlobalStateDefinition = typeof globalStateDefinition;
export type GlobalStateKey = keyof GlobalStateDefinition;
export type GlobalStateShape = {
  [K in GlobalStateKey]: InferStateDefinition<GlobalStateDefinition[K]>;
};

export const globalStateKeys = Object.values(globalStateDefinition).map(
  (definition) => definition.key,
) as GlobalStateKey[];
export const globalStateDefintiion = globalStateDefinition;
