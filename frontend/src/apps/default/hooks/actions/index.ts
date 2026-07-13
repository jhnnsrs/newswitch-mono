import type { ActionDefinition } from '@/lib/rekuest/task';
import { AcquireMultidimensionalAcquisitionDefinition } from './acquireMultidimensionalAcquisition';
import { ActivateDetectorDefinition } from './activateDetector';
import { CalibrateLightPathDefinition } from './calibrateLightPath';
import { CaptureImageDefinition } from './captureImage';
import { ClearExpanseDefinition } from './clearExpanse';
import { DeactivateDetectorDefinition } from './deactivateDetector';
import { DumpStatesToStdinDefinition } from './dumpStatesToStdin';
import { FailingCameraDefinition } from './failingCamera';
import { KillBenedictDefinition } from './killBenedict';
import { LongStuffRunningDefinition } from './longStuffRunning';
import { MoveHomeDefinition } from './moveHome';
import { MoveStageDefinition } from './moveStage';
import { MoveToStagePositionDefinition } from './moveToStagePosition';
import { NeverEndingFunctionDefinition } from './neverEndingFunction';
import { ScanRegionDefinition } from './scanRegion';
import { SetIlluminationIntensityDefinition } from './setIlluminationIntensity';
import { StartLiveViewDefinition } from './startLiveView';
import { StopLiveViewDefinition } from './stopLiveView';
import { SwitchFilterDefinition } from './switchFilter';
import { SwitchObjectiveDefinition } from './switchObjective';
import { ToggleFilterDefinition } from './toggleFilter';
import { ToggleObjectiveDefinition } from './toggleObjective';
import { TurnOffIlluminationChannelDefinition } from './turnOffIlluminationChannel';
import { TurnOnIlluminationDefinition } from './turnOnIllumination';
import { UpdateDetectorDefinition } from './updateDetector';

export { createIndexedUnion } from './utils';
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
  Illumination,
  IlluminationOutput,
  Streams,
  StreamsOutput,
  SoftwareAutofocusHook,
  SoftwareAutofocusHookOutput,
  ZCalibrationHook,
  ZCalibrationHookOutput,
  Stack,
  StackOutput,
  Position,
  PositionOutput,
  Timepoint,
  TimepointOutput,
  MultidimensionalAcquisition,
  MultidimensionalAcquisitionOutput,
  AcquireMultidimensionalAcquisitionArgs,
  AcquireMultidimensionalAcquisitionReturn,
} from './acquireMultidimensionalAcquisition';
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
  CalibratedLightPathSchema,
  CalibrateLightPathArgsSchema,
  CalibrateLightPathReturnSchema,
  CalibrateLightPathDefinition,
  useCalibrateLightPath,
} from './calibrateLightPath';
export type {
  CalibratedLightPath,
  CalibratedLightPathOutput,
  CalibrateLightPathArgs,
  CalibrateLightPathReturn,
} from './calibrateLightPath';
export {
  CaptureImageArgsSchema,
  CaptureImageReturnSchema,
  CaptureImageDefinition,
  useCaptureImage,
} from './captureImage';
export type { CaptureImageArgs, CaptureImageReturn } from './captureImage';
export {
  ClearExpanseArgsSchema,
  ClearExpanseReturnSchema,
  ClearExpanseDefinition,
  useClearExpanse,
} from './clearExpanse';
export type { ClearExpanseArgs, ClearExpanseReturn } from './clearExpanse';
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
  FailingCameraArgsSchema,
  FailingCameraReturnSchema,
  FailingCameraDefinition,
  useFailingCamera,
} from './failingCamera';
export type { FailingCameraArgs, FailingCameraReturn } from './failingCamera';
export {
  KillBenedictArgsSchema,
  KillBenedictReturnSchema,
  KillBenedictDefinition,
  useKillBenedict,
} from './killBenedict';
export type { KillBenedictArgs, KillBenedictReturn } from './killBenedict';
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
  MoveHomeArgsSchema,
  MoveHomeReturnSchema,
  MoveHomeDefinition,
  useMoveHome,
} from './moveHome';
export type { MoveHomeArgs, MoveHomeReturn } from './moveHome';
export {
  MoveStageArgsSchema,
  MoveStageReturnSchema,
  MoveStageDefinition,
  useMoveStage,
  OptimisticStageState,
} from './moveStage';
export type { MoveStageArgs, MoveStageReturn } from './moveStage';
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
  ImageSchema,
  ScanRegionArgsSchema,
  ScanRegionReturnSchema,
  ScanRegionDefinition,
  useScanRegion,
} from './scanRegion';
export type {
  Image,
  ImageOutput,
  ScanRegionArgs,
  ScanRegionReturn,
} from './scanRegion';
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
  SwitchFilterArgsSchema,
  SwitchFilterReturnSchema,
  SwitchFilterDefinition,
  useSwitchFilter,
} from './switchFilter';
export type { SwitchFilterArgs, SwitchFilterReturn } from './switchFilter';
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
  ToggleFilterArgsSchema,
  ToggleFilterReturnSchema,
  ToggleFilterDefinition,
  useToggleFilter,
} from './toggleFilter';
export type { ToggleFilterArgs, ToggleFilterReturn } from './toggleFilter';
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
  DetectorSchema,
  UpdateDetectorArgsSchema,
  UpdateDetectorReturnSchema,
  UpdateDetectorDefinition,
  useUpdateDetector,
} from './updateDetector';
export type {
  Detector,
  DetectorOutput,
  UpdateDetectorArgs,
  UpdateDetectorReturn,
} from './updateDetector';

export const globalActionDefinition = {
  AcquireMultidimensionalAcquisition:
    AcquireMultidimensionalAcquisitionDefinition,
  ActivateDetector: ActivateDetectorDefinition,
  CalibrateLightPath: CalibrateLightPathDefinition,
  CaptureImage: CaptureImageDefinition,
  ClearExpanse: ClearExpanseDefinition,
  DeactivateDetector: DeactivateDetectorDefinition,
  DumpStatesToStdin: DumpStatesToStdinDefinition,
  FailingCamera: FailingCameraDefinition,
  KillBenedict: KillBenedictDefinition,
  LongStuffRunning: LongStuffRunningDefinition,
  MoveHome: MoveHomeDefinition,
  MoveStage: MoveStageDefinition,
  MoveToStagePosition: MoveToStagePositionDefinition,
  NeverEndingFunction: NeverEndingFunctionDefinition,
  ScanRegion: ScanRegionDefinition,
  SetIlluminationIntensity: SetIlluminationIntensityDefinition,
  StartLiveView: StartLiveViewDefinition,
  StopLiveView: StopLiveViewDefinition,
  SwitchFilter: SwitchFilterDefinition,
  SwitchObjective: SwitchObjectiveDefinition,
  ToggleFilter: ToggleFilterDefinition,
  ToggleObjective: ToggleObjectiveDefinition,
  TurnOffIlluminationChannel: TurnOffIlluminationChannelDefinition,
  TurnOnIllumination: TurnOnIlluminationDefinition,
  UpdateDetector: UpdateDetectorDefinition,
} satisfies Record<string, ActionDefinition<unknown, unknown>>;

export type GlobalActionDefinition = typeof globalActionDefinition;
export const globalActionDefintiion = globalActionDefinition;
