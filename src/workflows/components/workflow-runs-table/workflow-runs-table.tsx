import { Button } from '../../../primitives/button'
import { Link } from '../../../primitives/link'
import { StageProgress } from '../stage-progress'
import type { StageStatus } from '../types'
import type { WorkflowRunRow, WorkflowRunState } from '../workflow-spec'
import type { WorkflowRunsTableProps } from './types'
// A workflow's runs, newest first: what each is called, what it came to, how far
// through the stages it got, when it started and how long it took. Each row is a
// whole link to that run's trace.
//
// The result is a word as well as a dot, so a run is told apart by more than
// colour. Orange stays reserved for a run waiting on a person.

const DOT: Record<WorkflowRunState, string> = {
  waiting: 'bg-notify',
  running: 'bg-brand-solid',
  done: 'bg-success',
  stopped: 'border border-ink-soft bg-panel-solid',
}

const GRID =
  'grid min-w-[56rem] grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_14.5rem_minmax(0,0.8fr)_6.5rem] items-center gap-x-4.5'

function segments(run: WorkflowRunRow, stageCount: number): StageStatus[] {
  const live = run.state === 'waiting' || run.state === 'running'
  return Array.from({ length: stageCount }, (_, index) =>
    index < run.stagesDone ? 'done' : index === run.stagesDone && live ? 'current' : 'upcoming',
  )
}

export function WorkflowRunsTable({
  runs,
  stageCount,
  total,
  hrefFor,
  onShowAll,
  className = '',
}: WorkflowRunsTableProps) {
  return (
    <section
      aria-label="Runs"
      className={`flex flex-col overflow-x-auto rounded-dialog border border-line ${className}`}
    >
      <div
        className={`${GRID} min-h-10 bg-canvas px-4.5 text-xs font-bold text-ink-soft`}
        aria-hidden
      >
        <span>Run</span>
        <span>Result</span>
        <span>Progress</span>
        <span>Started</span>
        <span className="text-right">Took</span>
      </div>
      {runs.map((run) => {
        const href = hrefFor(run)
        const rowClass = `${GRID} min-h-15 border-t border-line px-4.5 py-2 text-ink ${
          run.state === 'waiting' ? 'bg-notify/5' : ''
        }`
        const cells = (
          <>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold text-ink-strong">{run.name}</span>
              <span className="text-xs text-ink-soft">{run.startedBy}</span>
            </span>
            <span className="flex items-center gap-2 text-[13px] font-bold text-ink-strong">
              <span aria-hidden className={`size-2 shrink-0 rounded-full ${DOT[run.state]}`} />
              {run.result}
            </span>
            <span className="flex flex-col gap-1.5">
              <StageProgress
                segments={segments(run, stageCount)}
                label={run.progress}
                current={run.state === 'waiting' ? 'waiting' : 'running'}
              />
              <span className="text-xs text-ink">{run.progress}</span>
            </span>
            <span className="text-[13px]">{run.started}</span>
            <span className="text-right text-[13px] tabular-nums">{run.took ?? '—'}</span>
          </>
        )
        // A run with nowhere to open is a plain row, not a dead link.
        return href ? (
          <Link
            key={run.id}
            variant="plain"
            href={href}
            className={`${rowClass} transition hover:bg-tint/5`}
          >
            {cells}
          </Link>
        ) : (
          <div key={run.id} className={rowClass}>
            {cells}
          </div>
        )
      })}
      <div className="flex min-h-13 items-center justify-between gap-3 border-t border-line px-4.5 text-[13px] text-ink-soft">
        <span>
          Showing the latest {runs.length} of {total} runs
        </span>
        <Button variant="secondary" size="lg" onClick={onShowAll}>
          See all {total} runs
        </Button>
      </div>
    </section>
  )
}
