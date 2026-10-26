import type { WorkflowLiveRun } from '../workflow-spec'

export type WorkflowHeaderProps = {
  name: string
  /** What the workflow is for, in a sentence or two. */
  description: string
  /** Facts about it, as a label and a value: Owner, Starts when, Version, Shape. */
  meta: [label: string, value: string][]
  /** The run in progress, when there is one: it is drawn as a banner you can open. */
  liveRun?: WorkflowLiveRun
  /** Where "Open live run" goes. */
  liveHref?: string
  onEdit?: () => void
  onStart?: () => void
  className?: string
}
