// Every workflow in a tenant, and where each one's live run has got to.
//
// The page is the library's own table furniture and two workflow components:
// `DataTable` inside a `FilterBar` (the omnibox, its chips and the filters
// panel) with `Pagination` below, a `StageProgress` in each row, and a
// `FlowBlueprint` under the row that is open.
// It deliberately imports nothing from React Flow — twenty runs on a page are
// twenty small trees, and the canvas waits behind "Open live view".
//
// Like `DataTablePage` it owns its own query state and filters in memory, so a
// real one swaps the two `useMemo`s for a request and changes nothing else.
import { useMemo, useState } from 'react'
import { DataTable, sortRows, type Column } from '../../../components/data-table'
import {
  FilterBar,
  type FilterStyle,
  type FilterTerm,
  type FilterTermField,
} from '../../../components/filter-bar'
import type { FilterField } from '../../../components/filter-panel'
import { PageHeader } from '../../../components/page-header'
import { Pagination } from '../../../components/pagination'
import type { Sort } from '../../../components/paging'
import { Avatar } from '../../../primitives/avatar'
import { Button, ButtonLink } from '../../../primitives/button'
import { PlusIcon } from '../../../primitives/icons'
import { StatusDot } from '../../../primitives/status-dot'
import { FlowBlueprint } from '../../components/flow-blueprint'
import { StageProgress } from '../../components/stage-progress'
import { WORKFLOW_SUMMARIES } from '../../fixtures/workflowSummaries'
import type { WorkflowState, WorkflowsTablePageProps, WorkflowSummary } from './types'

const STATE_LABEL: Record<WorkflowState, string> = {
  waiting: 'Needs a person',
  running: 'Running',
  idle: 'Idle',
}

/* The dot and the word say the same thing; the word is what carries it. Orange
   stays reserved for a run that is waiting on someone. */
const STATE_DOT: Record<WorkflowState, string> = {
  waiting: 'bg-notify',
  running: 'bg-brand-solid',
  idle: 'bg-ink-soft/50',
}

/** What "Narrow to a field" offers, and the parameter each one would send. */
const FIELDS: (FilterTermField & { key: 'name' | 'run' | 'startedBy' })[] = [
  { key: 'name', label: 'Workflow', glyph: 'Aa', param: 'name__icontains' },
  { key: 'run', label: 'Run', glyph: '▸', param: 'run__icontains' },
  { key: 'startedBy', label: 'Started by', glyph: '◔', param: 'started_by__icontains' },
]

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** "Stage 4 of 5 · Approve" — what the progress bar is a picture of. */
function stageLine(workflow: WorkflowSummary): string {
  const at = workflow.stages.findIndex((stage) => stage.status === 'current')
  if (at < 0) return `Not started · ${plural(workflow.stages.length, 'stage')}`
  return `Stage ${at + 1} of ${workflow.stages.length} · ${workflow.stages[at].name}`
}

const COLUMNS: Column<WorkflowSummary>[] = [
  {
    id: 'name',
    header: 'Workflow',
    sortKey: 'name',
    width: '26%',
    cell: (w) => (
      <span className="flex min-w-0 flex-col">
        <span data-row-title className="truncate font-bold text-ink-strong">
          {w.name}
        </span>
        <span className="truncate text-xs text-ink-soft">
          {plural(w.stages.length, 'stage')} · {plural(w.agents, 'agent')} ·{' '}
          {plural(w.tools, 'tool')}
        </span>
      </span>
    ),
  },
  {
    id: 'state',
    header: 'Live run',
    sortKey: 'state',
    // Sorted by the word on screen, not by the key behind it.
    sortValue: (w) => STATE_LABEL[w.state],
    width: '24%',
    cell: (w) => (
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 font-bold text-ink-strong">
          <StatusDot className={`size-2 shrink-0 rounded-full ${STATE_DOT[w.state]}`} aria-hidden />
          {STATE_LABEL[w.state]}
        </span>
        <span className="truncate text-xs text-ink-soft">{w.run || 'No live run'}</span>
      </span>
    ),
  },
  {
    id: 'progress',
    header: 'Progress',
    width: '220px',
    cell: (w) => (
      <span className="flex flex-col gap-1.5">
        <StageProgress
          label={stageLine(w)}
          segments={w.stages.map((stage) => stage.status)}
          current={w.state === 'waiting' ? 'waiting' : 'running'}
        />
        <span aria-hidden className="truncate text-xs text-ink">
          {stageLine(w)}
        </span>
      </span>
    ),
  },
  {
    id: 'now',
    header: 'Now',
    hideBelow: 'md',
    cell: (w) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-ink-strong">{w.now.title}</span>
        <span className="truncate text-xs text-ink-soft">{w.now.sub}</span>
      </span>
    ),
  },
  {
    id: 'startedBy',
    header: 'Started by',
    width: '13%',
    hideBelow: 'lg',
    cell: (w) => <span className="truncate">{w.startedBy}</span>,
  },
]

