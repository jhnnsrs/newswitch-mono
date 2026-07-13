import type { LockDefinition } from '@/lib/rekuest/locks';
import { ExpanseStateDefinition } from './ExpanseState';
import { IlluminationDefinition } from './Illumination';
import { StagePositionDefinition } from './StagePosition';
import { IoDefinition } from './Io';
import { CameraParametersDefinition } from './CameraParameters';
import { FilterBankDefinition } from './FilterBank';
import { ObjectiveDefinition } from './Objective';
import { HookRegistryDefinition } from './HookRegistry';

export { ExpanseStateDefinition, useExpanseStateLock } from './ExpanseState';
export { IlluminationDefinition, useIlluminationLock } from './Illumination';
export { StagePositionDefinition, useStagePositionLock } from './StagePosition';
export { IoDefinition, useIoLock } from './Io';
export {
  CameraParametersDefinition,
  useCameraParametersLock,
} from './CameraParameters';
export { FilterBankDefinition, useFilterBankLock } from './FilterBank';
export { ObjectiveDefinition, useObjectiveLock } from './Objective';
export { HookRegistryDefinition, useHookRegistryLock } from './HookRegistry';

export const globalLockDefinition = {
  ExpanseState: ExpanseStateDefinition,
  Illumination: IlluminationDefinition,
  StagePosition: StagePositionDefinition,
  Io: IoDefinition,
  CameraParameters: CameraParametersDefinition,
  FilterBank: FilterBankDefinition,
  Objective: ObjectiveDefinition,
  HookRegistry: HookRegistryDefinition,
} satisfies Record<string, LockDefinition<string>>;

export type GlobalLockDefinition = typeof globalLockDefinition;
type InferLockKey<TDefinition> =
  TDefinition extends LockDefinition<infer TKey> ? TKey : never;

export type GlobalLockKey = InferLockKey<
  GlobalLockDefinition[keyof GlobalLockDefinition]
>;
export const globalLockKeys = Object.values(globalLockDefinition).map(
  (definition) => definition.key,
) as GlobalLockKey[];
export const globalLockDefintiion = globalLockDefinition;
