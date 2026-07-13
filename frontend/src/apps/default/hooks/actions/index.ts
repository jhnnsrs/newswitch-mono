import type { ActionDefinition } from '@/lib/rekuest/task';
import { ClearExpanseDefinition } from './clearExpanse';
import { SetIlluminationIntensityDefinition } from './setIlluminationIntensity';
import { LongStuffRunningDefinition } from './longStuffRunning';
import { TurnOnIlluminationDefinition } from './turnOnIllumination';
import { TurnOffIlluminationChannelDefinition } from './turnOffIlluminationChannel';
import { FailingCameraDefinition } from './failingCamera';
import { MoveStageDefinition } from './moveStage';
import { MoveHomeDefinition } from './moveHome';
import { KillBenedictDefinition } from './killBenedict';
import { MoveToStagePositionDefinition } from './moveToStagePosition';
import { CaptureImageDefinition } from './captureImage';
import { DumpStatesToStdinDefinition } from './dumpStatesToStdin';
import { StartLiveViewDefinition } from './startLiveView';
import { StopLiveViewDefinition } from './stopLiveView';
import { ActivateDetectorDefinition } from './activateDetector';
import { DeactivateDetectorDefinition } from './deactivateDetector';
import { UpdateDetectorDefinition } from './updateDetector';
import { NeverEndingFunctionDefinition } from './neverEndingFunction';
import { SwitchObjectiveDefinition } from './switchObjective';
import { ToggleObjectiveDefinition } from './toggleObjective';
import { SwitchFilterDefinition } from './switchFilter';
import { ToggleFilterDefinition } from './toggleFilter';
import { AcquireMultidimensionalAcquisitionDefinition } from './acquireMultidimensionalAcquisition';
import { CalibrateLightPathDefinition } from './calibrateLightPath';
import { ScanRegionDefinition } from './scanRegion';

