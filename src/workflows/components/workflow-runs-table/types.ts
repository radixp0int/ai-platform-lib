import type { WorkflowRunRow } from '../workflow-spec'

export type WorkflowRunsTableProps = {
  /** The latest runs, newest first. */
  runs: WorkflowRunRow[]
  /** How many stages the workflow has, for each row's progress bar. */
  stageCount: number
  /** How many runs there are in all. */
  total: number
  /** Where a run opens: its trace. Return nothing for a run with none, and its row is not a link. */
  hrefFor: (run: WorkflowRunRow) => string | undefined
  /** "See all 31 runs". */
  onShowAll?: () => void
  className?: string
}
