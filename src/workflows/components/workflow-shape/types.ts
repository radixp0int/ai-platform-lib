import type { WorkflowStageSpec } from '../workflow-spec'

export type WorkflowShapeProps = {
  /** The workflow's stages, in order. */
  stages: WorkflowStageSpec[]
  /** The workflow's name, for the accessible name of the picture. */
  name: string
  className?: string
}