export function WorkflowsTablePage({
  workflows = WORKFLOW_SUMMARIES,
  hrefFor = (workflow) => `#${workflow.id}`,
  onStart,
}: WorkflowsTablePageProps) {
  // Typed conditions (searches and narrowings) and the one filter the panel
  // holds. `FilterBar` draws both as chips, so neither needs a second home.
  const [terms, setTerms] = useState<FilterTerm[]>([])
  const [states, setStates] = useState<WorkflowState[]>([])
  // Three statuses is few enough to offer as quick picks the moment the field
  // is focused, which is what `advanced` adds.
  const [filterStyle, setFilterStyle] = useState<FilterStyle>('advanced')
  const [sort, setSort] = useState<Sort[]>([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [expanded, setExpanded] = useState<string[]>([])

  const filtered = useMemo(
    () =>
      workflows.filter((w) => {
        if (states.length > 0 && !states.includes(w.state)) return false
        return terms.every((term) => {
          const needle = term.value.trim().toLowerCase()
          const field = FIELDS.find((f) => f.key === term.field)
          if (field) return w[field.key].toLowerCase().includes(needle)
          return [w.name, w.run, w.startedBy, w.now.title].some((v) =>
            v.toLowerCase().includes(needle),
          )
        })
      }),
    [workflows, terms, states],
  )

  const sorted = useMemo(() => sortRows(filtered, sort, COLUMNS), [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * size, safePage * size)

  const waitingCount = workflows.filter((w) => w.state === 'waiting').length

  const filterFields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: states,
      options: (Object.keys(STATE_LABEL) as WorkflowState[]).map((state) => ({
        value: state,
        label: STATE_LABEL[state],
        count: workflows.filter((w) => w.state === state).length,
      })),
      onChange: (next) => {
        setStates(next as WorkflowState[])
        setPage(1)
      },
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-5 px-8 py-7 max-md:px-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <PageHeader
          title={<>Workflows</>}
          className="flex min-w-0 flex-col gap-1"
          descriptionClassName="text-sm text-ink-soft"
          description={
            <>
              {plural(workflows.length, 'workflow')}
              {waitingCount > 0 && <> · {waitingCount} waiting on a person</>}. Open a row to see
              where its run is.
            </>
          }
        />
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          icon={<PlusIcon width={16} height={16} />}
        >
          Start a workflow
        </Button>
      </div>

      <FilterBar
        label="Search and filter workflows"
        fields={filterFields}
        terms={terms}
        onTermsChange={(next) => {
          setTerms(next)
          setPage(1)
        }}
        termFields={FIELDS}
        filterStyle={filterStyle}
        onFilterStyleChange={setFilterStyle}
        onReset={() => {
          setStates([])
          setPage(1)
        }}
      >
        <DataTable
          caption="Workflows, with search, status filters, sorting and pagination"
          minWidth="56rem"
          columns={COLUMNS}
          rows={pageRows}
          rowId={(w) => w.id}
          sort={sort}
          onSortChange={(next) => {
            setSort(next)
            setPage(1)
          }}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          labels={{
            emptyTitle: 'No workflows match',
            emptyBody: 'Remove a filter, or search for something else.',
          }}
          renderExpanded={(w) => (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {w.needs.length > 0 ? (
                  w.needs.map((need) => (
                    <span key={need.title} className="flex min-w-0 items-center gap-2.5">
                      <Avatar
                        variant="text"
                        text={need.initials}
                        size={32}
                        tone="brand"
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[13.5px] font-bold text-ink-strong">
                          {need.title}
                        </span>
                        <span className="truncate text-xs text-ink-soft">
                          {need.who} · due {need.due}
                        </span>
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-[13.5px] text-ink">
                    {w.state === 'idle'
                      ? 'No live run. This is the shape its next run will take.'
                      : 'Running without a person.'}
                  </span>
                )}
                <ButtonLink href={hrefFor(w)} variant="secondary" size="lg" className="ml-auto">
                  Open live view
                </ButtonLink>
              </div>
              <div className="overflow-x-auto rounded-surface border border-line bg-canvas">
                <FlowBlueprint
                  stages={w.stages}
                  label={`${w.name}: ${stageLine(w)}`}
                  // Below this a ten-stage run's lanes are too narrow to name.
                  className="min-w-[46rem]"
                />
              </div>
            </div>
          )}
          footer={
            <Pagination
              page={safePage}
              size={size}
              totalElements={sorted.length}
              totalPages={totalPages}
              onPageChange={setPage}
              onSizeChange={(n) => {
                setSize(n)
                setPage(1)
              }}
              sizeOptions={[10, 25, 50]}
            />
          }
        />
      </FilterBar>
    </div>
  )
}
