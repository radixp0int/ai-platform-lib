import type { WorkflowStepSpec } from '../workflow-spec'

export type WorkflowStepCardProps = {
  step: WorkflowStepSpec
  /**
   * The title of the step an input comes from, given its id. An input whose
   * source is not found says the id instead.
   */
  titleOf?: (stepId: string) => string | undefined
  className?: string
}
