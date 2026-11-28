// Every workflow in a tenant and where each one's live run has got to: the
// Finals 2.0 runs list (boards RunsD1 to RunsD4).
//
// The navy PageBand carries the title, the page's actions and the summary
// strip; each figure filters the grid to itself. Under it, one card holds a
// DataGrid. A row is a workflow with its live run: the run's status, a stage
// bar, what is happening now, and the row's actions (Review where it needs
// someone, Open live run, View workflow and a ⋯ menu). Its chevron opens a
// RunGlance: the windowed stage line and step chain, what the run waits on, the
// latest events, and the ways into the run page.
//
// The page owns its query state and filters in memory, so a real one swaps the
// `useMemo`s for a request and changes nothing else.
import { useMemo, useState } from 'react'
import {
  DataGrid,
  downloadRows,
  findMatches,
  termMatches,
  type ExportColumn,
  type FilterTerm,
  type FilterTermField,
} from '../../../components/data-grid'
import { sortRows, type Column } from '../../../components/data-table'
import type { FilterField } from '../../../components/filter-panel'
import { PageBand, type PageBandStat } from '../../../components/page-header'
import type { Sort } from '../../../components/paging'
import { RowActions, type RowMenuEntry } from '../../../components/row-actions'
import { Alert } from '../../../primitives/alert'
import { Button, ButtonLink } from '../../../primitives/button'
import {
  CopyIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  WorkflowIcon,
  XIcon,
} from '../../../primitives/icons'
import { Link } from '../../../primitives/link'
import { Modal } from '../../../primitives/modal'
import { Pill, type PillTone } from '../../../primitives/pill'
import { RunGlance } from '../../../workflows/components/run-glance'
import { StageProgress } from '../../../workflows/components/stage-progress'
import type { StageStatus } from '../../../workflows/components/types'
import { GridCard } from '../../grid-card'
import { usePageToast } from '../../page-toast'
import {
  STATUS_LABEL,
  WORKFLOWS,
  needsReview,
  pillLabel,
  reviewStep,
  stageLine,
  type WorkflowDue,
  type WorkflowRow,
  type WorkflowStarter,
  type WorkflowStatus,
} from '../fixtures/workflows'
import { DEFAULT_LINKS, type WorkflowLinks } from '../links'
import type { RecipeState } from '../types'

export type WorkflowsPageProps = {
  /** The rows to list. Defaults to the ten authored workflows; `[]` is the empty state. */
  workflows?: WorkflowRow[]
  /** `loading` draws skeleton rows; `unavailable` says the list could not be loaded. */
  state?: RecipeState
  /** Where the names, chips and buttons lead. */
  links?: WorkflowLinks
  /** Rows open at first, by id. */
  defaultExpanded?: string[]
  /** Whether the band's summary strip starts open. */
  defaultSummaryOpen?: boolean
  onRetry?: () => void
}

const PILL: Record<WorkflowStatus, PillTone> = {
  needs: 'orange',
  waiting: 'orange',
  failed: 'danger',
  running: 'brand',
  idle: 'neutral',
}

/** The current stage's colour: orange when it waits on a person, red when a step failed. */
const CURRENT: Record<WorkflowStatus, 'waiting' | 'failed' | 'running'> = {
  needs: 'waiting',
  waiting: 'waiting',
  failed: 'failed',
  running: 'running',
  idle: 'running',
}

const STARTER_LABEL: Record<WorkflowStarter, string> = {
  you: 'Me',
  others: 'Someone else',
  schedule: 'A schedule',
}

const DUE_LABEL: Record<WorkflowDue, string> = {
  today: 'Due today',
  week: 'Due this week',
  none: 'No deadline',
}

const STATUSES: WorkflowStatus[] = ['needs', 'waiting', 'failed', 'running', 'idle']

const TERM_FIELDS: (FilterTermField & { key: 'name' | 'now' | 'startedBy' })[] = [
  { key: 'name', label: 'Workflow', glyph: 'Aa', param: 'name__icontains' },
  { key: 'now', label: 'Now', glyph: '▸', param: 'now__icontains' },
  { key: 'startedBy', label: 'Started by', glyph: '◔', param: 'started_by__icontains' },
]

const EXPORT_COLUMNS: ExportColumn<WorkflowRow>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Workflow' },
  { key: 'status', header: 'Status', value: pillLabel },
  { key: 'subject', header: 'Live run' },
  { key: 'stage', header: 'Progress', value: stageLine },
  { key: 'now', header: 'Now' },
  { key: 'startedBy', header: 'Started by' },
  { key: 'updated', header: 'Updated' },
]

