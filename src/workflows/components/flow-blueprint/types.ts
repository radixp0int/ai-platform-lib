import type { StageStatus, StepStatus } from '../types'

export type BlueprintStep = { id: string; status: StepStatus }

export type BlueprintStage = {
  id: string
  name: string
  status: StageStatus
  /** The stage's steps, by column and then top to bottom. */
  columns: BlueprintStep[][]
}

export type FlowBlueprintProps = {
  stages: BlueprintStage[]
  /**
   * Which step feeds which. Omit and each column is joined to the next, which
   * is right for a run whose stages follow one another.
   */
  edges?: { from: string; to: string }[]
  /** Accessible name, e.g. "Commercial loan review: stage 4 of 5, Approve". */
  label: string
  /**
   * `run` (default) shows a run's progress: a marker on each lane and a fill
   * per status. `definition` shows the workflow itself, with nothing done or
   * waiting: each lane is numbered, steps share one pale fill, and a step that
   * only runs sometimes keeps its dashed outline.
   */
  appearance?: 'run' | 'definition'
  className?: string
}
