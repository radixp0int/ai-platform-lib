import type { TraceStageSummary } from '../run-trace'

export type TraceStageStripProps = {
  /** One tile per stage, in order. `summarizeStages` makes them from a trace. */
  stages: TraceStageSummary[]
  /** The stage whose steps are open. */
  selectedId: string
  onSelect: (stageId: string) => void
  /** What the row of tiles is, for someone who cannot see it. Defaults to "Stages". */
  label?: string
  className?: string
}
