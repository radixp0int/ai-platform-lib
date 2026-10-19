import { PageHeader } from '../../../components/page-header'
import { Avatar } from '../../../primitives/avatar'
// `/tenants` — every tenant, for a platform admin. It sits outside any one
// tenant, so the shell keeps the chrome of whichever was used last.
//
// Built on the same parts as DataTablePage: <DataTable/> with a search field
// above it and <Pagination/> in its footer, with the host holding all the
// state. What is new here is the row: expanding one opens a minimal editor —
// name and spaces — instead of a read-only detail grid.
import { useEffect, useMemo, useState } from 'react'
import { DataTable, type Column } from '../../../components/data-table'
import { Omnibox } from '../../../components/omnibox'
import { Pagination } from '../../../components/pagination'
import { type Sort } from '../../../components/paging'
import {
  SPACE_LABEL,
  SPACE_ORDER,
  formatTenantDate,
  type SpaceId,
  type Tenant,
  type TenantStatus,
} from '../../../fixtures/platform/tenants'
import { Button } from '../../../primitives/button'
import { Checkbox } from '../../../primitives/checkbox'
import { IconButton } from '../../../primitives/icon-button'
import { PencilIcon } from '../../../primitives/icons'
import { Link } from '../../../primitives/link'
import { Pill, type PillTone } from '../../../primitives/pill'
import { PillList } from '../../../primitives/pill-list'
import { TextInput } from '../../../primitives/text-input'
import { usePlatform } from '../platform-context'
import { pageColumn } from './pageStyles'

const STATUS_TONE: Record<TenantStatus, PillTone> = {
  active: 'brand',
  pending: 'warning',
  suspended: 'danger',
}
const STATUS_LABEL: Record<TenantStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
}

type SortKey = 'name' | 'status' | 'contact' | 'created'

const sortValue = (tenant: Tenant, key: SortKey) => tenant[key].toLocaleLowerCase()

