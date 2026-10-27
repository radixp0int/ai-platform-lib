import type { BlueprintStage } from '../../components/flow-blueprint'

/** Where a workflow's live run stands. `idle` means it has none. */
export type WorkflowState = 'waiting' | 'running' | 'idle'

/** A decision someone owes a run. */
export type WorkflowNeed = { initials: string; title: string; who: string; due: string }

/**
 * One workflow and its live run, as a list endpoint would return it: enough to
 * draw a table row and the blueprint under it, and nothing a canvas needs.
 */
export type WorkflowSummary = {
  id: string
  name: string
  /** The live run's title. Empty when `state` is `idle`. */
  run: string
  state: WorkflowState
  startedBy: string
  /** The run's shape. One bar per step in the blueprint; one segment per stage. */
  stages: BlueprintStage[]
  agents: number
  tools: number
  /** What is happening right now, and the detail under it. */
  now: { title: string; sub: string }
  /** Open approvals. Empty unless `state` is `waiting`. */
  needs: WorkflowNeed[]
}

export type RunsListPageProps = {
  /** Defaults to the ten authored summaries. */
  workflows?: WorkflowSummary[]
  /** Where a row's "Open live view" goes. */
  hrefFor?: (workflow: WorkflowSummary) => string
  /**
   * Where a row's "Workflow details" goes. Return nothing for a workflow with no
   * detail page, and its row offers only the live view.
   */
  detailHrefFor?: (workflow: WorkflowSummary) => string | undefined
  onStart?: () => void
}
