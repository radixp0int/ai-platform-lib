// Tenants — every organisation on the platform, its plan and its seats, and
// the one you are in, as the Finals 2.0 Tenants board draws it: the navy band
// with its Details strip, Import from CSV and Add a tenant, then the grid.
//
// Built from the library's parts: PageBand, DataGrid (filters, chips, export,
// bulk bar, pagination, and a list of row actions it draws as two buttons and a
// ⋯ menu), Pill and Avatar. The page holds every piece of state and filters the
// fixture in memory, as a real page would ask an API.
import { useContext, useMemo, useState } from 'react'
import { DataGrid, downloadRows, termMatches, type FilterTerm } from '../../components/data-grid'
import type { ExportColumn } from '../../components/data-grid'
import { sortRows, type Column, type RowAction } from '../../components/data-table'
import type { FilterField } from '../../components/filter-panel'
import { PageBand, type PageBandStat } from '../../components/page-header'
import type { Sort } from '../../components/paging'
import { daysAgo, daysSince, longDate, todayIso } from '../../fixtures/as-of-today'
import { Avatar } from '../../primitives/avatar'
import { Button } from '../../primitives/button'
import type { DateRange } from '../../primitives/date-field'
import {
  CopyIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SwitchIcon,
  TrashIcon,
  UsersIcon,
} from '../../primitives/icons'
import { Pill } from '../../primitives/pill'
import { PlatformContext } from '../app-shell/platform-context'
import { GridCard } from '../grid-card'
import { usePageToast } from '../page-toast'
import {
  CURRENT_ORG_ID,
  initialsOf,
  ORGS,
  PLANS,
  REGIONS,
  type Org,
  type Plan,
  type Region,
} from './tenants.fixtures'

/** A tenant this close to its seat count is "nearly full". */
const NEARLY_FULL = 0.9

const TERM_FIELDS = [
  { key: 'name', label: 'Tenant', glyph: 'Aa', param: 'name__icontains' },
  { key: 'contact', label: 'Primary contact', glyph: '◔', param: 'contact__icontains' },
  { key: 'email', label: 'Email', glyph: '@', param: 'email__icontains' },
  { key: 'domain', label: 'Domain', glyph: '⌂', param: 'domain__icontains' },
]
type TermKey = 'name' | 'contact' | 'email' | 'domain'

const EXPORT_COLUMNS: ExportColumn<Org>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Tenant' },
  { key: 'domain', header: 'Domain' },
  { key: 'plan', header: 'Plan' },
  { key: 'region', header: 'Region' },
  { key: 'contact', header: 'Primary contact' },
  { key: 'email', header: 'Email' },
  { key: 'seatsUsed', header: 'Seats in use' },
  { key: 'seats', header: 'Seats' },
  { key: 'created', header: 'Created' },
]

const NO_DATES: DateRange = { from: null, to: null }
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function Seats({ org }: { org: Org }) {
  const share = org.seats ? org.seatsUsed / org.seats : 0
  return (
    <span className="flex min-w-0 flex-col gap-1.5 text-[12.5px]">
      <span className="truncate tabular-nums">
        {org.seatsUsed.toLocaleString('en-US')} of {org.seats.toLocaleString('en-US')}
        {share >= NEARLY_FULL && (
          <span className="font-semibold text-ink-soft"> · nearly full</span>
        )}
      </span>
      {/* The words above say it; the bar is for scanning down the column. */}
      <span aria-hidden="true" className="block h-1 overflow-hidden rounded-full bg-chip">
        <span
          className="block h-full rounded-full bg-brand-solid"
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </span>
    </span>
  )
}

