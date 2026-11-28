// Ingestion — the documents and API sources the assistant can read, as the
// Finals 2.0 Ingestion board draws it: the navy band with its Details strip
// and the page's three actions, then one card holding the sources grid.
//
// Built from the library's parts and nothing else: PageBand for the band,
// DataGrid for the toolbar, filters, bulk bar, table and pagination, Pill and
// IconButton in the cells. The page holds every piece of state and filters the
// fixture in memory, the way a real page would hand the same values to an API.
import { useContext, useMemo, useState } from 'react'
import { DataGrid, downloadRows, termMatches, type FilterTerm } from '../../components/data-grid'
import type { ExportColumn } from '../../components/data-grid'
import { sortRows, type Column } from '../../components/data-table'
import type { FilterField } from '../../components/filter-panel'
import { PageBand, type PageBandStat } from '../../components/page-header'
import type { Sort } from '../../components/paging'
import { shortDate } from '../../fixtures/as-of-today'
import { Button } from '../../primitives/button'
import { IconButton } from '../../primitives/icon-button'
import { DotsIcon, PencilIcon, PlusIcon, RefreshIcon } from '../../primitives/icons'
import { Pill, type PillTone } from '../../primitives/pill'
import { PlatformContext } from '../app-shell/platform-context'
import { GridCard } from '../grid-card'
import { usePageToast } from '../page-toast'
import {
  ADDED_THIS_WEEK,
  KIND_LABEL,
  KINDS,
  SOURCES,
  STATUS_LABEL,
  STATUSES,
  type Source,
  type SourceKind,
  type SourceStatus,
} from './ingestion.fixtures'

const STATUS_TONE: Record<SourceStatus, PillTone> = {
  indexed: 'success',
  syncing: 'brand',
  failing: 'danger',
  queued: 'warning',
}

const TERM_FIELDS = [
  { key: 'name', label: 'Source', glyph: 'Aa', param: 'name__icontains' },
  { key: 'owner', label: 'Owner', glyph: '◔', param: 'owner__icontains' },
]

const EXPORT_COLUMNS: ExportColumn<Source>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Source' },
  { key: 'kind', header: 'Type', value: (s) => KIND_LABEL[s.kind] },
  { key: 'status', header: 'Status', value: (s) => STATUS_LABEL[s.status] },
  { key: 'documents', header: 'Documents' },
  { key: 'owner', header: 'Owner' },
  { key: 'synced', header: 'Last sync' },
]

const COLUMNS: Column<Source>[] = [
  {
    id: 'name',
    header: 'Source',
    sortKey: 'name',
    width: '26%',
    cell: (s) => (
      <span data-row-title className="block truncate font-bold text-ink-strong">
        {s.name}
      </span>
    ),
  },
  {
    id: 'kind',
    header: 'Type',
    width: '11%',
    hideBelow: 'md',
    cell: (s) => <span className="block truncate text-ink-soft">{KIND_LABEL[s.kind]}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    sortKey: 'status',
    sortValue: (s) => STATUS_LABEL[s.status],
    width: '120px',
    cell: (s) => (
      <Pill tone={STATUS_TONE[s.status]} variant="outline" size="sm" dot>
        {STATUS_LABEL[s.status]}
      </Pill>
    ),
  },
  {
    id: 'documents',
    header: 'Documents',
    sortKey: 'documents',
    sortType: 'number',
    width: '136px',
    cell: (s) => <span className="tabular-nums">{s.documents.toLocaleString('en-US')}</span>,
  },
  {
    id: 'owner',
    header: 'Owner',
    hideBelow: 'lg',
    cell: (s) => <span className="block truncate">{s.owner}</span>,
  },
  {
    id: 'synced',
    header: 'Last sync',
    sortKey: 'synced',
    sortType: 'date',
    width: '128px',
    cell: (s) => <span className="whitespace-nowrap text-ink-soft">{shortDate(s.synced)}</span>,
  },
]

export type IngestionPageProps = {
  /** The tenant's sources. Pass `[]` for a tenant that has connected nothing yet. */
  sources?: Source[]
  /** Whether the band's Details strip starts open. */
  defaultDetailsOpen?: boolean
  /** A search the grid starts with, as if typed and entered. */
  initialQuery?: string
}

