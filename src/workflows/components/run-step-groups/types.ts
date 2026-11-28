import type { RunTrace, TraceStep } from '../run-trace'

/** Which steps the list shows. */
export type StepFilter = 'all' | 'needs' | 'failed' | 'done' | 'queued'

export type RunStepGroupsProps = {
  trace: RunTrace
  selectedId?: string
  onSelect: (stepId: string) => void
  /**
   * The words for a step waiting on a person: "Needs you" when it is yours,
   * "Waiting on Dana W." when not. Defaults to "Needs you".
   */
  waitingLabel?: (step: TraceStep) => string
  /** The filter, when the host holds it (the band's "1 needs you" sets it). */
  filter?: StepFilter
  onFilterChange?: (filter: StepFilter) => void
  /** A stage to unfold whatever else is folded: the one a link pointed at. */
  openStageId?: string
  className?: string
}
