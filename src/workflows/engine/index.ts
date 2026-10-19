// The run seam. The page imports from here; nothing reaches inside.
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
export type { RunActor, RunDetail, RunHeader, VariantId } from './wireProtocol'
export { createWsRunSource, wsRunSource } from './wsRunSource'