/**
 * The Ingestion page. Inside the app shell, Upload documents opens the Add a
 * source wizard; on its own, it and the other actions say what would open.
 */
export function IngestionPage({
  sources: initial = SOURCES,
  defaultDetailsOpen = false,
  initialQuery,
}: IngestionPageProps) {
  const platform = useContext(PlatformContext)
  const [toast, say] = usePageToast()
  const [sources, setSources] = useState(initial)
  const [terms, setTerms] = useState<FilterTerm[]>(
    initialQuery ? [{ id: 'search:initial', field: null, value: initialQuery }] : [],
  )
  const [statuses, setStatuses] = useState<SourceStatus[]>([])
  const [kinds, setKinds] = useState<SourceKind[]>([])
  const [sort, setSort] = useState<Sort[]>([{ field: 'synced', direction: 'desc' }])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(8)
  const [selected, setSelected] = useState<string[]>([])

  const filtered = useMemo(
    () =>
      sources.filter((s) => {
        if (statuses.length && !statuses.includes(s.status)) return false
        if (kinds.length && !kinds.includes(s.kind)) return false
        return terms.every((term) =>
          term.field
            ? termMatches(term, s[term.field as 'name' | 'owner'])
            : [s.name, s.owner, KIND_LABEL[s.kind]].some((v) => termMatches(term, v)),
        )
      }),
    [sources, statuses, kinds, terms],
  )
  const sorted = useMemo(() => sortRows(filtered, sort, COLUMNS), [filtered, sort])
  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * size, safePage * size)

  // ── The band ────────────────────────────────────────────────────────────
  const failing = sources.filter((s) => s.status === 'failing')
  const documents = sources.reduce((n, s) => n + s.documents, 0)
  const latest = [...sources].sort((a, b) => b.synced.localeCompare(a.synced))[0]
  // The band is navy in both modes, so these two are fixed tints that read on it.
  const stats: PageBandStat[] = [
    {
      label: 'Documents',
      value: documents.toLocaleString('en-US'),
      note: `across ${sources.length} ${sources.length === 1 ? 'source' : 'sources'}`,
    },
    {
      label: 'Sources syncing',
      value: sources.length ? (
        <span className={failing.length ? 'text-[#ffb4a8]' : undefined}>
          {sources.length - failing.length} of {sources.length}
        </span>
      ) : (
        '—'
      ),
      note: failing.length
        ? `${failing.length} failing: ${failing.map((s) => s.name).join(', ')}`
        : 'All healthy',
    },
    {
      label: 'Added this week',
      value: sources.length ? <span className="text-[#9be3b4]">+{ADDED_THIS_WEEK}</span> : '0',
      note: 'documents',
    },
    {
      label: 'Last sync',
      value: latest ? shortDate(latest.synced) : '—',
      note: latest ? latest.name : 'Nothing has run',
    },
  ]

  // ── Actions ─────────────────────────────────────────────────────────────
  const upload = () =>
    platform
      ? platform.go(`${platform.base}/ingestion/new`)
      : say('Upload documents would open here')
  const setStatus = (ids: string[], status: SourceStatus) =>
    setSources((all) => all.map((s) => (ids.includes(s.id) ? { ...s, status } : s)))
  const syncNow = (ids: string[]) => {
    setStatus(ids, 'syncing')
    const one = sources.find((s) => s.id === ids[0])
    say(
      ids.length === 1 && one
        ? `Sync started for ${one.name}`
        : `Sync started for ${ids.length} sources`,
    )
  }

  const fields: FilterField[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'options',
      value: statuses,
      options: STATUSES.map((status) => ({
        value: status,
        label: STATUS_LABEL[status],
        count: sources.filter((s) => s.status === status).length,
      })),
      onChange: (next) => {
        setStatuses(next as SourceStatus[])
        setPage(1)
      },
    },
    {
      id: 'kind',
      label: 'Type',
      type: 'options',
      value: kinds,
      options: KINDS.map((kind) => ({
        value: kind,
        label: KIND_LABEL[kind],
        count: sources.filter((s) => s.kind === kind).length,
      })),
      onChange: (next) => {
        setKinds(next as SourceKind[])
        setPage(1)
      },
    },
  ]

  const uploadButton = (
    <Button variant="primary" size="sm" icon={<PlusIcon width={14} height={14} />} onClick={upload}>
      Upload documents
    </Button>
  )

  return (
    <PageBand
      title="Ingestion"
      description="Documents and API sources the assistant can read."
      breadcrumbs={[
        { label: 'Overview', href: platform ? `${platform.base}/home` : undefined },
        { label: 'Build' },
      ]}
      details={{
        summary: failing.length ? `${failing.length} failing` : undefined,
        stats,
        defaultOpen: defaultDetailsOpen,
      }}
      actions={
        <>
          <Button variant="inverse" onClick={() => say('Schedule a sync would open here')}>
            Schedule a sync
          </Button>
          <Button variant="inverse" onClick={() => say('Connect an API would open here')}>
            Connect an API
          </Button>
          <Button
            variant="inverse-solid"
            icon={<PlusIcon width={15} height={15} />}
            onClick={upload}
          >
            Upload documents
          </Button>
        </>
      }
    >
      <GridCard
        id="ingestion-sources"
        title="Sources"
        line={
          sources.length
            ? `${sources.length} connected, ${failing.length} failing`
            : 'Nothing here yet'
        }
      >
        <DataGrid
          searchLabel="Search and filter sources"
          caption="Ingestion sources"
          columns={COLUMNS}
          rows={pageRows}
          rowId={(s) => s.id}
          rowLabel={(s) => s.name}
          fields={sources.length ? fields : undefined}
          terms={terms}
          onTermsChange={(next) => {
            setTerms(next)
            setPage(1)
          }}
          termFields={TERM_FIELDS}
          findMatches={false}
          onReset={() => {
            setStatuses([])
            setKinds([])
            setPage(1)
          }}
          sort={sort}
          onSortChange={(next) => {
            setSort(next)
            setPage(1)
          }}
          selectedIds={selected}
          onSelectionChange={setSelected}
          bulkActions={
            <>
              <Button variant="inverse" size="sm" onClick={() => syncNow(selected)}>
                Sync now
              </Button>
              <Button
                variant="inverse"
                size="sm"
                onClick={() =>
                  say(`Paused ${selected.length} ${selected.length === 1 ? 'source' : 'sources'}`)
                }
              >
                Pause
              </Button>
            </>
          }
          minWidth="600px"
          actionsWidth="112px"
          rowActionsVisible="always"
          rowActions={(s) => (
            <span className="flex justify-end gap-0.5">
              <IconButton
                size="sm"
                shape="rounded"
                aria-label={`Sync ${s.name} now`}
                title="Sync now"
                onClick={() => syncNow([s.id])}
              >
                <RefreshIcon width={14} height={14} />
              </IconButton>
              <IconButton
                size="sm"
                shape="rounded"
                aria-label={`Edit ${s.name}`}
                title="Edit"
                onClick={() => say(`Editing ${s.name} would open here`)}
              >
                <PencilIcon width={14} height={14} />
              </IconButton>
              <IconButton
                size="sm"
                shape="rounded"
                aria-label={`More for ${s.name}`}
                title="More"
                onClick={() => say(`More actions for ${s.name} would open here`)}
              >
                <DotsIcon width={14} height={14} />
              </IconButton>
            </span>
          )}
          emptyAction={uploadButton}
          labels={{
            placeholder: 'Search sources, or pick a filter…',
            noMatchTitle: 'No sources match',
            noMatchBody: 'Remove a filter, or clear them all.',
            emptyTitle: 'Nothing in Ingestion yet',
            emptyBody: 'Upload documents or connect an API, and the assistant can read them.',
          }}
          exportFormats={['csv', 'json']}
          totalCount={sorted.length}
          onExport={(format, scope) => {
            const rows =
              scope === 'selected' ? sorted.filter((s) => selected.includes(s.id)) : sorted
            downloadRows('sources', format, rows, EXPORT_COLUMNS)
            say(
              `Downloaded sources.${format} · ${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`,
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
            sizeOptions: [8, 16],
          }}
        />
      </GridCard>
      {toast}
    </PageBand>
  )
}
