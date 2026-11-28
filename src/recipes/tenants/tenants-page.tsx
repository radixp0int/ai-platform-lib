// Tenants — every organisation on the platform, its plan and its seats, as
// the Finals 2.0 Tenants board draws it: the navy band with "need a look" and
// its Details strip, Import from CSV and Add a tenant, then the grid.
//
// Built from the library's parts: PageBand, DataGrid (filters, chips, export,
// bulk bar, pagination), Pill, Avatar and Button. The page holds every piece of
// state and filters the fixture in memory, as a real page would ask an API.
import { useContext, useMemo, useState } from 'react'
import { DataGrid, downloadRows, termMatches, type FilterTerm } from '../../components/data-grid'
import type { ExportColumn } from '../../components/data-grid'
import { sortRows, type Column } from '../../components/data-table'
import type { FilterField } from '../../components/filter-panel'
import { PageBand, type PageBandStat } from '../../components/page-header'
import type { Sort } from '../../components/paging'
import { daysAgo, daysSince, longDate, todayIso } from '../../fixtures/as-of-today'
import { Avatar } from '../../primitives/avatar'
import { Button } from '../../primitives/button'
import type { DateRange } from '../../primitives/date-field'
import { PlusIcon } from '../../primitives/icons'
import { Pill, type PillTone } from '../../primitives/pill'
import { PlatformContext } from '../app-shell/platform-context'
import { GridCard } from '../grid-card'
import { usePageToast } from '../page-toast'
import {
  initialsOf,
  ORGS,
  PLANS,
  REGIONS,
  STATUS_LABEL,
  STATUSES,
  type Org,
  type OrgStatus,
  type Plan,
  type Region,
} from './tenants.fixtures'

const STATUS_TONE: Record<OrgStatus, PillTone> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
}

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
  { key: 'status', header: 'Status', value: (o) => STATUS_LABEL[o.status] },
  { key: 'plan', header: 'Plan' },
  { key: 'region', header: 'Region' },
  { key: 'contact', header: 'Primary contact' },
  { key: 'email', header: 'Email' },
  { key: 'seatsUsed', header: 'Seats in use' },
  { key: 'seats', header: 'Seats' },
  { key: 'created', header: 'Created' },
]

const NO_DATES: DateRange = { from: null, to: null }

