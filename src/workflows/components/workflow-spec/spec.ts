import type { BlueprintStage } from '../flow-blueprint'
import type { WorkflowSpec, WorkflowStageSpec } from './types'

// Reading a workflow's definition: its shape as a blueprint, and counts. Plain
// functions over the same data the detail page draws.

/**
 * The workflow's shape for `FlowBlueprint`. A definition has no progress, so
 * every step is drawn the same way, and one that only runs sometimes takes the
 * dashed outline the blueprint already uses for a step not reached.
 */
export function shapeOf(stages: WorkflowStageSpec[]): BlueprintStage[] {
  return stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    status: 'upcoming',
    columns: stage.columns.map((column) =>
      column.map((step) => ({ id: step.id, status: step.sometimes ? 'queued' : 'done' })),
    ),
  }))
}

export const stepCount = (stage: WorkflowStageSpec): number =>
  stage.columns.reduce((sum, column) => sum + column.length, 0)

export const totalSteps = (spec: WorkflowSpec): number =>
  spec.stages.reduce((sum, stage) => sum + stepCount(stage), 0)

/** "5 stages · 12 steps". */
export function shapeLine(spec: WorkflowSpec): string {
  const stages = spec.stages.length
  const steps = totalSteps(spec)
  return `${stages} stages · ${steps} steps`
}
