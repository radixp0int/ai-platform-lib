import type { RunTrace } from '../../components/run-trace'

export type RunDetailPageProps = {
  /** The run to show. Defaults to the authored commercial loan review run. */
  trace?: RunTrace
  /** Where the trail's "Workflows" goes: the list of every workflow. */
  listHref?: string
  /** Where the trail's workflow name goes: that workflow's page. Leave it out and the trail has no middle link. */
  workflowHref?: string
  /** Where "Open live view" goes: the run on the canvas. */
  liveHref?: string
  /** The stage to open first. Defaults to the one the run is at. */
  initialStageId?: string
  /** The step to open first. Defaults to the one still going in that stage. */
  initialStepId?: string
}
