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
  /** Accessible name, e.g. "RFP response: stage 8 of 10, Review". */
  label: string
  className?: string
}
