// Every workflow in a tenant and where each one's live run has got to: the
// Finals 2.0 runs list (boards RunsC, RunsCDark, RunsCTablet, RunsCPortrait).
//
// The navy PageBand carries the title, the page's actions and the Details strip
// of counts; each count filters the grid to itself. Under it, one card holds a
// DataGrid: Filters (status, started by, due), a search box that shows the
// filters as chips, Export, the bulk bar, and the rows. The page owns its query
// state and filters in memory, so a real one swaps the `useMemo`s for a request.
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
import { Avatar } from '../../../primitives/avatar'
import { Button, ButtonLink } from '../../../primitives/button'
import { PlusIcon } from '../../../primitives/icons'
import { Link } from '../../../primitives/link'
import { Pill, type PillTone } from '../../../primitives/pill'
import { StageProgress } from '../../../workflows/components/stage-progress'
import type { StageStatus } from '../../../workflows/components/types'
import {
  STATUS_LABEL,
  WORKFLOWS,
  needsSomeone,
  stageLine,
  type WorkflowDue,
  type WorkflowRow,
  type WorkflowStarter,
  type WorkflowStatus,
} from '../fixtures/workflows'
import type { RecipeState } from '../types'

export type WorkflowsPageProps = {
  /** The rows to list. Defaults to the ten authored workflows; `[]` is the empty state. */
  workflows?: WorkflowRow[]
  /** `loading` draws skeleton rows; `unavailable` says the list could not be loaded. */
  state?: RecipeState
  /** Where a workflow's name goes: its detail page. Nothing, and the name is plain text. */
  hrefFor?: (row: WorkflowRow) => string | undefined
  /** Where a row's action goes: its live run. */
  runHrefFor?: (row: WorkflowRow) => string | undefined
  /** The trail's first crumb: the platform's Overview. */
  overviewHref?: string
  onStart?: () => void
  onRetry?: () => void
}

const PILL: Record<WorkflowStatus, PillTone> = {
  needs: 'orange',
  failed: 'danger',
  running: 'brand',
  idle: 'neutral',
}

/** The current stage's colour: orange when it waits on someone, red when a step failed. */
const CURRENT: Record<WorkflowStatus, 'waiting' | 'failed' | 'running'> = {
  needs: 'waiting',
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

const STATUSES: WorkflowStatus[] = ['needs', 'failed', 'running', 'idle']

const TERM_FIELDS: (FilterTermField & { key: 'name' | 'now' | 'startedBy' })[] = [
  { key: 'name', label: 'Workflow', glyph: 'Aa', param: 'name__icontains' },
  { key: 'now', label: 'Now', glyph: '▸', param: 'now__icontains' },
  { key: 'startedBy', label: 'Started by', glyph: '◔', param: 'started_by__icontains' },
]

const EXPORT_COLUMNS: ExportColumn<WorkflowRow>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Workflow' },
  { key: 'status', header: 'Status', value: (w) => STATUS_LABEL[w.status] },
  { key: 'subject', header: 'Live run' },
  { key: 'stage', header: 'Progress', value: stageLine },
  { key: 'now', header: 'Now' },
  { key: 'startedBy', header: 'Started by' },
  { key: 'updated', header: 'Updated' },
]

