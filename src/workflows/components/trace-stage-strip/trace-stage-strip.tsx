import { formatDuration, type TraceStageState } from '../run-trace'
import type { StepStatus } from '../types'
import type { TraceStageStripProps } from './types'
// A run's stages as a row of tiles: where each one stands, how many steps are
// in it, how long it took, and one small bar per step so the shape of the stage
// reads before any of it is opened. Picking a tile opens that stage's steps.
//
// It is the trace page's table of contents, so it stays a row of real buttons
// (`aria-pressed`) rather than a tab list: it chooses what to show, and all of
// what it chooses lives in the same place.

const STATE_TEXT: Record<TraceStageState, string> = {
  done: 'text-success-fg',
  running: 'text-brand-fg',
  waiting: 'text-pill-orange-fg',
  failed: 'text-danger-fg',
  queued: 'text-ink-soft',
}

/** One bar per step. Shape and fill both change with the status. */
const MARK: Record<StepStatus, string> = {
  done: 'bg-accent',
  approved: 'bg-accent',
  changes: 'bg-ink-soft/60',
  running: 'bg-brand-solid',
  waiting: 'bg-notify',
  failed: 'bg-danger',
  skipped: 'bg-ink-soft/40',
  queued: 'border border-dashed border-ink-soft/70',
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function TraceStageStrip({
  stages,
  selectedId,
  onSelect,
  label = 'Stages',
  className = '',
}: TraceStageStripProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-2 ${className}`}
    >
      {stages.map((stage) => {
        const selected = stage.id === selectedId
        return (
          <button
            key={stage.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(stage.id)}
            className={`flex min-h-21 flex-col items-start gap-2 rounded-surface border px-3.5 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selected
                ? 'border-accent bg-chip shadow-[0_0_0_1px_var(--accent)]'
                : 'border-line bg-panel-solid hover:bg-tint/5'
            }`}
          >
            <span className="flex w-full items-baseline justify-between gap-2">
              <span className="truncate text-sm font-bold text-ink-strong">{stage.name}</span>
              <span
                className={`shrink-0 text-xs font-bold ${
                  selected && stage.state === 'queued' ? 'text-ink' : STATE_TEXT[stage.state]
                }`}
              >
                {stage.stateLabel}
              </span>
            </span>
            <span aria-hidden className="flex h-1.5 w-full gap-[3px]">
              {stage.marks.map((status, index) => (
                <span
                  // A step has no identity beyond its place in the stage.
                  key={index}
                  className={`h-full min-w-0 flex-1 rounded-[3px] ${MARK[status]}`}
                />
              ))}
            </span>
            <span className={`text-xs ${selected ? 'text-ink' : 'text-ink-soft'}`}>
              {plural(stage.stepCount, 'step')}
              {stage.duration !== undefined && <> · {formatDuration(stage.duration)}</>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
