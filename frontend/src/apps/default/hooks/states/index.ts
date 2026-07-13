import type { StateDefinition } from '@/lib/rekuest/state';
import { StageStateDefinition } from './StageState';
import { IlluminationStateDefinition } from './IlluminationState';
import { CameraStateDefinition } from './CameraState';
import { ObjectiveStateDefinition } from './ObjectiveState';
import { FilterBankStateDefinition } from './FilterBankState';
import { IOStateDefinition } from './IOState';
import { LightPathStateDefinition } from './LightPathState';
import { SerialStateDefinition } from './SerialState';
import { HookStateDefinition } from './HookState';
import { ExpanseStateDefinition } from './ExpanseState';
import { CalibrationStateDefinition } from './CalibrationState';

export { createIndexedUnion } from './utils';
export {
  StageStateSchema,
  StageStateDefinition,
  useStageState,
} from './StageState';
export type { StageState } from './StageState';
export {
  IlluminationSchema,
  IlluminationStateSchema,
  IlluminationStateDefinition,
  useIlluminationState,
} from './IlluminationState';
export type { IlluminationState } from './IlluminationState';
export {
  DetectorSchema,
  CameraStateSchema,
  CameraStateDefinition,
  useCameraState,
} from './CameraState';
export type { CameraState } from './CameraState';
export {
  ObjectiveLensSchema,
  ObjectiveStateSchema,
  ObjectiveStateDefinition,
  useObjectiveState,
} from './ObjectiveState';
export type { ObjectiveState } from './ObjectiveState';
export {
  FilterSchema,
  FilterBankStateSchema,
  FilterBankStateDefinition,
  useFilterBankState,
} from './FilterBankState';
export type { FilterBankState } from './FilterBankState';
export { IOStateSchema, IOStateDefinition, useIOState } from './IOState';
export type { IOState } from './IOState';
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
export type { LightPathState } from './LightPathState';
export {
  SerialStateSchema,
  SerialStateDefinition,
  useSerialState,
} from './SerialState';
export type { SerialState } from './SerialState';
export {
  RegisteredHookSchema,
  HookStateSchema,
  HookStateDefinition,
  useHookState,
} from './HookState';
export type { HookState } from './HookState';
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
export type { ExpanseState } from './ExpanseState';
export {
  CalibratedLightPathSchema,
  CalibrationStateSchema,
  CalibrationStateDefinition,
  useCalibrationState,
} from './CalibrationState';
export type { CalibrationState } from './CalibrationState';

export const globalStateDefinition = {
  StageState: StageStateDefinition,
  IlluminationState: IlluminationStateDefinition,
  CameraState: CameraStateDefinition,
  ObjectiveState: ObjectiveStateDefinition,
  FilterBankState: FilterBankStateDefinition,
  IOState: IOStateDefinition,
  LightPathState: LightPathStateDefinition,
  SerialState: SerialStateDefinition,
  HookState: HookStateDefinition,
  ExpanseState: ExpanseStateDefinition,
  CalibrationState: CalibrationStateDefinition,
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