function segments(row: WorkflowRow): StageStatus[] {
  return Array.from({ length: row.stageCount }, (_, i) =>
    i < row.stageAt - 1 ? 'done' : i === row.stageAt - 1 ? 'current' : 'upcoming',
  )
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

/** What a row's button does: review what waits on you, read the log of what failed. */
const actionOf = (row: WorkflowRow) =>
  row.status === 'failed' ? 'Open log' : row.status === 'needs' ? 'Review' : 'Open run'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function WorkflowsPage({
  workflows = WORKFLOWS,
  state = 'ready',
  hrefFor,
  runHrefFor,
  overviewHref,
  onStart,
  onRetry,
}: WorkflowsPageProps) {
  const [terms, setTerms] = useState<FilterTerm[]>([])
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([])
  const [starters, setStarters] = useState<WorkflowStarter[]>([])
  const [dues, setDues] = useState<WorkflowDue[]>([])
  const [sort, setSort] = useState<Sort[]>([{ field: 'updated', direction: 'desc' }])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(8)
  const [selected, setSelected] = useState<string[]>([])
  const [detailsOpen, setDetailsOpen] = useState(false)

  const columns = useMemo<Column<WorkflowRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Workflow',
        sortKey: 'name',
        width: '24%',
        cell: (w) => {
          const href = hrefFor?.(w)
          return (
            <span className="flex min-w-0 flex-col">
              {href ? (
                <Link
                  variant="plain"
                  href={href}
                  className="truncate text-[13.5px] font-bold text-ink-strong hover:underline"
                >
                  {w.name}
                </Link>
              ) : (
                <span className="truncate text-[13.5px] font-bold text-ink-strong">{w.name}</span>
              )}
              <span className="truncate text-xs text-ink-soft">{w.shape}</span>
            </span>
          )
        },
      },
      {
        id: 'status',
        header: 'Live run',
        sortKey: 'status',
        sortValue: (w) => STATUSES.indexOf(w.status),
        width: '20%',
        hideBelow: 'lg',
        cell: (w) => (
          <span className="flex min-w-0 flex-col items-start gap-1">
            <Pill size="sm" tone={PILL[w.status]} dot>
              {STATUS_LABEL[w.status]}
            </Pill>
            <span className="max-w-full truncate text-xs text-ink-soft">{w.subject}</span>
          </span>
        ),
      },
      {
        id: 'progress',
        header: 'Progress',
        width: '15%',
        cell: (w) => (
          <span className="flex min-w-0 flex-col gap-1.5">
            <StageProgress
              label={stageLine(w)}
              segments={segments(w)}
              current={CURRENT[w.status]}
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
        id: 'startedBy',
        header: 'Started by',
        sortKey: 'startedBy',
        width: '13%',
        hideBelow: 'xl',
        cell: (w) => (
          <span className="flex min-w-0 items-center gap-2">
            <Avatar
              variant="text"
              text={
                w.starter === 'schedule' ? '⏱' : w.starter === 'you' ? 'JO' : initials(w.startedBy)
              }
              size="xs"
              tone={w.starter === 'schedule' ? 'neutral' : 'soft'}
              aria-hidden
            />
            <span className="truncate">{w.startedBy}</span>
          </span>
        ),
      },
      {
        id: 'updated',
        header: 'Updated',
        sortKey: 'updated',
        sortType: 'number',
        // Most recent first reads as "descending", so the newest has the highest value.
        sortValue: (w) => -w.recency,
        width: '7.5rem',
        cell: (w) => (
          <span className="text-[12.5px] whitespace-nowrap text-ink-soft">{w.updated}</span>
        ),
      },
    ],
    [hrefFor],
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
  const needAll = count(needsSomeone)
  const stats: PageBandStat[] = [
    {
      label: 'Need you',
      value: count((w) => w.status === 'needs'),
      note: 'Oldest waiting 3 hours',
      onSelect: only('needs'),
    },
    {
      label: 'Failed step',
      value: count((w) => w.status === 'failed'),
      note: workflows.find((w) => w.status === 'failed')?.name ?? 'Nothing failed',
      onSelect: only('failed'),
    },
    {
      label: 'Running',
      value: count((w) => w.status === 'running'),
      note: '6 steps in progress',
      onSelect: only('running'),
    },
    {
      label: 'Idle',
      value: count((w) => w.status === 'idle'),
      note: 'Next starts Dec 1',
      onSelect: only('idle'),
    },
  ]

  const startButton = (
    <Button
      variant="primary"
      size="sm"
      icon={<PlusIcon width={14} height={14} />}
      onClick={onStart}
    >
      Start a workflow
    </Button>
  )

  return (
    <PageBand
      title="Workflows"
      breadcrumbs={[{ label: 'Overview', href: overviewHref }, { label: 'Automate' }]}
      description="Multi-step runs that stop for a person when they need one."
      details={
        ready && workflows.length > 0
          ? {
              summary: needAll > 0 ? `${needAll} need you` : undefined,
              stats,
              open: detailsOpen,
              onOpenChange: setDetailsOpen,
            }
          : undefined
      }
      actions={
        <>
          <Button variant="inverse">Import a workflow</Button>
          <Button variant="inverse">Templates</Button>
          <Button
            variant="inverse-solid"
            icon={<PlusIcon width={15} height={15} />}
            onClick={onStart}
          >
            Start a workflow
          </Button>
        </>
      }
    >
      <section
        aria-labelledby="workflows-grid-heading"
        className="flex flex-col gap-4 rounded-[14px] bg-panel-solid p-5 shadow-[0_0_0_1px_var(--line),0_18px_40px_-22px_var(--shadow-menu)] max-md:p-3.5"
      >
        <div className="flex flex-col">
          <h2 id="workflows-grid-heading" className="text-[15px] font-extrabold text-ink-strong">
            All workflows
          </h2>
          <p className="text-[12.5px] text-ink-soft">
            {ready
              ? `${plural(workflows.length, 'workflow')} · ${needAll} need attention · ${count((w) => w.status === 'running')} running`
              : state === 'loading'
                ? 'Loading workflows…'
                : 'Workflows could not be loaded'}
          </p>
        </div>
        <DataGrid
          searchLabel="Search and filter workflows"
          caption="Workflows"
          columns={columns}
          rows={ready ? pageRows : []}
          rowId={(w) => w.id}
          rowLabel={(w) => w.name}
          // TODO(rowTone): once DataTable's `rowTone` (branch claude/row-status-edge-b95de3)
          // is on main, pass it so a row that needs someone gets the orange edge
          // and a failed one the red:
          //   rowTone={(w) => (w.status === 'failed' ? 'error' : w.status === 'needs' ? 'warning' : undefined)}
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
              <Button variant="secondary" size="sm">
                Pause runs
              </Button>
              <Button variant="secondary" size="sm">
                Send a reminder
              </Button>
            </>
          }
          rowActions={(w) => {
            const href = runHrefFor?.(w)
            const variant = w.status === 'needs' ? 'primary' : 'secondary'
            return href ? (
              <ButtonLink href={href} variant={variant} size="sm">
                {actionOf(w)}
              </ButtonLink>
            ) : (
              <Button variant={variant} size="sm" aria-label={`${actionOf(w)}: ${w.name}`}>
                {actionOf(w)}
              </Button>
            )
          }}
          actionsWidth="7.5rem"
          loading={state === 'loading'}
          skeletonRows={size}
          error={state === 'unavailable' || undefined}
          onRetry={onRetry}
          emptyAction={startButton}
          labels={{
            noMatchTitle: 'No workflows match',
            noMatchBody: 'Remove a filter, or clear them all.',
            emptyTitle: 'No workflows yet',
            emptyBody: 'Start one from a template, or import one you already have.',
            errorTitle: 'Couldn’t load workflows',
            errorBody: 'The workflow service didn’t answer. Your runs are still going.',
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
            sizeOptions: [8, 10, 25],
          }}
        />
      </section>
    </PageBand>
  )
}