/** The last rows of a page open their menu upward, so it stays on screen. */
const MENU_UP_ROWS = 2

const caps = 'text-[10.5px] font-extrabold tracking-[0.07em] text-ink-soft uppercase'

function segments(row: WorkflowRow): StageStatus[] {
  return row.stages.map((stage) =>
    stage.state === 'done' ? 'done' : stage.state === 'queued' ? 'upcoming' : 'current',
  )
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function WorkflowsPage({
  workflows = WORKFLOWS,
  state = 'ready',
  links = DEFAULT_LINKS,
  defaultExpanded = [],
  defaultSummaryOpen = false,
  onRetry,
}: WorkflowsPageProps) {
  const [terms, setTerms] = useState<FilterTerm[]>([])
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([])
  const [starters, setStarters] = useState<WorkflowStarter[]>([])
  const [dues, setDues] = useState<WorkflowDue[]>([])
  const [sort, setSort] = useState<Sort[]>([{ field: 'updated', direction: 'desc' }])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded)
  const [summaryOpen, setSummaryOpen] = useState(defaultSummaryOpen)
  const [paused, setPaused] = useState<string[]>([])
  const [canceling, setCanceling] = useState<WorkflowRow | null>(null)
  const [toast, say] = usePageToast()

  const columns = useMemo<Column<WorkflowRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Workflow',
        sortKey: 'name',
        width: '22%',
        cell: (w) => (
          <span className="flex min-w-0 flex-col">
            <Link
              variant="plain"
              href={links.workflow(w)}
              className="truncate text-[13.5px] font-bold text-ink-strong hover:underline"
            >
              {w.name}
            </Link>
            <span className="truncate text-xs text-ink-soft">
              {plural(w.stages.length, 'stage')} · {plural(w.stepCount, 'step')}
            </span>
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Live run',
        sortKey: 'status',
        sortValue: (w) => STATUSES.indexOf(w.status),
        width: '21%',
        hideBelow: 'lg',
        cell: (w) => (
          <span className="flex min-w-0 flex-col items-start gap-1">
            <Pill size="sm" tone={PILL[w.status]} dot>
              {pillLabel(w)}
            </Pill>
            {w.runId ? (
              <Link
                variant="plain"
                href={links.run(w)}
                className="max-w-full truncate text-xs text-brand-fg hover:underline"
              >
                {w.subject}
              </Link>
            ) : (
              <span className="max-w-full truncate text-xs text-ink-soft">{w.subject}</span>
            )}
            {w.moreLive ? (
              <Link
                variant="plain"
                href={links.workflow(w, 'runs')}
                className="text-xs font-bold text-brand-fg hover:underline"
              >
                +{plural(w.moreLive, 'more live run')}
              </Link>
            ) : null}
          </span>
        ),
      },
      {
        id: 'progress',
        header: 'Progress',
        width: '11.5rem',
        cell: (w) => (
          <span className="flex min-w-0 flex-col gap-1.5">
            <StageProgress
              label={stageLine(w)}
              segments={segments(w)}
              current={CURRENT[w.status]}
              className="w-[120px] max-w-full"
            />
            <span aria-hidden className="truncate text-xs text-ink-soft">
              {stageLine(w)}
            </span>
          </span>
        ),
      },
      {
        id: 'now',
        header: 'Now',
        cell: (w) => (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-bold text-ink-strong">{w.now}</span>
            <span className="truncate text-xs text-ink-soft">{w.nowSub}</span>
          </span>
        ),
      },
      {
        id: 'updated',
        header: 'Updated',
        sortKey: 'updated',
        sortType: 'number',
        // Newest first reads as descending, so the newest has the highest value.
        sortValue: (w) => -w.recency,
        width: '7.75rem',
        hideBelow: 'xl',
        cell: (w) => (
          <span className="text-[12.5px] whitespace-nowrap text-ink-soft">{w.updated}</span>
        ),
      },
    ],
    [links],
  )

  const filtered = useMemo(
    () =>
      workflows.filter((w) => {
        if (statuses.length && !statuses.includes(w.status)) return false
        if (starters.length && !starters.includes(w.starter)) return false
        if (dues.length && !dues.includes(w.due)) return false
        return terms.every((term) =>
          term.field
            ? termMatches(term, w[term.field as 'name' | 'now' | 'startedBy'])
            : [w.name, w.subject, w.now, w.nowSub, w.startedBy].some((v) => termMatches(term, v)),
        )
      }),
    [workflows, statuses, starters, dues, terms],
  )
  const sorted = useMemo(() => sortRows(filtered, sort, columns), [filtered, sort, columns])
  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * size, safePage * size)

  const count = (test: (w: WorkflowRow) => boolean) => workflows.filter(test).length
  const reset = () => {
    setStatuses([])
    setStarters([])
    setDues([])
    setPage(1)
  }
  const only = (status: WorkflowStatus) => () => {
    reset()
    setStatuses([status])
  }
  const options = <K extends string>(
    keys: K[],
    label: Record<K, string>,
    test: (w: WorkflowRow, key: K) => boolean,
  ) => keys.map((key) => ({ value: key, label: label[key], count: count((w) => test(w, key)) }))

  const fields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: statuses,
      options: options(STATUSES, STATUS_LABEL, (w, k) => w.status === k),
      onChange: (v) => {
        setStatuses(v as WorkflowStatus[])
        setPage(1)
      },
    },
    {
      id: 'startedBy',
      label: 'Started by',
      type: 'options',
      value: starters,
      options: options(['you', 'others', 'schedule'], STARTER_LABEL, (w, k) => w.starter === k),
      onChange: (v) => {
        setStarters(v as WorkflowStarter[])
        setPage(1)
      },
    },
    {
      id: 'due',
      label: 'Due',
      type: 'options',
      value: dues,
      options: options(['today', 'week', 'none'], DUE_LABEL, (w, k) => w.due === k),
      onChange: (v) => {
        setDues(v as WorkflowDue[])
        setPage(1)
      },
    },
  ]

  const ready = state === 'ready'
  const needYou = count((w) => w.status === 'needs')
  const stats: PageBandStat[] = [
    { label: 'Need you', value: needYou, note: 'Oldest waiting 3 hours', onSelect: only('needs') },
    {
      label: 'Failed',
      value: count((w) => w.status === 'failed'),
      note: workflows.find((w) => w.status === 'failed')?.name ?? 'Nothing failed',
      onSelect: only('failed'),
    },
    {
      label: 'Running',
      value: count((w) => w.status === 'running'),
      note: '8 steps in progress',
      onSelect: only('running'),
    },
    {
      label: 'Idle',
      value: count((w) => w.status === 'idle'),
      note: 'Next starts Dec 1',
      onSelect: only('idle'),
    },
  ]

  const startRun = (w: WorkflowRow) => say(`The start form for ${w.name} would open here`)

  const menuFor = (w: WorkflowRow): RowMenuEntry[] => {
    const none = w.runId ? undefined : 'No live run'
    const isPaused = paused.includes(w.id)
    return [
      {
        label: 'Open run details',
        icon: <WorkflowIcon width={15} height={15} />,
        disabledReason: none,
        onSelect: () => links.go(links.run(w, { view: 'details' })),
      },
      {
        label: 'Start a run',
        icon: <PlayIcon width={15} height={15} />,
        onSelect: () => startRun(w),
      },
      {
        label: 'Edit workflow',
        icon: <PencilIcon width={15} height={15} />,
        onSelect: () => say(`The editor for ${w.name} would open here`),
      },
      {
        label: isPaused ? 'Resume run' : 'Pause run',
        icon: isPaused ? <PlayIcon width={15} height={15} /> : <PauseIcon width={15} height={15} />,
        disabledReason: none,
        onSelect: () => {
          setPaused((ids) => (isPaused ? ids.filter((id) => id !== w.id) : [...ids, w.id]))
          say(`Run ${w.runId} ${isPaused ? 'resumed' : 'paused'}`)
        },
      },
      {
        label: 'Copy run link',
        icon: <CopyIcon width={15} height={15} />,
        disabledReason: none,
        onSelect: () => {
          const url = new URL(links.run(w), window.location.href).toString()
          void navigator.clipboard?.writeText(url).catch(() => undefined)
          say(`Copied the link to run ${w.runId}`)
        },
      },
      'separator',
      {
        label: 'Cancel run…',
        icon: <XIcon width={15} height={15} />,
        tone: 'danger',
        disabledReason: none,
        onSelect: () => setCanceling(w),
      },
    ]
  }

  const statusBar = (w: WorkflowRow) => {
    if (w.status === 'failed') {
      return (
        <Alert
          variant="bar"
          tone="error"
          layout="inline"
          title={w.bar.title}
          action={{ label: 'Retry step', onClick: () => say(`Retrying ${reviewStep(w)?.name}`) }}
          secondaryAction={{
            label: 'Assign to someone',
            onClick: () => say('Choosing someone to assign would open here'),
          }}
        >
          {w.bar.body}
        </Alert>
      )
    }
    if (w.status === 'running') {
      return (
        <Alert variant="bar" tone="info" layout="inline" title={w.bar.title}>
          {w.bar.body}
        </Alert>
      )
    }
    return (
      <Alert
        variant="bar"
        tone="warning"
        layout="inline"
        title={w.bar.title}
        action={
          w.status === 'waiting' && w.waitingOn
            ? {
                label: `Remind ${w.waitingOn.short}`,
                onClick: () => say(`Reminder sent to ${w.waitingOn?.full}`),
              }
            : undefined
        }
      >
        {w.bar.body}
      </Alert>
    )
  }

  const expandedRow = (w: WorkflowRow) =>
    w.status === 'idle' ? (
      <div className="flex flex-col gap-3 rounded-[12px] bg-tint/4 px-4 py-3.5 shadow-[0_0_0_1px_var(--line)]">
        <div className="flex flex-wrap items-center gap-x-9 gap-y-3 text-[13px] text-ink">
          {w.lastRun && (
            <div className="flex flex-col gap-1">
              <span className={caps}>Last run</span>
              <Link
                variant="plain"
                href={links.run(w, { view: 'details', runId: w.lastRun.id })}
                className="font-bold text-brand-fg hover:underline"
              >
                {w.lastRun.line}
              </Link>
            </div>
          )}
          {w.nextStart && (
            <div className="flex flex-col gap-1">
              <span className={caps}>Next start</span>
              <span>{w.nextStart}</span>
            </div>
          )}
          <span className="flex-1" />
          <Button
            variant="primary"
            size="sm"
            icon={<PlayIcon width={13} height={13} />}
            onClick={() => startRun(w)}
          >
            Start a run
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[12.5px] text-ink-soft">
          <span>
            Started by {w.startedBy} · {w.version}
          </span>
          <span className="flex-1" />
          {w.lastRun && (
            <ButtonLink
              variant="secondary"
              size="sm"
              href={links.run(w, { view: 'details', runId: w.lastRun.id })}
            >
              Open last run
            </ButtonLink>
          )}
        </div>
      </div>
    ) : (
      <RunGlance
        stages={w.stages}
        steps={w.steps}
        hrefFor={({ stageId, stepId }) =>
          links.run(
            w,
            stepId ? { view: 'details', step: stepId } : { view: 'details', stage: stageId },
          )
        }
        status={statusBar(w)}
        latest={w.latest}
        meta={`Started by ${w.startedBy} · ${w.version}`}
        actions={
          <>
            <ButtonLink
              variant="secondary"
              size="sm"
              href={links.run(w, { view: 'canvas', log: true })}
            >
              Open run log
            </ButtonLink>
            <ButtonLink variant="primary" size="sm" href={links.run(w, { view: 'details' })}>
              Open run details
            </ButtonLink>
          </>
        }
      />
    )

  const startWorkflow = () => say('Choosing a workflow to start would open here')

  return (
    <PageBand
      title="Workflows"
      breadcrumbs={[{ label: 'Overview', href: links.overview }, { label: 'Automate' }]}
      description="Multi-step runs that stop for a person when they need one."
      details={
        ready && workflows.length > 0
          ? {
              summary: needYou > 0 ? `${needYou} need you` : undefined,
              stats,
              open: summaryOpen,
              onOpenChange: setSummaryOpen,
              showLabel: 'Show summary',
              hideLabel: 'Hide summary',
            }
          : undefined
      }
      actions={
        <>
          <Button variant="inverse" onClick={() => say('Importing a workflow would open here')}>
            Import a workflow
          </Button>
          <Button variant="inverse" onClick={() => say('The template gallery would open here')}>
            Templates
          </Button>
          <Button
            variant="inverse-solid"
            icon={<PlusIcon width={15} height={15} />}
            onClick={startWorkflow}
          >
            Start a workflow
          </Button>
        </>
      }
    >
      <GridCard
        id="workflows-grid-heading"
        title="All workflows"
        line={
          ready
            ? `${plural(workflows.length, 'workflow')} · ${count(needsReview)} need attention · ${count((w) => w.status === 'running')} running`
            : state === 'loading'
              ? 'Loading workflows…'
              : 'Workflows could not be loaded'
        }
      >
        <DataGrid
          searchLabel="Search and filter workflows"
          caption="Workflows"
          columns={columns}
          rows={ready ? pageRows : []}
          rowId={(w) => w.id}
          rowLabel={(w) => w.name}
          // TODO(rowTone): once DataTable's `rowTone` (branch claude/row-status-edge-b95de3)
          // is on main, pass it so a row that needs a person gets the orange edge
          // and a failed one the red:
          //   rowTone={(w) => w.status === 'failed' ? 'error'
          //     : w.status === 'needs' || w.status === 'waiting' ? 'warning' : undefined}
          renderExpanded={expandedRow}
          expandToggle="button"
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          fields={fields}
          terms={terms}
          onTermsChange={(next) => {
            setTerms(next)
            setPage(1)
          }}
          termFields={TERM_FIELDS}
          findMatches={(q) => findMatches(q, workflows, TERM_FIELDS)}
          onReset={reset}
          defaultOpen={false}
          sort={sort}
          onSortChange={(next) => {
            setSort(next)
            setPage(1)
          }}
          selectedIds={selected}
          onSelectionChange={setSelected}
          bulkActions={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => say(`Paused ${plural(selected.length, 'run')}`)}
              >
                Pause runs
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => say(`Sent ${plural(selected.length, 'reminder')}`)}
              >
                Send reminders
              </Button>
            </>
          }
          // TODO(actions header): give this column its visible "Actions" header
          // once the DataTable opt-in for it is on main.
          rowActionsVisible="always"
          actionsWidth="12.5rem"
          rowActions={(w) => (
            <RowActions
              name={w.name}
              buttons={[
                {
                  label: 'Open live run',
                  icon: <PlayIcon width={15} height={15} />,
                  href: w.runId ? links.run(w, { view: 'canvas' }) : undefined,
                  disabledReason: w.runId ? undefined : 'No live run',
                },
                {
                  label: 'View workflow',
                  ariaLabel: `View workflow ${w.name}`,
                  icon: <WorkflowIcon width={15} height={15} />,
                  href: links.workflow(w),
                },
              ]}
              menu={menuFor(w)}
              menuUp={pageRows.indexOf(w) >= pageRows.length - MENU_UP_ROWS}
            >
              {needsReview(w) && (
                <ButtonLink
                  variant="primary"
                  size="sm"
                  href={links.run(w, { view: 'details', step: reviewStep(w)?.id })}
                  aria-label={`Review ${w.name}`}
                >
                  Review
                </ButtonLink>
              )}
            </RowActions>
          )}
          loading={state === 'loading'}
          skeletonRows={size}
          error={state === 'unavailable' || undefined}
          onRetry={onRetry}
          emptyAction={
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon width={14} height={14} />}
              onClick={startWorkflow}
            >
              Start a workflow
            </Button>
          }
          labels={{
            expandRow: (name) => `Show more about ${name}`,
            placeholder: 'Search workflows, runs and who they wait on…',
            noMatchTitle: 'No workflows match',
            noMatchBody: 'Remove a filter, or clear them all.',
            emptyTitle: 'No workflows yet',
            emptyBody: 'Start one from a template, or import one you already have.',
            errorTitle: 'Couldn’t load workflows',
            errorBody: 'The workflow service didn’t answer. Runs already going carry on.',
          }}
          exportFormats={['csv', 'json']}
          totalCount={sorted.length}
          onExport={(format, scope) =>
            downloadRows(
              'workflows',
              format,
              scope === 'selected' ? sorted.filter((w) => selected.includes(w.id)) : sorted,
              EXPORT_COLUMNS,
            )
          }
          pagination={{
            page: safePage,
            size,
            totalElements: sorted.length,
            onPageChange: setPage,
            onSizeChange: (n) => {
              setSize(n)
              setPage(1)
            },
            sizeOptions: [10, 25, 50],
          }}
        />
      </GridCard>

      <Modal
        open={canceling !== null}
        onOpenChange={(open) => !open && setCanceling(null)}
        title={`Cancel run ${canceling?.runId ?? ''}?`}
        description="Steps still to come won’t run."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCanceling(null)}>
              Keep it running
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                say(`Run ${canceling?.runId} canceled`)
                setCanceling(null)
              }}
            >
              Cancel run
            </Button>
          </>
        }
      />
      {toast}
    </PageBand>
  )
}
