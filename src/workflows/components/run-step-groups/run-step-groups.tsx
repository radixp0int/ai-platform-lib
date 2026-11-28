import { useMemo, useState } from 'react'
import { ChevronRightIcon, SearchIcon } from '../../../primitives/icons'
import { formatDuration, summarizeStages, type TraceStep } from '../run-trace'
import { TraceStatusIcon, TRACE_STATUS_LABEL } from '../trace-status'
import { STEP_KIND_LABEL, type StepStatus } from '../types'
import type { RunStepGroupsProps, StepFilter } from './types'
// Every step of a run, grouped under its stage: the list half of a run's
// details. It scales to twenty stages because finished and queued stages start
// folded to one header line each (name, state, a mark per step, how many and how
// long), and the stage the run is on stays open. Filters and a search narrow it
// to what matters: what needs you, what failed.

const FILTERS: { id: StepFilter; label: string; test: (status: StepStatus) => boolean }[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'needs', label: 'Needs you', test: (s) => s === 'waiting' },
  { id: 'failed', label: 'Failed', test: (s) => s === 'failed' },
  { id: 'done', label: 'Done', test: (s) => s === 'done' || s === 'approved' },
  { id: 'queued', label: 'Queued', test: (s) => s === 'queued' },
]

const MARK: Partial<Record<StepStatus, string>> = {
  done: 'bg-brand-fg',
  approved: 'bg-brand-fg',
  running: 'bg-brand-solid',
  waiting: 'bg-notify',
  failed: 'bg-danger-solid',
  changes: 'bg-notify',
  skipped: 'shadow-[inset_0_0_0_1px_var(--ink-soft)]',
}

const STATE_TEXT = {
  done: 'text-ink-soft',
  running: 'text-brand-fg',
  waiting: 'text-pill-orange-fg',
  failed: 'text-danger-fg',
  queued: 'text-ink-soft',
}

/** What the right end of a row says: how long it took, or when it is due. */
function timeOf(step: TraceStep): string {
  if (step.status === 'waiting') return step.due ?? ''
  if (step.status === 'queued' || step.status === 'skipped' || step.duration === undefined)
    return '—'
  return formatDuration(step.duration)
}

