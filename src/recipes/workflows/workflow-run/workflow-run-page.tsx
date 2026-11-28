// One run of a workflow, as a page with two views (boards RunA1 to RunA3):
// Canvas, the React Flow map of the run, and Details, the full run details.
//
// A slim navy band holds the trail, the Canvas | Details toggle, the run's
// title and status, a line of facts and the stage bar, with counters for what
// needs you and what failed. Details lists every step grouped by stage
// (RunStepGroups) beside the selected step (TraceInspector): an approval bar or
// a failed step's bar on top, its facts, then Summary, Trace, Input and output
// and Raw span.
//
// A run that needs you opens on Details with that step selected; a failed step
// opens on Trace; a running run with nothing pending opens on Canvas; a
// finished run opens on Details with Run again.
import { ReactFlowProvider } from '@xyflow/react'
import { useMemo, useState } from 'react'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { Alert } from '../../../primitives/alert'
import { Breadcrumbs } from '../../../primitives/breadcrumbs'
import { Button, ButtonLink } from '../../../primitives/button'
import { EmptyState } from '../../../primitives/empty-state'
import {
  ChevronLeftIcon,
  CopyIcon,
  DotsIcon,
  HistoryIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  RefreshIcon,
  WorkflowIcon,
  XIcon,
} from '../../../primitives/icons'
import { Menu, MenuItem, MenuSeparator } from '../../../primitives/menu'
import { Modal } from '../../../primitives/modal'
import { Popover } from '../../../primitives/popover'
import { SegmentedControl } from '../../../primitives/segmented-control'
import { Skeleton } from '../../../primitives/skeleton'
import { DecisionForm } from '../../../workflows/components/decision-form'
import { RunLog } from '../../../workflows/components/run-log'
import { RunStepGroups, type StepFilter } from '../../../workflows/components/run-step-groups'
import type { RunTrace, TraceStep } from '../../../workflows/components/run-trace'
import { StageProgress } from '../../../workflows/components/stage-progress'
import {
  TraceInspector,
  type TraceInspectorTab,
} from '../../../workflows/components/trace-inspector'
import { EDGE_TOKENS, WorkflowCanvas } from '../../../workflows/components/workflow-canvas'
import type { Decision } from '../../../workflows/engine'
import { usePageToast } from '../../page-toast'
import { VENDOR_RUN, type RunRecord } from '../fixtures/runs'
import { DEFAULT_LINKS, type WorkflowLinks } from '../links'
import type { RecipeState } from '../types'
import { graphOf, logOf, stageStates } from './run-graph'

export type RunView = 'canvas' | 'details'

export type WorkflowRunPageProps = {
  /** The run to show. Defaults to the vendor contract review waiting on you. */
  run?: RunRecord
  /** `loading` draws the page's frame while the run arrives; `unavailable` says it can't. */
  state?: RecipeState
  /** The view to open on. Left out, it follows the run: see the note at the top. */
  view?: RunView
  /** The step to select in Details. */
  step?: string
  /** A stage whose group Details unfolds. */
  stage?: string
  /** Opens the run log on the canvas. */
  log?: boolean
  links?: WorkflowLinks
  onRetry?: () => void
}

/** Past this many stages the band's bar drops the names and says where the run is. */
const NAMED_STAGES = 6

const waitingStep = (trace: RunTrace) => trace.steps.find((s) => s.status === 'waiting')
const failedSteps = (trace: RunTrace) => trace.steps.filter((s) => s.status === 'failed')

function openingView(trace: RunTrace): RunView {
  if (trace.state === 'running' && failedSteps(trace).length === 0) return 'canvas'
  return 'details'
}

function openingStep(trace: RunTrace): string | undefined {
  const begun = trace.steps.filter((s) => s.startedAt !== undefined)
  return (waitingStep(trace) ?? failedSteps(trace)[0] ?? begun[begun.length - 1])?.id
}

/** The band's status pill: what the run as a whole is doing. */
function runStatus(run: RunRecord): {
  label: string
  tone: 'needs' | 'failed' | 'running' | 'done'
} {
  const { trace } = run
  if (trace.state === 'waiting')
    return { label: run.waitingOn ? `Waiting on ${run.waitingOn}` : 'Needs you', tone: 'needs' }
  if (trace.state === 'failed')
    return { label: `Failed at ${failedSteps(trace)[0]?.title ?? 'a step'}`, tone: 'failed' }
  if (trace.state === 'running') return { label: 'Running', tone: 'running' }
  return { label: 'Done', tone: 'done' }
}

