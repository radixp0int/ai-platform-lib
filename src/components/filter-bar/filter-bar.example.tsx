// A host for the stories: a table of workflow runs, wide on purpose.
//
// It has twelve columns, four dates (three look back, one looks ahead), a
// filter with more options than any row of picks can hold, and a way to start
// with a pile of filters already on. Those are the things that make a filter
// bar fall over — chips that outgrow the field, a panel taller than the screen,
// a table wider than its card — so the stories use them on purpose.
//
// Every date is worked out from today when the module loads, so a preset such
// as "Last 7 days" always finds rows.
import { useMemo, useState } from 'react'
import type { DateRange } from '../../primitives/date-field'
import { Pill } from '../../primitives/pill'
import { DataTable, sortRows, type Column } from '../data-table'
import type { Sort } from '../paging'
import type { FilterField } from '../filter-panel'
import { FilterBar } from './filter-bar'
import type { FilterStyle, FilterTerm, FilterTermField } from './types'

type Status = 'running' | 'waiting' | 'completed' | 'failed'

type Run = {
  id: string
  title: string
  step: string
  status: Status
  flow: string
  by: string
  team: string
  region: string
  priority: string
  attention: boolean
  started: string
  updated: string
  /** Null while the run is still going. */
  finished: string | null
  due: string
  duration: string
  /** Days the run took, or has taken so far: the number the Duration column sorts by. */
  days: number
}

type RunFilters = {
  status: string[]
  flow: string[]
  priority: string[]
  team: string[]
  region: string
  attention: boolean
  started: DateRange
  updated: DateRange
  finished: DateRange
  due: DateRange
}

const NONE: DateRange = { from: null, to: null }
const EMPTY: RunFilters = {
  status: [],
  flow: [],
  priority: [],
  team: [],
  region: '',
  attention: false,
  started: NONE,
  updated: NONE,
  finished: NONE,
  due: NONE,
}

