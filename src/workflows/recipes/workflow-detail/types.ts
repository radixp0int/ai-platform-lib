import type { WorkflowRunRow, WorkflowSpec } from '../../components/workflow-spec'

export type WorkflowDetailTab = 'overview' | 'runs' | 'versions'

export type WorkflowDetailPageProps = {
  /** The workflow to show. Defaults to the authored commercial loan review. */
  spec?: WorkflowSpec
  /** Where the trail's "Workflows" goes: the list of every workflow. */
  listHref?: string
  /** Where the live-run banner and "Open live run" go. */
  liveHref?: string
  /** Where a row of the Runs tab opens: that run's trace. */
  runHref?: (run: WorkflowRunRow) => string | undefined
  /** The tab to open on. */
  initialTab?: WorkflowDetailTab
  /** What the start form begins filled in with. */
  startDefaults?: Record<string, string>
  onEdit?: () => void
}