const PILL = {
  needs: 'bg-notify/25 text-[#fdba8c]',
  failed: 'bg-danger-solid/25 text-[#fca5a5]',
  running: 'bg-brand-300/20 text-brand-100',
  done: 'bg-white/12 text-brand-100',
}

const bandButton =
  'inline-flex h-8 items-center gap-1.5 rounded-control border border-white/25 bg-white/6 px-3 text-[13px] font-extrabold text-white transition hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function WorkflowRunPage({
  run: given = VENDOR_RUN,
  state = 'ready',
  view: initialView,
  step: initialStep,
  stage,
  log: initialLog = false,
  links = DEFAULT_LINKS,
  onRetry,
}: WorkflowRunPageProps) {
  // The run as this page has changed it: a decision moves its steps on.
  const [trace, setTrace] = useState(given.trace)
  const run = useMemo(() => ({ ...given, trace }), [given, trace])
  const [view, setView] = useState<RunView>(initialView ?? openingView(given.trace))
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialStep ?? openingStep(given.trace),
  )
  const [filter, setFilter] = useState<StepFilter>('all')
  const [paused, setPaused] = useState(false)
  const [logOpen, setLogOpen] = useState(initialLog)
  const [preview, setPreview] = useState(false)
  const [pushed, setPushed] = useState(Boolean(initialStep))
  const [canceling, setCanceling] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const narrow = useMediaQuery('(max-width: 1023px)')
  const [toast, say] = usePageToast()

  const { graph, statuses } = useMemo(() => graphOf(run), [run])
  const logEntries = useMemo(() => logOf(run), [run])
  const stepTitles = useMemo(
    () => new Map(trace.steps.map((s) => [s.id, s.title] as [string, string])),
    [trace],
  )

  if (state !== 'ready') {
    return (
      <div className="flex h-full min-h-0 flex-col bg-canvas">
        <header className="bg-brand-900 px-7 py-4 text-white max-md:px-4">
          <Breadcrumbs
            tone="inverse"
            items={[{ label: 'Workflows', href: links.list }, { label: 'Run' }]}
          />
          {state === 'loading' ? (
            <div role="status" aria-label="Loading the run" className="mt-3 flex flex-col gap-2.5">
              <Skeleton className="h-6 w-80 max-w-full bg-white/15" />
              <Skeleton className="h-3.5 w-[28rem] max-w-full bg-white/10" />
              <Skeleton className="h-1.5 w-[30rem] max-w-full bg-white/10" />
            </div>
          ) : (
            <h1 className="mt-2 text-[22px] font-light">Run unavailable</h1>
          )}
        </header>
        {state === 'loading' ? (
          <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] max-lg:grid-cols-1">
            <div className="flex flex-col gap-3 border-r border-line bg-panel-solid p-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
            <div className="flex flex-col gap-3 p-8 max-lg:hidden">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-[32rem]" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid flex-1 place-items-center p-6">
            <EmptyState className="flex max-w-md flex-col items-center gap-3 rounded-surface border border-line bg-panel-solid px-8 py-10 text-center">
              <h2 className="text-base font-bold text-ink-strong">This run couldn’t be loaded</h2>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                The workflow service didn’t answer. The run itself carries on; try again in a
                moment.
              </p>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={onRetry}>
                  Try again
                </Button>
                <ButtonLink variant="secondary" size="sm" href={links.list}>
                  Back to Workflows
                </ButtonLink>
              </div>
            </EmptyState>
          </div>
        )}
      </div>
    )
  }

  const status = runStatus(run)
  const waiting = waitingStep(trace)
  const failed = failedSteps(trace)
  const stageStatus = stageStates(trace)
  const at = stageStatus.indexOf('current')
  const current = at >= 0 ? trace.stages[at] : undefined
  const stageLine = current
    ? `Stage ${at + 1} of ${trace.stages.length} · ${current.name}`
    : trace.state === 'done'
      ? `All ${trace.stages.length} stages done`
      : `${trace.stages.length} stages`
  const selected = trace.steps.find((s) => s.id === selectedId)
  const selectedStage = trace.stages.find((s) => s.id === selected?.stageId)
  const row = { id: run.workflowId, runId: trace.id }
  const ended = trace.state === 'done'
  const waitingLabel = (step: TraceStep) =>
    step.assignee && step.assignee !== 'You'
      ? `Waiting on ${run.waitingOn ?? step.assignee}`
      : 'Needs you'

  const select = (id: string) => {
    setSelectedId(id)
    setPushed(true)
  }
  const show = (next: StepFilter) => {
    setFilter(next)
    setView('details')
    setPushed(false)
  }

  const decide = (decision: Decision, note?: string) => {
    if (!waiting) return
    setTrace((t) => ({
      ...t,
      state: decision === 'approved' ? 'running' : decision === 'declined' ? 'done' : 'running',
      steps: t.steps.map((s) =>
        s.id === waiting.id
          ? {
              ...s,
              status:
                decision === 'approved'
                  ? 'approved'
                  : decision === 'changes'
                    ? 'changes'
                    : 'failed',
              summary:
                decision === 'approved'
                  ? 'Approved by you'
                  : decision === 'changes'
                    ? 'Sent back for changes'
                    : 'Declined',
              history: [
                ...(s.history ?? []),
                {
                  at: 'Now',
                  text: note
                    ? `${decision === 'approved' ? 'Approved' : decision === 'changes' ? 'Sent back' : 'Declined'}: “${note}”`
                    : decision === 'approved'
                      ? 'Approved'
                      : decision === 'changes'
                        ? 'Sent back'
                        : 'Declined',
                },
              ],
            }
          : s,
      ),
    }))
    say(
      decision === 'approved'
        ? `Approved. ${trace.workflow} carries on`
        : decision === 'changes'
          ? 'Sent back for changes'
          : 'Declined. The run stops here',
    )
  }

  const stepBar = (step: TraceStep) => {
    if (step.status === 'waiting') {
      return step.assignee && step.assignee !== 'You' ? (
        <Alert
          variant="bar"
          tone="warning"
          layout="inline"
          title={waitingLabel(step)}
          action={{
            label: `Remind ${run.waitingOn ?? step.assignee}`,
            onClick: () => say(`Reminder sent to ${step.assignee}`),
          }}
        >
          {step.due ? `Due ${step.due.toLowerCase()}` : undefined}
        </Alert>
      ) : (
        <Alert variant="bar" tone="warning" title="Your approval is needed" icon={false}>
          <span className="mb-2.5 block">Due {step.due?.toLowerCase()}</span>
          <DecisionForm
            key={step.id}
            id={`decide-${step.id}`}
            decisions={['approved', 'changes', 'declined']}
            busy={false}
            onDecide={decide}
          />
        </Alert>
      )
    }
    if (step.status === 'failed') {
      return (
        <Alert variant="bar" tone="error" title={`${step.title} failed`}>
          <span className="block">{step.failure}</span>
          <span className="mt-2.5 flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<RefreshIcon width={13} height={13} />}
              onClick={() => say(`Retrying ${step.title}`)}
            >
              Retry step
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setView('canvas')
                setLogOpen(true)
              }}
            >
              Open run log
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => say('Choosing someone to assign would open here')}
            >
              Assign to someone
            </Button>
            {step.retries && (
              <small className="ml-auto text-xs text-ink-soft">{step.retries} retries used</small>
            )}
          </span>
        </Alert>
      )
    }
    return undefined
  }

  const stepsInStage = selected ? trace.steps.filter((s) => s.stageId === selected.stageId) : []
  const panel = selected ? (
    <TraceInspector
      key={selected.id}
      step={selected}
      stageName={selectedStage?.name ?? ''}
      runId={trace.id}
      defaultTab={selected.status === 'failed' ? 'trace' : ('summary' as TraceInspectorTab)}
      statusLabel={selected.status === 'waiting' ? waitingLabel(selected) : undefined}
      context={`${selectedStage?.name} · step ${stepsInStage.indexOf(selected) + 1} of ${stepsInStage.length}`}
      actions={stepBar(selected)}
      className="border-0 bg-transparent shadow-none"
    />
  ) : (
    <EmptyState className="grid h-full place-items-center p-8 text-center text-[13px] text-ink-soft">
      Pick a step to see what it did.
    </EmptyState>
  )

  const list = (
    <RunStepGroups
      trace={trace}
      selectedId={selectedId}
      onSelect={select}
      waitingLabel={waitingLabel}
      filter={filter}
      onFilterChange={setFilter}
      openStageId={stage}
      className="h-full"
    />
  )

  const mainAction =
    trace.state === 'done' ? (
      <button
        type="button"
        className={bandButton}
        onClick={() => say(`The start form for ${trace.workflow} would open here`)}
      >
        <PlayIcon width={13} height={13} />
        Run again
      </button>
    ) : trace.state === 'failed' && failed[0] ? (
      <button
        type="button"
        className={bandButton}
        onClick={() => say(`Retrying ${failed[0].title}`)}
      >
        <RefreshIcon width={13} height={13} />
        Retry step
      </button>
    ) : (
      <button
        type="button"
        className={bandButton}
        aria-pressed={paused}
        onClick={() => {
          setPaused(!paused)
          say(`Run ${trace.id} ${paused ? 'resumed' : 'paused'}`)
        }}
      >
        {paused ? <PlayIcon width={13} height={13} /> : <PauseIcon width={13} height={13} />}
        {paused ? 'Resume run' : 'Pause run'}
      </button>
    )

  const choose = (fn: () => void) => () => {
    setMenuOpen(false)
    fn()
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="shrink-0 bg-brand-900 px-7 pt-3 pb-3.5 text-white max-md:px-4 dark:border-b dark:border-line dark:bg-panel-solid">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 max-md:grid-cols-[1fr_auto]">
          <Breadcrumbs
            tone="inverse"
            className="min-w-0 [&>ol]:flex-nowrap"
            items={[
              { label: 'Workflows', href: links.list },
              { label: trace.workflow, href: links.workflow(row) },
            ]}
          />
          <SegmentedControl
            label="View"
            tone="inverse"
            value={view}
            onValueChange={(next) => setView(next as RunView)}
            options={[
              { value: 'canvas', label: 'Canvas' },
              { value: 'details', label: 'Details' },
            ]}
            className="justify-self-center max-md:col-start-2 max-md:row-start-1"
          />
          <div className="flex items-center justify-end gap-2 max-md:col-span-2">
            {view === 'canvas' && (
              <button
                type="button"
                aria-label="Run log"
                title="Run log"
                aria-pressed={logOpen}
                aria-controls="wf-run-log"
                onClick={() => setLogOpen(!logOpen)}
                className={`${bandButton} w-8 justify-center px-0`}
              >
                <HistoryIcon width={14} height={14} />
              </button>
            )}
            {mainAction}
            <button
              ref={setMenuAnchor}
              type="button"
              aria-label="More actions"
              title="More actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className={`${bandButton} w-8 justify-center px-0`}
            >
              <DotsIcon width={15} height={15} />
            </button>
            <Popover
              anchor={menuAnchor}
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              label={`Actions for run ${trace.id}`}
              width={232}
              align="end"
            >
              <Menu aria-label={`Actions for run ${trace.id}`}>
                <MenuItem
                  icon={<WorkflowIcon width={15} height={15} />}
                  label="View workflow"
                  onSelect={choose(() => links.go(links.workflow(row)))}
                />
                <MenuItem
                  icon={<PencilIcon width={15} height={15} />}
                  label="Edit workflow"
                  onSelect={choose(() => say(`The editor for ${trace.workflow} would open here`))}
                />
                <MenuItem
                  icon={<PlayIcon width={15} height={15} />}
                  label="Start a run"
                  onSelect={choose(() =>
                    say(`The start form for ${trace.workflow} would open here`),
                  )}
                />
                <MenuItem
                  icon={<RefreshIcon width={15} height={15} />}
                  label="Restart run"
                  hint={ended ? 'The run has ended' : undefined}
                  disabled={ended}
                  onSelect={choose(() => say(`Run ${trace.id} restarted`))}
                />
                <MenuItem
                  icon={<CopyIcon width={15} height={15} />}
                  label="Copy run link"
                  onSelect={choose(() => {
                    const url = new URL(links.run(row), window.location.href).toString()
                    void navigator.clipboard?.writeText(url).catch(() => undefined)
                    say(`Copied the link to run ${trace.id}`)
                  })}
                />
                <MenuSeparator />
                <MenuItem
                  icon={<XIcon width={15} height={15} />}
                  label="Cancel run…"
                  tone="danger"
                  hint={ended ? 'The run has ended' : undefined}
                  disabled={ended}
                  onSelect={choose(() => setCanceling(true))}
                />
              </Menu>
            </Popover>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="m-0 min-w-0 truncate text-[22px] leading-tight font-light tracking-tight max-md:text-lg">
            Run {trace.id} · {run.subject}
          </h1>
          <span
            className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-extrabold ${PILL[status.tone]}`}
          >
            <i aria-hidden className="size-[7px] rounded-full bg-current" />
            {paused ? 'Paused' : status.label}
          </span>
        </div>
        <p className="mt-1 text-[12.5px] text-brand-100">{run.facts}</p>
        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
          <StageProgress
            label={stageLine}
            tone="inverse"
            names={
              trace.stages.length <= NAMED_STAGES ? trace.stages.map((s) => s.name) : undefined
            }
            segments={stageStatus.map((s) =>
              s === 'current' ? 'current' : s === 'done' ? 'done' : 'upcoming',
            )}
            current={
              trace.state === 'waiting'
                ? 'waiting'
                : trace.state === 'failed'
                  ? 'failed'
                  : 'running'
            }
            className={
              trace.stages.length <= NAMED_STAGES
                ? 'w-[min(100%,32rem)]'
                : 'w-[min(100%,24rem)] self-center'
            }
          />
          {(trace.stages.length > NAMED_STAGES || !current) && (
            <span className="text-[12.5px] font-bold text-white">{stageLine}</span>
          )}
          <span className="flex-1" />
          {waiting && (
            <button
              type="button"
              onClick={() => show('needs')}
              className="inline-flex h-6 items-center rounded-full bg-notify/25 px-2.5 text-xs font-extrabold text-[#fdba8c] hover:bg-notify/35"
            >
              {waitingLabel(waiting) === 'Needs you' ? '1 needs you' : '1 waiting'}
            </button>
          )}
          {failed.length > 0 && trace.state !== 'failed' && (
            <button
              type="button"
              onClick={() => show('failed')}
              className="inline-flex h-6 items-center rounded-full bg-danger-solid/25 px-2.5 text-xs font-extrabold text-[#fca5a5] hover:bg-danger-solid/35"
            >
              {failed.length} failed step{failed.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
      </header>

      {view === 'canvas' ? (
        <div className={`relative flex min-h-0 flex-1 flex-col ${EDGE_TOKENS}`}>
          <div className="relative min-h-0 flex-1">
            <ReactFlowProvider>
              <WorkflowCanvas
                graph={graph}
                statuses={statuses}
                selectedId={selectedId ?? null}
                onSelect={(id) => {
                  if (!id) return setPreview(false)
                  setSelectedId(id)
                  setPreview(true)
                }}
                selectedStageId={selected?.stageId ?? null}
                onSelectStage={() => undefined}
                stageFocusSeq={0}
              />
            </ReactFlowProvider>
            {preview && selected && (
              <section
                aria-label="Step preview"
                className="absolute right-4 bottom-4 z-10 flex w-[min(22rem,calc(100%-2rem))] flex-col gap-2 rounded-surface border border-line bg-panel-solid p-4 shadow-lg shadow-(color:--shadow-menu)"
              >
                <span className="text-[11px] font-extrabold tracking-[0.06em] text-ink-soft uppercase">
                  {selectedStage?.name}
                </span>
                <h2
                  className={`m-0 text-[15px] font-bold text-ink-strong ${selected.mono ? 'font-mono' : ''}`}
                >
                  {selected.title}
                </h2>
                <p className="m-0 text-[13px] text-ink">{selected.summary}</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setView('details')
                      setPushed(true)
                    }}
                  >
                    Open in details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPreview(false)}>
                    Close
                  </Button>
                </div>
              </section>
            )}
          </div>
          <RunLog
            entries={logEntries}
            trimmed={0}
            open={logOpen}
            stepTitles={stepTitles}
            onSelectStep={(id) => {
              setSelectedId(id)
              setPreview(true)
            }}
            onClose={() => setLogOpen(false)}
          />
        </div>
      ) : narrow ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-panel-solid">
          {pushed && selected ? (
            <div className="flex flex-col gap-2 px-2 py-3">
              <button
                type="button"
                onClick={() => setPushed(false)}
                className="inline-flex items-center gap-1 self-start rounded-control px-2 py-1 text-[13px] font-bold text-brand-fg hover:bg-tint/5"
              >
                <ChevronLeftIcon width={14} height={14} />
                {selectedStage?.name}
              </button>
              {panel}
            </div>
          ) : (
            list
          )}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
          <aside aria-label="Steps" className="min-h-0 border-r border-line bg-panel-solid">
            {list}
          </aside>
          <div className="min-h-0 overflow-y-auto px-4 py-2">{panel}</div>
        </div>
      )}

      <Modal
        open={canceling}
        onOpenChange={setCanceling}
        title={`Cancel run ${trace.id}?`}
        description="Steps still to come won’t run."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCanceling(false)}>
              Keep it running
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setCanceling(false)
                say(`Run ${trace.id} canceled`)
              }}
            >
              Cancel run
            </Button>
          </>
        }
      />
      {toast}
    </div>
  )
}