function columnsFor(currentId: string): Column<Org>[] {
  return [
    {
      id: 'name',
      header: 'Tenant',
      sortKey: 'name',
      cell: (o) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar
            variant="text"
            text={initialsOf(o.name)}
            shape="square"
            size={30}
            tone="soft"
            aria-hidden
          />
          <span className="flex min-w-0 flex-col">
            <span data-row-title className="truncate font-bold text-ink-strong">
              {o.name}
            </span>
            <span className="truncate text-xs text-ink-soft">
              {o.plan} · {o.region}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: '112px',
      // Status is "the tenant you are in": one row says so, the rest are blank.
      cell: (o) =>
        o.id === currentId ? (
          <Pill tone="success" size="sm" dot title="The tenant you are in">
            Active
          </Pill>
        ) : (
          <span className="text-ink-soft">
            <span aria-hidden="true">—</span>
            <span className="sr-only">Not the tenant you are in</span>
          </span>
        ),
    },
    {
      id: 'contact',
      header: 'Primary contact',
      width: '19%',
      hideBelow: 'lg',
      cell: (o) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-ink-strong">{o.contact}</span>
          <span className="truncate text-xs text-ink-soft">{o.email}</span>
        </span>
      ),
    },
    { id: 'seats', header: 'Seats', width: '21%', cell: (o) => <Seats org={o} /> },
    {
      id: 'created',
      header: 'Created',
      sortKey: 'created',
      sortType: 'date',
      width: '120px',
      hideBelow: 'xl',
      cell: (o) => <span className="whitespace-nowrap text-ink-soft">{longDate(o.created)}</span>,
    },
  ]
}

const SORT_WORDS: Record<string, [string, string]> = {
  name: ['name, A to Z', 'name, Z to A'],
  created: ['oldest first', 'newest first'],
}

export type TenantsPageProps = {
  /** Every tenant. Pass `[]` for a platform with none yet. */
  orgs?: Org[]
  /** Whether the band's Details strip starts open. */
  defaultDetailsOpen?: boolean
  /** A search the grid starts with, as if typed and entered: `/tenants?q=…`. */
  initialQuery?: string
}

