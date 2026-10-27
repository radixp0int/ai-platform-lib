import type { WorkflowStageSpec } from '../workflow-spec'

export type WorkflowStageListProps = {
  stages: WorkflowStageSpec[]
  /** Said beside the "Expand all" button: "Typical time, last 31 runs". */
  timeNote?: string
  /** The stages that start open, by id. Defaults to none. */
  defaultOpenIds?: string[]
  className?: string
}