export function TenantsPage({
  editId = null,
  onClearEdit,
}: {
  editId?: string | null
  onClearEdit?: () => void
}) {
  const { tenants, updateTenant } = usePlatform()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort[]>([{ field: 'name', direction: 'asc' }])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [expanded, setExpanded] = useState<string[]>(editId ? [editId] : [])

  const sorted = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    const matches = term
      ? tenants.filter((tenant) =>
          [tenant.name, tenant.contact, tenant.id].some((field) =>
            field.toLocaleLowerCase().includes(term),
          ),
        )
      : tenants
    const { field, direction } = sort[0] ?? { field: 'name', direction: 'asc' }
    const key = field as SortKey
    const sign = direction === 'desc' ? -1 : 1
    return [...matches].sort((a, b) => sign * sortValue(a, key).localeCompare(sortValue(b, key)))
  }, [tenants, query, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const rows = sorted.slice((safePage - 1) * size, safePage * size)

  // Arriving from the switcher's edit control: open that row, on its page.
  useEffect(() => {
    if (!editId) return
    const index = sorted.findIndex((tenant) => tenant.id === editId)
    if (index < 0) return
    setPage(Math.floor(index / size) + 1)
    setExpanded([editId])
    // Only on arrival — re-running on every sort would yank the page back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  const closeEditor = (id: string) => {
    setExpanded((ids) => ids.filter((item) => item !== id))
    if (editId === id) onClearEdit?.()
  }

  const columns: Column<Tenant>[] = [
    {
      id: 'name',
      header: 'Name',
      sortKey: 'name',
      width: '22%',
      cell: (tenant) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar
            variant="text"
            text={tenant.initials}
            shape="square"
            size={28}
            tone="soft"
            style={{ fontSize: 11 }}
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-control bg-chip text-[11px] font-extrabold text-chip-fg"
          />
          <span data-row-title className="truncate font-bold text-ink-strong">
            {tenant.name}
          </span>
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortKey: 'status',
      width: '13%',
      cell: (tenant) => (
        <Pill tone={STATUS_TONE[tenant.status]} variant="outline" size="sm">
          {STATUS_LABEL[tenant.status]}
        </Pill>
      ),
    },
    {
      id: 'spaces',
      header: 'Spaces',
      width: '22%',
      hideBelow: 'md',
      cell: (tenant) => (
        <PillList
          label="Spaces"
          max={2}
          items={SPACE_ORDER.filter((space) => tenant.spaces.includes(space)).map((space) => ({
            id: space,
            label: SPACE_LABEL[space],
          }))}
        />
      ),
    },
    {
      id: 'contact',
      header: 'Primary contact',
      sortKey: 'contact',
      width: '18%',
      hideBelow: 'lg',
      cell: (tenant) => <span className="block truncate">{tenant.contact}</span>,
    },
    {
      id: 'created',
      header: 'Created',
      sortKey: 'created',
      width: '13%',
      hideBelow: 'xl',
      cell: (tenant) => (
        <span className="whitespace-nowrap text-ink-soft">{formatTenantDate(tenant.created)}</span>
      ),
    },
  ]

  return (
    <div className={`${pageColumn} max-w-[74rem] gap-4`}>
      <PageHeader
        title={<>Tenants</>}
        className="flex flex-col gap-1"
        descriptionClassName="text-sm text-ink-soft tabular-nums"
        description={
          <>
            {sorted.length} {sorted.length === 1 ? 'tenant' : 'tenants'}. Only platform admins see
            this page.
          </>
        }
      />

      <Omnibox
        label="Search tenants"
        placeholder="Search by name, contact or slug"
        value={query}
        onValueChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
      />

      <DataTable
        caption="Tenants, with sorting, pagination and an inline editor"
        actionsWidth="72px"
        columns={columns}
        rows={rows}
        rowId={(tenant) => tenant.id}
        sort={sort}
        onSortChange={(next) => {
          setSort(next)
          setPage(1)
        }}
        expandedIds={expanded}
        onExpandedChange={setExpanded}
        renderExpanded={(tenant) => (
          <TenantEditor
            // Remounts on a saved change, so the fields restart from the new values.
            key={`${tenant.name}:${tenant.spaces.join()}`}
            tenant={tenant}
            onSave={(patch) => {
              updateTenant(tenant.id, patch)
              closeEditor(tenant.id)
            }}
            onCancel={() => closeEditor(tenant.id)}
          />
        )}
        rowActions={(tenant) => (
          <IconButton
            size="lg"
            shape="rounded"
            aria-label={`Edit ${tenant.name}`}
            title="Edit"
            onClick={() =>
              expanded.includes(tenant.id)
                ? closeEditor(tenant.id)
                : setExpanded((ids) => [...ids, tenant.id])
            }
          >
            <PencilIcon width={15} height={15} />
          </IconButton>
        )}
        labels={{ emptyTitle: 'No tenants match', expandRow: (row) => `Edit ${row}` }}
        footer={
          <Pagination
            page={safePage}
            size={size}
            totalElements={sorted.length}
            totalPages={totalPages}
            onPageChange={setPage}
            onSizeChange={(next) => {
              setSize(next)
              setPage(1)
            }}
            sizeOptions={[5, 10, 25]}
          />
        }
      />
    </div>
  )
}

/**
 * The minimal tenant edit: its name, and which spaces it has. The slug is
 * shown but fixed — it is in every link anyone has ever copied.
 */
function TenantEditor({
  tenant,
  onSave,
  onCancel,
}: {
  tenant: Tenant
  onSave: (patch: { name: string; spaces: SpaceId[] }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(tenant.name)
  const [spaces, setSpaces] = useState<SpaceId[]>(tenant.spaces)
  const trimmed = name.trim()
  const dirty = trimmed !== tenant.name || spaces.join() !== tenant.spaces.join()
  const toggle = (space: SpaceId) =>
    setSpaces((current) =>
      // Kept in menu order, whatever order they were ticked in.
      SPACE_ORDER.filter((id) => (id === space ? !current.includes(id) : current.includes(id))),
    )

  return (
    <form
      className="flex flex-wrap items-end gap-x-7 gap-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (trimmed && dirty) onSave({ name: trimmed, spaces })
      }}
    >
      <label className="flex w-60 flex-col gap-1.5 text-xs font-bold text-ink-soft">
        Name
        <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
      </label>

      <div className="flex flex-col gap-1.5 text-xs font-bold text-ink-soft">
        Slug, fixed
        <span className="flex h-9 items-center font-mono text-[13px] font-normal text-ink-strong">
          {tenant.id}
        </span>
      </div>

      <fieldset className="flex min-w-0 flex-col gap-1.5">
        <legend className="pb-1.5 text-xs font-bold text-ink-soft">Spaces</legend>
        <div className="flex min-h-9 flex-wrap items-center gap-x-5 gap-y-2">
          {SPACE_ORDER.map((space) => (
            <Checkbox
              key={space}
              label={SPACE_LABEL[space]}
              checked={spaces.includes(space)}
              onChange={() => toggle(space)}
            />
          ))}
        </div>
      </fieldset>

      <div className="ml-auto flex items-center gap-2">
        <Link
          variant="plain"
          href={`/t/${tenant.id}/home`}
          className="mr-2 text-[13px] font-semibold text-accent-fg hover:underline"
        >
          Open tenant
        </Link>
        <Button type="submit" variant="primary" disabled={!trimmed || !dirty}>
          Save
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
