// The run seam. The page imports from here; nothing reaches inside.
export { PENDING_OUTPUT, resolveStepIO, validateIO, type IoCell, type ResolvedIO } from './io'
export { foldRun, placeRun, type PlacedRun, type PlaceOptions } from './layout'
export { LOG_CAP, initialRunState, runReducer } from './runReducer'
export { createStaticRunSource, staticRunSource } from './staticSource'
export type {
  ConnectionState,
  ControlAction,
  Decision,
  Lane,
  LogEntry,
  RunAction,
  RunEvent,
  RunGraph,
  RunPhase,
  RunSource,
  RunState,
  StageChange,
  StepChange,
  VariantInfo,
} from './types'
export { useRun, type Run } from './useRun'
export type {
  IoSource,
  IoType,
  RunActor,
  RunDetail,
  RunHeader,
  RunInputSpec,
  RunOutputSpec,
  StepInput,
  StepIO,
  StepOutput,
  VariantId,
} from './wireProtocol'
export { createWsRunSource, wsRunSource } from './wsRunSource'