export function RunStepGroups({
  trace,
  selectedId,
  onSelect,
  waitingLabel = () => 'Needs you',
  filter: heldFilter,
  onFilterChange,
  openStageId,
  className = '',
}: RunStepGroupsProps) {
  const stages = useMemo(() => summarizeStages(trace), [trace])
  const [ownFilter, setOwnFilter] = useState<StepFilter>('all')
  const filter = heldFilter ?? ownFilter
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  // Which stages the reader has flipped from their default. Finished and queued
  // stages start folded; the stage holding the selection never is.
  const [flipped, setFlipped] = useState<string[]>([])
  const [allOpen, setAllOpen] = useState(false)

  const setFilter = (next: StepFilter) => {
    setOwnFilter(next)
    onFilterChange?.(next)
  }
  const test = FILTERS.find((f) => f.id === filter)!.test
  const shows = (step: TraceStep) =>
    test(step.status) && (!needle || step.title.toLowerCase().includes(needle))
  const narrowed = filter !== 'all' || Boolean(needle)

  const stageOfSelected = trace.steps.find((step) => step.id === selectedId)?.stageId
  const foldedByDefault = (id: string, state: string) =>
    (state === 'done' || state === 'queued') && id !== stageOfSelected && id !== openStageId
  const isOpen = (id: string, state: string) =>
    narrowed || allOpen || foldedByDefault(id, state) === flipped.includes(id)
  const foldedFinished = stages.filter(
    (stage) => stage.state === 'done' && !isOpen(stage.id, stage.state),
  ).length

  const toggle = (id: string) =>
    setFlipped((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  return (
    <div className={`flex min-h-0 min-w-0 flex-col ${className}`}>
      <div className="flex flex-col gap-2.5 border-b border-line px-3.5 pt-3.5 pb-3">
        <label className="flex h-9 items-center gap-2 rounded-control border border-line bg-panel-solid px-2.5 text-ink-soft focus-within:ring-2 focus-within:ring-accent">
          <SearchIcon width={14} height={14} aria-hidden />
          <span className="sr-only">Find a step</span>
          <input
            type="search"
            placeholder="Find a step"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-soft"
          />
        </label>
        <div role="group" aria-label="Show" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count = trace.steps.filter((step) => f.test(step.status)).length
            const on = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f.id)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-extrabold transition ${
                  on
                    ? 'border-brand-900 bg-brand-900 text-white dark:border-brand-200 dark:bg-brand-200 dark:text-brand-950'
                    : 'border-line bg-panel-solid text-ink hover:bg-tint/5'
                }`}
              >
                {f.label}
                <span className="tabular-nums opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
      </div>
      {foldedFinished > 0 && !narrowed && (
        <div className="flex items-center gap-2 border-b border-line bg-tint/4 px-3.5 py-2 text-xs text-ink-soft">
          <span>
            {foldedFinished} finished stage{foldedFinished === 1 ? '' : 's'} folded
          </span>
          <button
            type="button"
            onClick={() => setAllOpen(true)}
            className="ml-auto font-bold text-brand-fg hover:underline"
          >
            Expand all
          </button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {stages.map((stage) => {
          const steps = trace.steps.filter((step) => step.stageId === stage.id)
          const shown = steps.filter(shows)
          if (narrowed && shown.length === 0) return null
          const open = isOpen(stage.id, stage.state)
          const waiting = steps.find((step) => step.status === 'waiting')
          const label =
            stage.state === 'waiting' && waiting ? waitingLabel(waiting) : stage.stateLabel
          return (
            <section key={stage.id} aria-label={stage.name}>
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(stage.id)}
                  className="flex w-full items-center gap-2 px-3.5 pt-3 pb-1.5 text-left text-xs text-ink-soft hover:text-ink"
                >
                  <ChevronRightIcon
                    width={13}
                    height={13}
                    aria-hidden
                    className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
                  />
                  <b className="truncate text-[12.5px] font-extrabold text-ink-strong">
                    {stage.name}
                  </b>
                  <span className={`shrink-0 font-bold ${STATE_TEXT[stage.state]}`}>{label}</span>
                  <span aria-hidden className="flex shrink-0 gap-0.5">
                    {stage.marks.map((mark, i) => (
                      <i key={i} className={`h-1 w-3 rounded-full bg-chip ${MARK[mark] ?? ''}`} />
                    ))}
                  </span>
                  <span className="ml-auto shrink-0 tabular-nums">
                    {stage.stepCount} step{stage.stepCount === 1 ? '' : 's'} ·{' '}
                    {stage.duration === undefined ? '—' : formatDuration(stage.duration)}
                  </span>
                </button>
              </h3>
              {open && (
                <ul className="m-0 flex list-none flex-col gap-0.5 px-2 p-0">
                  {shown.map((step) => {
                    const selected = step.id === selectedId
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelect(step.id)}
                          className={`grid w-full grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-x-2.5 rounded-[8px] px-2.5 py-2 text-left transition ${
                            selected
                              ? 'bg-chip shadow-[inset_0_0_0_1px_var(--line)]'
                              : 'hover:bg-tint/5'
                          }`}
                        >
                          <TraceStatusIcon
                            status={step.status}
                            size={16}
                            label={
                              step.status === 'waiting'
                                ? waitingLabel(step)
                                : TRACE_STATUS_LABEL[step.status]
                            }
                            className="mt-px"
                          />
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="flex min-w-0 items-center gap-2">
                              <b
                                className={`truncate text-[13px] font-bold text-ink-strong ${
                                  step.mono ? 'font-mono font-semibold' : ''
                                }`}
                              >
                                {step.title}
                              </b>
                              <span className="shrink-0 rounded-[4px] bg-chip px-1.5 text-[9.5px] leading-[18px] font-extrabold tracking-[0.06em] text-ink-soft uppercase">
                                {STEP_KIND_LABEL[step.kind]}
                              </span>
                            </span>
                            <small className="truncate text-xs text-ink-soft">{step.summary}</small>
                          </span>
                          <span className="pt-px text-[11.5px] whitespace-nowrap text-ink-soft tabular-nums">
                            {timeOf(step)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
        {narrowed && trace.steps.filter(shows).length === 0 && (
          <p className="px-3.5 py-6 text-[13px] text-ink-soft">
            No steps match.{' '}
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
              className="font-bold text-brand-fg hover:underline"
            >
              Clear the filters
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
