import type { FoldNodeProps } from './types'
// A whole stage, folded: one bar per step, coloured by that step's status.
//
// This is what lets a ten-stage run stay at the detail tier. The stages either
// side of where the run has got to keep their full nodes; everything further
// away drops to this, which still says how much work the stage holds and how
// far through it the run is. Clicking it unfolds the stage.
//
// The bars read at every zoom tier, so unlike a step this has nothing to shed.
import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'
import { FOLD_BAR_GAP, FOLD_BAR_H, FOLD_PAD } from '../build'
import { useToggleFold } from '../selection'
import type { StepStatus } from '../types'

/* Fill means the step has happened or is happening; an outline means it has
   not. Orange stays reserved for a step that is waiting on a person. */
const BAR: Record<StepStatus, string> = {
  done: 'bg-accent',
  approved: 'bg-accent',
  running: 'bg-brand-solid ring-2 ring-accent/30',
  waiting: 'bg-notify ring-2 ring-notify/25',
  failed: 'bg-danger-solid',
  changes: 'bg-ink-soft',
  queued: 'border border-dashed border-ink-soft/70 bg-panel-solid',
  skipped: 'border border-dashed border-ink-soft/45 bg-panel-solid',
}

const handleStyle = {
  width: 8,
  height: 8,
  background: 'var(--panel-solid)',
  border: '1.5px solid color-mix(in srgb, var(--ink-soft) 55%, transparent)',
}

function FoldNodeView({ data }: FoldNodeProps) {
  const { stageId, name, steps, statuses } = data
  const toggleFold = useToggleFold()
  const count = `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <button
        type="button"
        // `nodrag` so a press on the bars is a click rather than a pan.
        className="nodrag flex w-full cursor-pointer flex-col rounded-control transition hover:bg-tint/8 focus-visible:outline-2 focus-visible:outline-accent"
        style={{ gap: FOLD_BAR_GAP, padding: FOLD_PAD }}
        onClick={(event) => {
          event.stopPropagation()
          toggleFold(stageId)
        }}
        aria-label={`Show the ${name} stage, ${count}`}
        title={`${name} · ${count}`}
      >
        {steps.map((step) => (
          <span
            key={step.id}
            aria-hidden
            className={`block w-full rounded-[4px] ${BAR[statuses[step.id] ?? 'queued']}`}
            style={{ height: FOLD_BAR_H }}
          />
        ))}
      </button>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  )
}

export const FoldNode = memo(FoldNodeView)
