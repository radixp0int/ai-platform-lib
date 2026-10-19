import { SectionLabel } from '../../../primitives/section-label'
import { StatusDot } from '../../../primitives/status-dot'
import type { RecentRun, RecentRunsProps } from './types'
// The runs someone was last looking at, so they can change run without going
// back to the table.
//
// Grouped by what each one needs rather than by recency: the reason to leave the
// run on screen is nearly always that another one is waiting on a person, so
// those come first and carry how long they have left.

const GROUPS: { state: RecentRun['state']; label: string }[] = [
  { state: 'waiting', label: 'Needs a person' },
  { state: 'running', label: 'Running on its own' },
  { state: 'idle', label: 'Idle' },
]

const DOT: Record<RecentRun['state'], string> = {
  waiting: 'bg-notify',
  running: 'bg-brand-solid',
  idle: 'bg-ink-soft/50',
}

export function RecentRuns({ runs, activeId, onOpen, className = '' }: RecentRunsProps) {
  if (runs.length === 0) {
    return (
      <p className={`px-2.5 text-[13px] leading-5 text-ink-soft ${className}`}>No recent runs.</p>
    )
  }
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {GROUPS.map(({ state, label }) => {
        const group = runs.filter((run) => run.state === state)
        if (group.length === 0) return null
        return (
          <section key={state} aria-label={label} className="flex flex-col gap-0.5">
            <div className="mb-1 flex items-center gap-2 px-2.5">
              <SectionLabel>{label}</SectionLabel>
              <span className="text-[11px] font-bold text-ink-soft tabular-nums">
                {group.length}
              </span>
            </div>
            {group.map((run) => {
              const active = run.id === activeId
              return (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => onOpen(run.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-control px-2.5 py-1.5 text-left transition ${
                    active ? 'bg-chip ring-1 ring-accent' : 'hover:bg-tint/6'
                  }`}
                >
                  <StatusDot className={`size-2 shrink-0 rounded-full ${DOT[state]}`} aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] leading-5 font-bold text-ink-strong">
                      {run.title}
                    </span>
                    <span className="truncate text-xs leading-[17px] text-ink-soft">{run.sub}</span>
                  </span>
                  {run.trailing &&
                    (state === 'waiting' ? (
                      <span className="inline-flex h-5 shrink-0 items-center rounded-control bg-notify px-1.5 text-[11px] font-bold text-on-notify">
                        {run.trailing}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[11.5px] font-semibold text-ink-soft">
                        {run.trailing}
                      </span>
                    ))}
                </button>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
