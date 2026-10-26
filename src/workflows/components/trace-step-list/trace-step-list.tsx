import { formatDuration } from '../run-trace'
import { TraceKindTag, TraceStatusIcon, TRACE_STATUS_LABEL } from '../trace-status'
import type { TraceStepListProps } from './types'
// The steps of one stage, each a card: its status, its name, who does the work,
// what it came to in a line, and how long it took. Picking one opens its trace.
//
// A list of buttons with `aria-pressed`, not a listbox: each card is an action
// that moves the trace beside it, and a screen reader should say so.

export function TraceStepList({
  steps,
  selectedId,
  onSelect,
  heading,
  empty,
  className = '',
}: TraceStepListProps) {
  return (
    <section className={`flex min-w-0 flex-col gap-2 ${className}`}>
      {heading && <h2 className="m-0 mb-0.5 text-[13px] font-bold text-ink-soft">{heading}</h2>}
      {steps.length === 0 && empty}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {steps.map((step) => {
          const selected = step.id === selectedId
          // Ink-soft on the selected card's chip wash is under 4.5:1, so it steps up to ink.
          const quiet = selected ? 'text-ink' : 'text-ink-soft'
          return (
            <li key={step.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(step.id)}
                className={`flex w-full items-start gap-3 rounded-surface border px-3.5 py-3 text-left shadow-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  selected ? 'border-accent bg-chip' : 'border-line bg-panel-solid hover:bg-tint/5'
                }`}
              >
                <span className="pt-px">
                  <TraceStatusIcon status={step.status} label={TRACE_STATUS_LABEL[step.status]} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`min-w-0 text-sm font-bold break-words text-ink-strong ${
                        step.mono ? 'font-mono' : ''
                      }`}
                    >
                      {step.title}
                    </span>
                    {(step.kind === 'agent' || step.kind === 'human') && (
                      <TraceKindTag kind={step.kind} />
                    )}
                  </span>
                  <span className={`text-[13px] leading-snug ${quiet}`}>{step.summary}</span>
                </span>
                {step.duration !== undefined && (
                  <span className={`shrink-0 text-xs font-semibold tabular-nums ${quiet}`}>
                    {formatDuration(step.duration)}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
