// The canvas kit has no dependency on the run engine or recipe fixtures.
// Keep host panels in the workflow entry point to preserve that boundary.
// See docs/workflows/canvas.md for a minimal host.
export {
  EDGE_DASH,
  EDGE_STROKE,
  FOLD_BAR_GAP,
  FOLD_BAR_H,
  FOLD_PAD,
  FOLD_W,
  GATE_W,
  NODE_W,
  RICH_W,
  STEP_H,
  buildFoldEdges,
  buildFoldNodes,
  buildStepEdges,
  buildStepNodes,
  edgeStyle,
  feeds,
  foldHeight,
  foldNodeId,
  never,
  stepHeight,
  type EdgeSeed,
  type FoldRect,
} from './build'
export { CanvasLegend } from './canvas-legend'
export * from './kind-icon'
export {
  SelectStageProvider,
  SelectStepProvider,
  ToggleFoldProvider,
  useSelectStage,
  useSelectStep,
  useToggleFold,
} from './selection'
export * from './recent-runs'
export * from './stage-marker'
export * from './fold-node'
export * from './flow-blueprint'
export * from './stage-progress'
export * from './status-mark'
export * from './step-node'
export { DEFAULT_STATUS_LABEL, STEP_KIND_LABEL } from './types'
export type {
  AppNode,
  EdgeState,
  FoldBase,
  FoldData,
  FoldNodeType,
  StageSeed,
  StageStatus,
  StatusMap,
  StepBase,
  StepContent,
  StepData,
  StepDetailData,
  StepKind,
  StepNodeType,
  StepSeed,
  StepStatus,
} from './types'
export {
  MAX_ZOOM,
  MIN_ZOOM,
  TIER_LABEL,
  tierForZoom,
  useZoomPercent,
  useZoomTier,
  type ZoomTier,
} from './zoom'
export { ZoomCluster } from './zoom-cluster'