/** The Tenants page, for platform admins. It sits outside any one tenant. */
export function TenantsPage({
  orgs: initial = ORGS,
  defaultDetailsOpen = false,
  initialQuery,
}: TenantsPageProps) {
  const platform = useContext(PlatformContext)
  const [toast, say] = usePageToast()
  const [orgs] = useState(initial)
  const [currentId, setCurrentId] = useState(CURRENT_ORG_ID)
  const [terms, setTerms] = useState<FilterTerm[]>(
    initialQuery ? [{ id: 'search:initial', field: null, value: initialQuery }] : [],
  )
  const [plans, setPlans] = useState<Plan[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [created, setCreated] = useState<DateRange>(NO_DATES)
  const [hasSeats, setHasSeats] = useState(false)
  const [sort, setSort] = useState<Sort[]>([{ field: 'name', direction: 'asc' }])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(8)
  const [selected, setSelected] = useState<string[]>([])

  const columns = useMemo(() => columnsFor(currentId), [currentId])
  const filtered = useMemo(
    () =>
      orgs.filter((o) => {
        if (plans.length && !plans.includes(o.plan)) return false
        if (regions.length && !regions.includes(o.region)) return false
        if (created.from && o.created < created.from) return false
        if (created.to && o.created > created.to) return false
        if (hasSeats && o.seatsUsed === 0) return false
        return terms.every((term) =>
          term.field
            ? termMatches(term, o[term.field as TermKey])
            : [o.name, o.domain, o.contact, o.email, o.plan, o.region].some((v) =>
                termMatches(term, v),
              ),
        )
      }),
    [orgs, plans, regions, created, hasSeats, terms],
  )
  const sorted = useMemo(() => sortRows(filtered, sort, columns), [filtered, sort, columns])
  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * size, safePage * size)

  const reset = () => {
    setPlans([])
    setRegions([])
    setCreated(NO_DATES)
    setHasSeats(false)
    setPage(1)
  }

  // ── The band ────────────────────────────────────────────────────────────
  const current = orgs.find((o) => o.id === currentId)
  const used = orgs.reduce((n, o) => n + o.seatsUsed, 0)
  const paid = orgs.reduce((n, o) => n + o.seats, 0)
  const fresh = orgs.filter((o) => daysSince(o.created) <= 90)
  const newest = [...fresh].sort((a, b) => b.created.localeCompare(a.created))[0]
  const stats: PageBandStat[] = [
    {
      label: 'Tenants',
      value: String(orgs.length),
      note: current ? `You are in ${current.name}` : 'You are in none of them',
    },
    {
      label: 'Seats in use',
      value: `${used.toLocaleString('en-US')} of ${paid.toLocaleString('en-US')}`,
      note: paid ? `${Math.round((used / paid) * 100)}% of paid seats in use` : 'No paid seats',
    },
    {
      label: 'Plans',
      value: PLANS.map((plan) => orgs.filter((o) => o.plan === plan).length).join(' · '),
      note: PLANS.join(' · '),
    },
    {
      label: 'New in the last 90 days',
      value: String(fresh.length),
      note: newest ? `Most recent: ${newest.name}` : 'None',
    },
  ]

  // ── The grid ────────────────────────────────────────────────────────────
  const today = todayIso()
  const fields: FilterField[] = [
    {
      id: 'plan',
      label: 'Plan',
      type: 'options',
      value: plans,
      options: PLANS.map((plan) => ({
        value: plan,
        label: plan,
        count: orgs.filter((o) => o.plan === plan).length,
      })),
      onChange: (next) => {
        setPlans(next as Plan[])
        setPage(1)
      },
    },
    {
      id: 'region',
      label: 'Region',
      type: 'options',
      value: regions,
      options: REGIONS.map((region) => ({
        value: region,
        label: region,
        count: orgs.filter((o) => o.region === region).length,
      })),
      onChange: (next) => {
        setRegions(next as Region[])
        setPage(1)
      },
    },
    {
      id: 'created',
      label: 'Created',
      type: 'dateRange',
      value: created,
      presets: [
        { label: 'Last 30 days', short: '30D', value: { from: daysAgo(30), to: today } },
        { label: 'Last 90 days', short: '90D', value: { from: daysAgo(90), to: today } },
        { label: 'Over a year ago', short: '1Y+', value: { from: null, to: daysAgo(366) } },
      ],
      onChange: (next) => {
        setCreated(next)
        setPage(1)
      },
    },
    {
      id: 'seats',
      label: 'Has active seats',
      hint: 'Hide tenants with nobody signed in',
      type: 'boolean',
      value: hasSeats,
      onChange: (next) => {
        setHasSeats(next)
        setPage(1)
      },
    },
  ]

  const { field: sortField = 'name', direction = 'asc' } = sort[0] ?? {}
  const sortWords = SORT_WORDS[sortField]?.[direction === 'asc' ? 0 : 1] ?? 'name, A to Z'
  const line = !orgs.length
    ? 'Nothing here yet'
    : `${
        sorted.length === orgs.length
          ? plural(orgs.length, 'tenant')
          : `${sorted.length} of ${plural(orgs.length, 'tenant')} match`
      } · sorted by ${sortWords}`

  const exportRows = (format: string, rows: Org[]) => {
    downloadRows('tenants', format, rows, EXPORT_COLUMNS)
    say(`Downloaded tenants.${format} · ${plural(rows.length, 'row')}`)
  }
  const copyId = (o: Org) => {
    // The clipboard can refuse (no focus, no permission); the ID is in the message either way.
    navigator.clipboard?.writeText(o.id).catch(() => {})
    say(`Copied ${o.name}’s tenant ID, ${o.id}`)
  }
  const addTenant = () => say('Add a tenant would open here')

  // Two buttons, then the ⋯ menu: Switch (not on the tenant you are in), Copy, Manage people, a
  // rule and Delete (not on the tenant you are in either).
  const rowActions: RowAction<Org>[] = [
    {
      id: 'view',
      label: 'View details',
      icon: <EyeIcon width={15} height={15} />,
      onSelect: (o) => say(`Details for ${o.name} would open here`),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <PencilIcon width={15} height={15} />,
      onSelect: (o) => say(`Editing ${o.name} would open here`),
    },
    {
      id: 'switch',
      label: 'Switch to this tenant',
      icon: <SwitchIcon width={15} height={15} />,
      hidden: (o) => o.id === currentId,
      onSelect: (o) => {
        setCurrentId(o.id)
        say(`You are in ${o.name} now`)
      },
    },
    {
      id: 'copy',
      label: 'Copy tenant ID',
      icon: <CopyIcon width={15} height={15} />,
      onSelect: copyId,
    },
    {
      id: 'people',
      label: 'Manage people',
      icon: <UsersIcon width={15} height={15} />,
      onSelect: (o) => say(`People in ${o.name} would open here`),
    },
    {
      id: 'delete',
      label: 'Delete tenant…',
      icon: <TrashIcon width={15} height={15} />,
      tone: 'danger',
      separatorBefore: true,
      disabled: (o) => o.id === currentId,
      hint: (o) => (o.id === currentId ? 'You are in it' : undefined),
      onSelect: (o) => say(`Deleting ${o.name} would ask you to confirm`),
    },
  ]

  return (
    <PageBand
      title="Tenants"
      description="Every organisation, its plan and its seats."
      breadcrumbs={[
        { label: 'Overview', href: platform ? `${platform.base}/home` : undefined },
        { label: 'Govern' },
        { label: 'Tenant Admin' },
      ]}
      details={{ stats, defaultOpen: defaultDetailsOpen }}
      actions={
        <>
          <Button variant="inverse" onClick={() => say('Import from CSV would open here')}>
            Import from CSV
          </Button>
          <Button
            variant="inverse-solid"
            icon={<PlusIcon width={15} height={15} />}
            onClick={addTenant}
          >
            Add a tenant
          </Button>
        </>
      }
    >
      <GridCard id="tenants-all" title="All tenants" line={line}>
        <DataGrid
          searchLabel="Search and filter tenants"
          caption="Tenants"
          columns={columns}
          rows={pageRows}
          rowId={(o) => o.id}
          rowLabel={(o) => o.name}
          fields={orgs.length ? fields : undefined}
          terms={terms}
          onTermsChange={(next) => {
            setTerms(next)
            setPage(1)
          }}
          termFields={TERM_FIELDS}
          findMatches={false}
          onReset={reset}
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
                variant="inverse"
                size="sm"
                onClick={() =>
                  say(`Change plan for ${plural(selected.length, 'tenant')} would open here`)
                }
              >
                Change plan
              </Button>
              <Button
                variant="inverse"
                size="sm"
                onClick={() =>
                  exportRows(
                    'csv',
                    sorted.filter((o) => selected.includes(o.id)),
                  )
                }
              >
                Export
              </Button>
              <Button
                variant="inverse"
                size="sm"
                onClick={() =>
                  say(
                    selected.includes(currentId)
                      ? 'You can’t delete the tenant you are in. Clear it from the selection first.'
                      : `Deleting ${plural(selected.length, 'tenant')} would ask you to confirm`,
                  )
                }
              >
                Delete
              </Button>
            </>
          }
          minWidth="600px"
          rowActionsVisible="always"
          actionsHeader="visible"
          rowActions={rowActions}
          emptyAction={
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon width={14} height={14} />}
              onClick={addTenant}
            >
              Add a tenant
            </Button>
          }
          labels={{
            placeholder: 'Search tenants, contacts and domains…',
            noMatchTitle: 'No tenants match',
            noMatchBody: 'Remove a filter, or clear them all.',
            emptyTitle: 'No tenants yet',
            emptyBody: 'Each organisation you add shows up here, with its plan, contact and seats.',
          }}
          exportFormats={['csv', 'json']}
          totalCount={sorted.length}
          onExport={(format, scope) =>
            exportRows(
              format,
              scope === 'selected' ? sorted.filter((o) => selected.includes(o.id)) : sorted,
            )
          }
          pagination={{
            page: safePage,
            size,
            totalElements: sorted.length,
            onPageChange: setPage,
            onSizeChange: (next) => {
              setSize(next)
              setPage(1)
            },
            sizeOptions: [8, 10, 25],
          }}
        />
      </GridCard>
      {toast}
    </PageBand>
  )
}