function Seats({ org }: { org: Org }) {
  if (org.status !== 'active') {
    return <span className="block truncate text-xs text-ink-soft">{org.note}</span>
  }
  const share = org.seats ? org.seatsUsed / org.seats : 0
  return (
    <span className="flex min-w-0 flex-col gap-1.5 text-[12.5px]">
      <span className="truncate tabular-nums">
        {org.seatsUsed} of {org.seats}
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

const COLUMNS: Column<Org>[] = [
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
    width: '132px',
    cell: (o) => (
      <Pill tone={STATUS_TONE[o.status]} size="sm" dot>
        {STATUS_LABEL[o.status]}
      </Pill>
    ),
  },
  {
    id: 'contact',
    header: 'Primary contact',
    width: '17%',
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
  const [orgs, setOrgs] = useState(initial)
  const [terms, setTerms] = useState<FilterTerm[]>(
    initialQuery ? [{ id: 'search:initial', field: null, value: initialQuery }] : [],
  )
  const [statuses, setStatuses] = useState<OrgStatus[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [created, setCreated] = useState<DateRange>(NO_DATES)
  const [hasSeats, setHasSeats] = useState(false)
  const [sort, setSort] = useState<Sort[]>([{ field: 'name', direction: 'asc' }])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(8)
  const [selected, setSelected] = useState<string[]>([])

  const filtered = useMemo(
    () =>
      orgs.filter((o) => {
        if (statuses.length && !statuses.includes(o.status)) return false
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
    [orgs, statuses, plans, regions, created, hasSeats, terms],
  )
  const sorted = useMemo(() => sortRows(filtered, sort, COLUMNS), [filtered, sort])
  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * size, safePage * size)

  const reset = () => {
    setStatuses([])
    setPlans([])
    setRegions([])
    setCreated(NO_DATES)
    setHasSeats(false)
    setPage(1)
  }
  const showOnly = (status: OrgStatus) => {
    setStatuses([status])
    setPage(1)
  }
  const update = (ids: string[], patch: Partial<Org>) =>
    setOrgs((all) => all.map((o) => (ids.includes(o.id) ? { ...o, ...patch } : o)))

  // ── The band ────────────────────────────────────────────────────────────
  const count = (status: OrgStatus) => orgs.filter((o) => o.status === status).length
  const pending = orgs.filter((o) => o.status === 'pending')
  const oldestInvite = pending.length ? Math.max(...pending.map((o) => daysSince(o.created))) : 0
  const active = orgs.filter((o) => o.status === 'active')
  const used = active.reduce((n, o) => n + o.seatsUsed, 0)
  const paid = active.reduce((n, o) => n + o.seats, 0)
  const needLook = orgs.length - active.length
  const stats: PageBandStat[] = [
    {
      label: 'Active',
      value: String(active.length),
      note: 'Signed in this month',
      onSelect: () => showOnly('active'),
    },
    {
      label: 'Waiting on an invite',
      value: String(pending.length),
      note: pending.length
        ? `Oldest sent ${oldestInvite} ${oldestInvite === 1 ? 'day' : 'days'} ago`
        : 'None outstanding',
      onSelect: () => showOnly('pending'),
    },
    {
      label: 'Suspended',
      value: String(count('suspended')),
      note: 'Nobody can sign in',
      onSelect: () => showOnly('suspended'),
    },
    {
      label: 'Seats in use',
      value: `${used.toLocaleString('en-US')} of ${paid.toLocaleString('en-US')}`,
      note: paid ? `${Math.round((used / paid) * 100)}% of paid seats in use` : 'No paid seats',
    },
  ]

  // ── The grid ────────────────────────────────────────────────────────────
  const today = todayIso()
  const fields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: statuses,
      options: STATUSES.map((status) => ({
        value: status,
        label: STATUS_LABEL[status],
        count: count(status),
      })),
      onChange: (next) => {
        setStatuses(next as OrgStatus[])
        setPage(1)
      },
    },
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
          ? `${orgs.length} tenants`
          : `${sorted.length} of ${orgs.length} tenants match`
      } · sorted by ${sortWords}`

  const rowAction = (o: Org) =>
    o.status === 'pending' ? (
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          update([o.id], { note: 'Invite sent today' })
          say(`Invite resent to ${o.contact}`)
        }}
      >
        Resend invite
      </Button>
    ) : o.status === 'suspended' ? (
      <Button
        size="sm"
        onClick={() => {
          update([o.id], { status: 'active', note: '' })
          say(`${o.name} is active again`)
        }}
      >
        Reactivate
      </Button>
    ) : (
      <Button variant="ghost" size="sm" onClick={() => say(`${o.name} would open here`)}>
        Open
      </Button>
    )

  const addTenant = () => say('Add a tenant would open here')

  return (
    <PageBand
      title="Tenants"
      description="Every organisation, its plan and its seats."
      breadcrumbs={[
        { label: 'Overview', href: platform ? `${platform.base}/home` : undefined },
        { label: 'Govern' },
        { label: 'Tenant Admin' },
      ]}
      details={{
        summary: needLook ? `${needLook} need a look` : undefined,
        stats,
        defaultOpen: defaultDetailsOpen,
      }}
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
          columns={COLUMNS}
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
                onClick={() => say(`Change plan for ${selected.length} would open here`)}
              >
                Change plan
              </Button>
              <Button
                variant="inverse"
                size="sm"
                onClick={() => {
                  update(selected, { status: 'suspended', note: 'Suspended today' })
                  say(
                    `Suspended ${selected.length} ${selected.length === 1 ? 'tenant' : 'tenants'}`,
                  )
                  setSelected([])
                }}
              >
                Suspend
              </Button>
              <Button
                variant="inverse"
                size="sm"
                onClick={() =>
                  say(
                    `Emailing ${selected.length} ${selected.length === 1 ? 'contact' : 'contacts'} would open here`,
                  )
                }
              >
                Email contacts
              </Button>
            </>
          }
          minWidth="600px"
          actionsWidth="136px"
          rowActionsVisible="always"
          rowActions={(o) => <span className="flex justify-end">{rowAction(o)}</span>}
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
          onExport={(format, scope) => {
            const rows =
              scope === 'selected' ? sorted.filter((o) => selected.includes(o.id)) : sorted
            downloadRows('tenants', format, rows, EXPORT_COLUMNS)
            say(
              `Downloaded tenants.${format} · ${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`,
            )
          }}
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