export { createIndexedUnion } from './utils';
export {
  ClearExpanseArgsSchema,
  ClearExpanseReturnSchema,
  ClearExpanseDefinition,
  useClearExpanse,
} from './clearExpanse';
export type { ClearExpanseArgs, ClearExpanseReturn } from './clearExpanse';
export {
  SetIlluminationIntensityArgsSchema,
  SetIlluminationIntensityReturnSchema,
  SetIlluminationIntensityDefinition,
  useSetIlluminationIntensity,
} from './setIlluminationIntensity';
export type {
  SetIlluminationIntensityArgs,
  SetIlluminationIntensityReturn,
} from './setIlluminationIntensity';
export {
  LongStuffRunningArgsSchema,
  LongStuffRunningReturnSchema,
  LongStuffRunningDefinition,
  useLongStuffRunning,
} from './longStuffRunning';
export type {
  LongStuffRunningArgs,
  LongStuffRunningReturn,
} from './longStuffRunning';
export {
  TurnOnIlluminationArgsSchema,
  TurnOnIlluminationReturnSchema,
  TurnOnIlluminationDefinition,
  useTurnOnIllumination,
} from './turnOnIllumination';
export type {
  TurnOnIlluminationArgs,
  TurnOnIlluminationReturn,
} from './turnOnIllumination';
export {
  TurnOffIlluminationChannelArgsSchema,
  TurnOffIlluminationChannelReturnSchema,
  TurnOffIlluminationChannelDefinition,
  useTurnOffIlluminationChannel,
} from './turnOffIlluminationChannel';
export type {
  TurnOffIlluminationChannelArgs,
  TurnOffIlluminationChannelReturn,
} from './turnOffIlluminationChannel';
export {
  FailingCameraArgsSchema,
  FailingCameraReturnSchema,
  FailingCameraDefinition,
  useFailingCamera,
} from './failingCamera';
export type { FailingCameraArgs, FailingCameraReturn } from './failingCamera';
export {
  MoveStageArgsSchema,
  MoveStageReturnSchema,
  MoveStageDefinition,
  useMoveStage,
  OptimisticStageState,
} from './moveStage';
export type { MoveStageArgs, MoveStageReturn } from './moveStage';
export {
  MoveHomeArgsSchema,
  MoveHomeReturnSchema,
  MoveHomeDefinition,
  useMoveHome,
} from './moveHome';
export type { MoveHomeArgs, MoveHomeReturn } from './moveHome';
export {
  KillBenedictArgsSchema,
  KillBenedictReturnSchema,
  KillBenedictDefinition,
  useKillBenedict,
} from './killBenedict';
export type { KillBenedictArgs, KillBenedictReturn } from './killBenedict';
export {
  MoveToStagePositionArgsSchema,
  MoveToStagePositionReturnSchema,
  MoveToStagePositionDefinition,
  useMoveToStagePosition,
} from './moveToStagePosition';
export type {
  MoveToStagePositionArgs,
  MoveToStagePositionReturn,
} from './moveToStagePosition';
export {
  CaptureImageArgsSchema,
  CaptureImageReturnSchema,
  CaptureImageDefinition,
  useCaptureImage,
} from './captureImage';
export type { CaptureImageArgs, CaptureImageReturn } from './captureImage';
export {
  DumpStatesToStdinArgsSchema,
  DumpStatesToStdinReturnSchema,
  DumpStatesToStdinDefinition,
  useDumpStatesToStdin,
} from './dumpStatesToStdin';
export type {
  DumpStatesToStdinArgs,
  DumpStatesToStdinReturn,
} from './dumpStatesToStdin';
export {
  StartLiveViewArgsSchema,
  StartLiveViewReturnSchema,
  StartLiveViewDefinition,
  useStartLiveView,
} from './startLiveView';
export type { StartLiveViewArgs, StartLiveViewReturn } from './startLiveView';
export {
  StopLiveViewArgsSchema,
  StopLiveViewReturnSchema,
  StopLiveViewDefinition,
  useStopLiveView,
} from './stopLiveView';
export type { StopLiveViewArgs, StopLiveViewReturn } from './stopLiveView';
export {
  ActivateDetectorArgsSchema,
  ActivateDetectorReturnSchema,
  ActivateDetectorDefinition,
  useActivateDetector,
} from './activateDetector';
export type {
  ActivateDetectorArgs,
  ActivateDetectorReturn,
} from './activateDetector';
export {
  DeactivateDetectorArgsSchema,
  DeactivateDetectorReturnSchema,
  DeactivateDetectorDefinition,
  useDeactivateDetector,
} from './deactivateDetector';
export type {
  DeactivateDetectorArgs,
  DeactivateDetectorReturn,
} from './deactivateDetector';
export {
  DetectorSchema,
  UpdateDetectorArgsSchema,
  UpdateDetectorReturnSchema,
  UpdateDetectorDefinition,
  useUpdateDetector,
} from './updateDetector';
export type {
  UpdateDetectorArgs,
  UpdateDetectorReturn,
} from './updateDetector';
export {
  NeverEndingFunctionArgsSchema,
  NeverEndingFunctionReturnSchema,
  NeverEndingFunctionDefinition,
  useNeverEndingFunction,
} from './neverEndingFunction';
export type {
  NeverEndingFunctionArgs,
  NeverEndingFunctionReturn,
} from './neverEndingFunction';
export {
  SwitchObjectiveArgsSchema,
  SwitchObjectiveReturnSchema,
  SwitchObjectiveDefinition,
  useSwitchObjective,
} from './switchObjective';
export type {
  SwitchObjectiveArgs,
  SwitchObjectiveReturn,
} from './switchObjective';
export {
  ToggleObjectiveArgsSchema,
  ToggleObjectiveReturnSchema,
  ToggleObjectiveDefinition,
  useToggleObjective,
} from './toggleObjective';
export type {
  ToggleObjectiveArgs,
  ToggleObjectiveReturn,
} from './toggleObjective';
export {
  SwitchFilterArgsSchema,
  SwitchFilterReturnSchema,
  SwitchFilterDefinition,
  useSwitchFilter,
} from './switchFilter';
export type { SwitchFilterArgs, SwitchFilterReturn } from './switchFilter';
export {
  ToggleFilterArgsSchema,
  ToggleFilterReturnSchema,
  ToggleFilterDefinition,
  useToggleFilter,
} from './toggleFilter';
export type { ToggleFilterArgs, ToggleFilterReturn } from './toggleFilter';
export {
  IlluminationSchema,
  StreamsSchema,
  SoftwareAutofocusHookSchema,
  ZCalibrationHookSchema,
  ZHookUnionSchema,
  StackSchema,
  PHookUnionSchema,
  PositionSchema,
  THookUnionSchema,
  TimepointSchema,
  MHookUnionSchema,
  MultidimensionalAcquisitionSchema,
  AcquireMultidimensionalAcquisitionArgsSchema,
  AcquireMultidimensionalAcquisitionReturnSchema,
  AcquireMultidimensionalAcquisitionDefinition,
  useAcquireMultidimensionalAcquisition,
} from './acquireMultidimensionalAcquisition';
export type {
  AcquireMultidimensionalAcquisitionArgs,
  AcquireMultidimensionalAcquisitionReturn,
} from './acquireMultidimensionalAcquisition';
export {
  CalibratedLightPathSchema,
  CalibrateLightPathArgsSchema,
  CalibrateLightPathReturnSchema,
  CalibrateLightPathDefinition,
  useCalibrateLightPath,
} from './calibrateLightPath';
export type {
  CalibrateLightPathArgs,
  CalibrateLightPathReturn,
} from './calibrateLightPath';
export {
  ImageSchema,
  ScanRegionArgsSchema,
  ScanRegionReturnSchema,
  ScanRegionDefinition,
  useScanRegion,
} from './scanRegion';
export type { ScanRegionArgs, ScanRegionReturn } from './scanRegion';

export const globalActionDefinition = {
  ClearExpanse: ClearExpanseDefinition,
  SetIlluminationIntensity: SetIlluminationIntensityDefinition,
  LongStuffRunning: LongStuffRunningDefinition,
  TurnOnIllumination: TurnOnIlluminationDefinition,
  TurnOffIlluminationChannel: TurnOffIlluminationChannelDefinition,
  FailingCamera: FailingCameraDefinition,
  MoveStage: MoveStageDefinition,
  MoveHome: MoveHomeDefinition,
  KillBenedict: KillBenedictDefinition,
  MoveToStagePosition: MoveToStagePositionDefinition,
  CaptureImage: CaptureImageDefinition,
  DumpStatesToStdin: DumpStatesToStdinDefinition,
  StartLiveView: StartLiveViewDefinition,
  StopLiveView: StopLiveViewDefinition,
  ActivateDetector: ActivateDetectorDefinition,
  DeactivateDetector: DeactivateDetectorDefinition,
  UpdateDetector: UpdateDetectorDefinition,
  NeverEndingFunction: NeverEndingFunctionDefinition,
  SwitchObjective: SwitchObjectiveDefinition,
  ToggleObjective: ToggleObjectiveDefinition,
  SwitchFilter: SwitchFilterDefinition,
  ToggleFilter: ToggleFilterDefinition,
  AcquireMultidimensionalAcquisition:
    AcquireMultidimensionalAcquisitionDefinition,
  CalibrateLightPath: CalibrateLightPathDefinition,
  ScanRegion: ScanRegionDefinition,
} satisfies Record<string, ActionDefinition<unknown, unknown>>;

export type GlobalActionDefinition = typeof globalActionDefinition;
export const globalActionDefintiion = globalActionDefinition;