const TODAY = new Date()
const iso = (offset: number) => {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const fmt = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '–'

const STATUS_LABEL: Record<Status, string> = {
  running: 'Running',
  waiting: 'Needs approval',
  completed: 'Completed',
  failed: 'Failed',
}
const STATUS_TONE = {
  running: 'brand',
  waiting: 'warning',
  completed: 'success',
  failed: 'danger',
} as const

const FLOWS = ['Loan review', 'New hire', 'Incident triage', 'KYC refresh', 'Vendor onboarding']
const TEAMS = [
  'Credit risk',
  'Treasury operations',
  'People and culture',
  'Site reliability',
  'Compliance and ethics',
  'Procurement',
  'Fraud analytics',
  'Customer success',
  'Legal and privacy',
  'Data platform',
  'Internal audit',
  'Finance systems',
]
const REGIONS = ['Northeast', 'Midwest', 'South', 'West', 'Southeast']
const PEOPLE = ['Dana Whitfield', 'Rachel Okafor', 'Sam Raines', 'Chidi Eze', 'Mei Lin']
const SUBJECTS = [
  'Northwind Foods',
  'Harbor Freight Lines',
  'Priya Raman',
  'checkout latency',
  'Cloudvault',
]
const STEPS = [
  'Approve credit memo',
  'Provision accounts',
  'Detect',
  'Verify beneficial owners',
  'Security review',
]

const rng = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296

function makeRuns(count: number): Run[] {
  const r = rng(5)
  const pick = <T,>(list: T[]) => list[Math.floor(r() * list.length)]
  const rows: Run[] = []
  for (let i = 0; i < count; i += 1) {
    const roll = r()
    const status: Status =
      roll < 0.18 ? 'running' : roll < 0.3 ? 'waiting' : roll < 0.9 ? 'completed' : 'failed'
    const active = status === 'running' || status === 'waiting'
    const startedAge = active ? Math.floor(21 * r() ** 1.1) : Math.floor(170 * r() ** 1.1)
    const days = 1 + Math.floor(r() * 9)
    const finishedAge = active ? null : Math.max(0, startedAge - days)
    const updatedAge = active ? Math.min(startedAge, Math.floor(r() * 4)) : (finishedAge ?? 0)
    const flow = pick(FLOWS)
    rows.push({
      id: `run_${i}`,
      title: `${flow} · ${pick(SUBJECTS)}`,
      step: pick(STEPS),
      status,
      flow,
      by: pick(PEOPLE),
      team: pick(TEAMS),
      region: pick(REGIONS),
      priority: pick(['High', 'Normal', 'Normal', 'Low']),
      attention: status === 'waiting' || status === 'failed',
      started: iso(-startedAge),
      updated: iso(-updatedAge),
      finished: finishedAge === null ? null : iso(-finishedAge),
      due: iso(Math.floor(r() * 40) - 8),
      duration: active ? `${startedAge}d so far` : `${days}d`,
      days: active ? startedAge : days,
    })
  }
  return rows.sort((a, b) => b.started.localeCompare(a.started))
}

const RUNS = makeRuns(120)

const TERM_FIELDS: FilterTermField[] = [
  { key: 'title', label: 'Run', glyph: 'Aa', param: 'title__icontains' },
  { key: 'by', label: 'Started by', glyph: '◔', param: 'started_by__icontains' },
  { key: 'team', label: 'Team', glyph: '#', param: 'team__icontains' },
]

const inRange = (value: string | null, range: DateRange) => {
  if (!range.from && !range.to) return true
  if (!value) return false
  return (!range.from || value >= range.from) && (!range.to || value <= range.to)
}

type Ignore = keyof RunFilters | null

function matches(run: Run, f: RunFilters, terms: FilterTerm[], ignore: Ignore = null) {
  if (ignore !== 'status' && f.status.length && !f.status.includes(run.status)) return false
  if (ignore !== 'flow' && f.flow.length && !f.flow.includes(run.flow)) return false
  if (ignore !== 'priority' && f.priority.length && !f.priority.includes(run.priority)) return false
  if (ignore !== 'team' && f.team.length && !f.team.includes(run.team)) return false
  if (f.region && !run.region.toLowerCase().includes(f.region.toLowerCase())) return false
  if (f.attention && !run.attention) return false
  if (!inRange(run.started, f.started)) return false
  if (!inRange(run.updated, f.updated)) return false
  if (!inRange(run.finished, f.finished)) return false
  if (!inRange(run.due, f.due)) return false
  return terms.every((term) => {
    const needle = term.value.trim().toLowerCase()
    if (term.field)
      return String(run[term.field as keyof Run])
        .toLowerCase()
        .includes(needle)
    return [run.title, run.by, run.team, run.region].some((v) => v.toLowerCase().includes(needle))
  })
}

const COLUMNS: Column<Run>[] = [
  {
    id: 'title',
    sortKey: 'title',
    header: 'Run',
    width: '12%',
    cell: (r) => (
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-bold text-ink-strong">{r.title}</span>
        <span className="truncate text-[11.5px] text-ink-soft">{r.step}</span>
      </span>
    ),
  },
  {
    id: 'status',
    sortKey: 'status',
    header: 'Status',
    width: '9%',
    cell: (r) => (
      <Pill tone={STATUS_TONE[r.status]} variant="outline" size="sm">
        {STATUS_LABEL[r.status]}
      </Pill>
    ),
  },
  {
    id: 'flow',
    sortKey: 'flow',
    header: 'Workflow',
    width: '9%',
    cell: (r) => <span className="block truncate">{r.flow}</span>,
  },
  {
    id: 'by',
    sortKey: 'by',
    header: 'Started by',
    width: '9%',
    cell: (r) => <span className="block truncate">{r.by}</span>,
  },
  {
    id: 'started',
    sortKey: 'started',
    sortType: 'date',
    header: 'Started',
    width: '8%',
    cell: (r) => <span className="block whitespace-nowrap">{fmt(r.started)}</span>,
  },
  {
    id: 'updated',
    sortKey: 'updated',
    sortType: 'date',
    header: 'Last updated',
    width: '9%',
    cell: (r) => <span className="block whitespace-nowrap">{fmt(r.updated)}</span>,
  },
  {
    id: 'finished',
    sortKey: 'finished',
    sortType: 'date',
    header: 'Finished',
    width: '8%',
    cell: (r) => <span className="block whitespace-nowrap">{fmt(r.finished)}</span>,
  },
  {
    id: 'due',
    sortKey: 'due',
    sortType: 'date',
    header: 'Due',
    width: '8%',
    cell: (r) => <span className="block whitespace-nowrap">{fmt(r.due)}</span>,
  },
  {
    id: 'duration',
    sortKey: 'days',
    sortType: 'number',
    header: 'Duration',
    width: '7%',
    cell: (r) => <span className="block whitespace-nowrap">{r.duration}</span>,
  },
  {
    id: 'team',
    sortKey: 'team',
    header: 'Team',
    width: '8%',
    cell: (r) => <span className="block truncate">{r.team}</span>,
  },
  {
    id: 'region',
    sortKey: 'region',
    sortable: false,
    header: 'Region',
    width: '6%',
    cell: (r) => <span className="block truncate">{r.region}</span>,
  },
  {
    id: 'priority',
    sortKey: 'priority',
    header: 'Priority',
    width: '7%',
    cell: (r) => <span className="block truncate">{r.priority}</span>,
  },
]

export type RunsHostProps = {
  filterStyle?: FilterStyle
  defaultOpen?: boolean
  defaultPinned?: boolean
  /** Filters that are already on when the story opens. */
  initial?: Partial<RunFilters>
  initialTerms?: FilterTerm[]
  /** Swap the option labels for ones that run long, to see what gives way. */
  longLabels?: boolean
  /** Draw the toolbar. Off, the table has no search box and no Filters button. */
  showHeader?: boolean
  /** Draw the filters panel and the button that opens it. */
  showPanel?: boolean
}

/** A table of runs under a `FilterBar`. The host owns every filter, as a real page would. */
export function RunsHost({
  filterStyle: startStyle = 'simple',
  defaultOpen = false,
  defaultPinned = false,
  initial,
  initialTerms = [],
  longLabels = false,
  showHeader = true,
  showPanel = true,
}: RunsHostProps) {
  const [f, setF] = useState<RunFilters>({ ...EMPTY, ...initial })
  const [terms, setTerms] = useState<FilterTerm[]>(initialTerms)
  const [style, setStyle] = useState<FilterStyle>(startStyle)
  const set =
    <K extends keyof RunFilters>(key: K) =>
    (value: RunFilters[K]) =>
      setF((cur) => ({ ...cur, [key]: value }))

  const [sort, setSort] = useState<Sort[]>([{ field: 'started', direction: 'desc' }])
  const rows = useMemo(
    () =>
      sortRows(
        RUNS.filter((r) => matches(r, f, terms)),
        sort,
        COLUMNS,
      ),
    [f, terms, sort],
  )
  const count = (ignore: Ignore, test: (r: Run) => boolean) =>
    RUNS.filter((r) => matches(r, f, terms, ignore) && test(r)).length
  const long = (s: string) =>
    longLabels ? `${s}, including every regional and subsidiary office worldwide` : s

  const fields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: f.status,
      onChange: set('status'),
      options: (Object.keys(STATUS_LABEL) as Status[]).map((s) => ({
        value: s,
        label: STATUS_LABEL[s],
        count: count('status', (r) => r.status === s),
      })),
    },
    {
      id: 'flow',
      label: 'Workflow',
      type: 'options',
      value: f.flow,
      onChange: set('flow'),
      options: FLOWS.map((v) => ({
        value: v,
        label: long(v),
        count: count('flow', (r) => r.flow === v),
      })),
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'options',
      value: f.priority,
      onChange: set('priority'),
      options: ['High', 'Normal', 'Low'].map((v) => ({
        value: v,
        label: v,
        count: count('priority', (r) => r.priority === v),
      })),
    },
    {
      id: 'team',
      label: 'Team',
      type: 'options',
      hint: 'More teams than a row of picks can hold, so they stay here.',
      value: f.team,
      onChange: set('team'),
      options: TEAMS.map((v) => ({
        value: v,
        label: long(v),
        count: count('team', (r) => r.team === v),
      })),
    },
    {
      id: 'region',
      label: 'Region',
      type: 'string',
      value: f.region,
      onChange: set('region'),
      placeholder: 'Any region',
    },
    {
      id: 'attention',
      label: 'Needs attention',
      type: 'boolean',
      hint: 'Waiting on a person, or failed',
      value: f.attention,
      onChange: set('attention'),
    },
    {
      id: 'started',
      label: 'Started',
      type: 'dateRange',
      presets: true,
      value: f.started,
      onChange: set('started'),
    },
    {
      id: 'updated',
      label: 'Last updated',
      type: 'dateRange',
      presets: true,
      value: f.updated,
      onChange: set('updated'),
    },
    {
      id: 'finished',
      label: 'Finished',
      type: 'dateRange',
      presets: true,
      hint: 'Runs that are still going have no finish date, so they are left out.',
      value: f.finished,
      onChange: set('finished'),
    },
    {
      id: 'due',
      label: 'Due',
      type: 'dateRange',
      direction: 'future',
      presets: true,
      value: f.due,
      onChange: set('due'),
    },
  ]

  return (
    <div className="bg-canvas p-6">
      <p className="mb-3 text-[12.5px] text-ink-soft tabular-nums">
        {rows.length.toLocaleString()} match{rows.length === 1 ? '' : 'es'}
      </p>
      <FilterBar
        label="Search and filter runs"
        fields={fields}
        terms={terms}
        onTermsChange={setTerms}
        termFields={TERM_FIELDS}
        filterStyle={style}
        onFilterStyleChange={setStyle}
        onReset={() => setF(EMPTY)}
        showHeader={showHeader}
        showPanel={showPanel}
        defaultOpen={defaultOpen}
        defaultPinned={defaultPinned}
      >
        <DataTable
          caption="Runs"
          columns={COLUMNS}
          sort={sort}
          onSortChange={setSort}
          rows={rows.slice(0, 10)}
          rowId={(r) => r.id}
          minWidth="1680px"
          labels={{ emptyTitle: 'No runs match' }}
          footer={
            <p className="px-4 py-3 text-[12.5px] text-ink-soft tabular-nums">
              Showing {Math.min(10, rows.length)} of {rows.length.toLocaleString()} runs
            </p>
          }
        />
      </FilterBar>
    </div>
  )
}
