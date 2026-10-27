import { SectionCard } from '../../../components/section-card'
import { FlowBlueprint } from '../flow-blueprint'
import { shapeOf, stepCount } from '../workflow-spec'
import type { WorkflowShapeProps } from './types'
// How every run of a workflow is built: its lanes, one bar per step, and the
// lines that join them. The workflow itself, not a run, so nothing in it is done
// or waiting; a step that only runs sometimes keeps its dashed outline.
//
// It is the blueprint the runs list shows under a row, drawn as a card with a
// legend, and it loads no React Flow.

export function WorkflowShape({ stages, name, className = '' }: WorkflowShapeProps) {
  const steps = stages.reduce((sum, stage) => sum + stepCount(stage), 0)
  return (
    <SectionCard
      title="Shape"
      description="How every run is built. Dashed steps only run sometimes."
      className={className}
      footer={
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0">
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-5 rounded-[3px] bg-brand-solid/25" />A step
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-5 rounded-[3px] border border-dashed border-ink-soft/70 bg-panel-solid"
            />
            Runs only sometimes
          </li>
        </ul>
      }
      bodyClassName="overflow-x-auto bg-canvas bg-[radial-gradient(color-mix(in_srgb,var(--brand-800)_14%,transparent)_1px,transparent_1px)] bg-[length:18px_18px]"
    >
      <FlowBlueprint
        appearance="definition"
        stages={shapeOf(stages)}
        label={`${name}: ${stages.length} stages, ${steps} steps`}
        className="min-w-[56rem]"
      />
    </SectionCard>
  )
}
