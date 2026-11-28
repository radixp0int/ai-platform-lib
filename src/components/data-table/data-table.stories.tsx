import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { userEvent, within } from 'storybook/test'
import { STATUS_LABEL, STATUS_TONE, TENANTS, fmtDate, type Tenant } from '../../fixtures/tenants'
import { Avatar } from '../../primitives/avatar'
import { Button } from '../../primitives/button'
import { IconButton } from '../../primitives/icon-button'
import { CopyIcon, DotsIcon, EyeIcon, PencilIcon, TrashIcon } from '../../primitives/icons'
import { Pill } from '../../primitives/pill'
import type { Sort } from '../paging'
import { DataTable } from './data-table'
import { sortRows as sortByType, toSortParam } from './sorting'
import type { Column, RowAction } from './types'

const COLUMNS: Column<Tenant>[] = [
  {
    id: 'name',
    header: 'Name',
    sortKey: 'name',
    width: '23%',
    cell: (t) => (
      <span className="flex items-center gap-2.5">
        <Avatar variant="text" text={t.initials} size={28} tone="soft" aria-hidden />
        <span data-row-title className="truncate font-bold text-ink-strong">
          {t.name}
        </span>
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortKey: 'status',
    width: '12%',
    cell: (t) => (
      <Pill tone={STATUS_TONE[t.status]} variant="outline" size="sm">
        {STATUS_LABEL[t.status]}
      </Pill>
    ),
  },
  {
    id: 'contact',
    header: 'Primary contact',
    sortKey: 'contact',
    width: '17%',
    hideBelow: 'lg',
    cell: (t) => <span className="truncate">{t.contact}</span>,
  },
  {
    id: 'email',
    header: 'Email',
    sortKey: 'email',
    width: '20%',
    hideBelow: 'xl',
    cell: (t) => <span className="block truncate text-ink-soft">{t.email}</span>,
  },
  {
    id: 'seats',
    header: 'Seats',
    align: 'end',
    width: '9%',
    hideBelow: 'md',
    cell: (t) => (
      <span className="whitespace-nowrap tabular-nums">
        {t.seats[0]} / {t.seats[1]}
      </span>
    ),
  },
  {
    id: 'created',
    header: 'Created',
    sortKey: 'created',
    width: '13%',
    hideBelow: 'md',
    cell: (t) => <span className="whitespace-nowrap text-ink-soft">{fmtDate(t.created)}</span>,
  },
]

/** Edit, Delete and More: three icon buttons, the way a list's own row actions look. */
const iconActions = (t: Tenant) => (
  <>
    <IconButton size="sm" shape="rounded" aria-label={`Edit ${t.name}`} title="Edit">
      <PencilIcon width={14} height={14} />
    </IconButton>
    <IconButton size="sm" shape="rounded" aria-label={`Delete ${t.name}`} title="Delete">
      <TrashIcon width={14} height={14} />
    </IconButton>
    <IconButton size="sm" shape="rounded" aria-label={`More actions for ${t.name}`} title="More">
      <DotsIcon width={14} height={14} />
    </IconButton>
  </>
)

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-extrabold tracking-[0.06em] text-ink-soft uppercase">
        {label}
      </span>
      <span className="text-[13.5px] text-ink">{children}</span>
    </div>
  )
}

const meta = {
  title: 'Components/DataTable',
  component: DataTable<Tenant>,
  tags: ['autodocs'],
  args: {
    caption: 'Tenants',
    columns: COLUMNS,
    rows: TENANTS.slice(0, 6),
    rowId: (t: Tenant) => t.id,
  },
  argTypes: {
    columns: { control: false },
    rows: { control: false },
    toolbar: { control: false },
    footer: { control: false },
    empty: { control: false },
    bulkActions: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The table on its own: rows, sorting, selection, expandable rows, pagination, and the loading and empty states. For a list page with search, filters and export, use **DataGrid**, which is built on it. The table fetches nothing and remembers nothing. Sort, selection, expansion and paging are all props, so a client-side fixture and a paged API drive it identically. `table-fixed` columns honour their `width`; `hideBelow` sheds low-priority columns before the rest get squeezed; `minWidth` makes it scroll rather than overlap.',
      },
    },
  },
} satisfies Meta<typeof DataTable<Tenant>>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** Tick a row and the bulk bar replaces the header. */
export const Selection: Story = {
  render: function SelectionStory(args) {
    const [selected, setSelected] = useState<string[]>([TENANTS[1].id, TENANTS[3].id])
    return (
      <DataTable
        {...args}
        selectedIds={selected}
        onSelectionChange={setSelected}
        bulkActions={
          <>
            <Button variant="inverse" size="sm">
              Change status
            </Button>
            <Button variant="inverse" size="sm">
              Assign owner
            </Button>
          </>
        }
      />
    )
  },
}

/**
 * Supplying `renderExpanded` makes rows clickable; row actions never toggle.
 * There is no caret: the open row has a rail and a filled avatar, and a closed
 * one underlines its name on hover. Actions show on hover, focus, and open rows.
 */
export const ExpandableRows: Story = {
  render: function ExpandStory(args) {
    const [expanded, setExpanded] = useState<string[]>([TENANTS[0].id])
    return (
      <DataTable
        {...args}
        expandedIds={expanded}
        onExpandedChange={setExpanded}
        renderExpanded={(t) => (
          <div className="grid grid-cols-4 gap-x-6 gap-y-4 max-md:grid-cols-2">
            <Detail label="Tenant ID">
              <span className="font-bold tabular-nums">{t.id}</span>
            </Detail>
            <Detail label="Plan tier">{t.tier}</Detail>
            <Detail label="Region">{t.region}</Detail>
            <Detail label="Renewal">{fmtDate(t.renewal)}</Detail>
          </div>
        )}
        rowActions={iconActions}
      />
    )
  },
}

/**
 * `rowActionsVisible="always"`: the actions are on every row, not only on hover.
 * For a list whose action is the point of the row.
 */
export const RowActionsAlways: Story = {
  args: {
    rowActionsVisible: 'always',
    actionsWidth: '120px',
    rowActions: (t) => (
      <Button size="sm" variant={t.status === 'pending' ? 'primary' : 'ghost'}>
        {t.status === 'pending' ? 'Resend invite' : 'Open'}
      </Button>
    ),
  },
}

/**
 * `actionsHeader="visible"` names the actions column in the header: small caps like the others,
 * right-aligned so it ends over the last button. The default, `hidden`, keeps the name for screen
 * readers only. Either way the header is "Actions" to a screen reader.
 */
export const ActionsHeaderVisible: Story = {
  args: {
    rowActions: iconActions,
    rowActionsVisible: 'always',
    actionsHeader: 'visible',
    actionsWidth: '120px',
  },
}

export const ActionsHeaderVisibleDark: Story = {
  ...ActionsHeaderVisible,
  globals: { mode: 'dark' },
}

/** The default: the same column with its header's name for screen readers only. */
export const ActionsHeaderHidden: Story = {
  args: { ...ActionsHeaderVisible.args, actionsHeader: 'hidden' },
}

export const ActionsHeaderHiddenDark: Story = {
  ...ActionsHeaderHidden,
  globals: { mode: 'dark' },
}

/**
 * `rowActions` as a list: the table draws the first `showVisible` as buttons and puts the rest in a
 * ⋯ menu that is ready to use. `hidden`, `disabled` and `hint` can depend on the row. Here "Resend
 * invite" is only for a pending tenant and "Delete" waits until a tenant is suspended.
 */
const rowActionList = (say: (line: string) => void): RowAction<Tenant>[] => [
  {
    id: 'view',
    label: 'View details',
    icon: <EyeIcon width={15} height={15} />,
    onSelect: (t) => say(`Viewing ${t.name}`),
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: <PencilIcon width={15} height={15} />,
    onSelect: (t) => say(`Editing ${t.name}`),
  },
  {
    id: 'copy',
    label: 'Copy tenant ID',
    icon: <CopyIcon width={15} height={15} />,
    onSelect: (t) => say(`Copied ${t.id}`),
  },
  {
    id: 'resend',
    label: 'Resend invite',
    hidden: (t) => t.status !== 'pending',
    onSelect: (t) => say(`Invite sent to ${t.contact}`),
  },
  {
    id: 'delete',
    label: 'Delete tenant…',
    icon: <TrashIcon width={15} height={15} />,
    tone: 'danger',
    separatorBefore: true,
    disabled: (t) => t.status !== 'suspended',
    hint: (t) => (t.status !== 'suspended' ? 'Suspend it first' : undefined),
    onSelect: (t) => say(`Deleting ${t.name}`),
  },
]

/** A row's name for people, so a button reads "Edit for Crestview Bank", not "Edit for tnt_…". */
const rowLabel = (t: Tenant) => t.name

/** The same list, as a story: what was last chosen is said under the table. */
function ActionListTable({
  only,
  ...props
}: React.ComponentProps<typeof DataTable<Tenant>> & { only?: number }) {
  const [said, setSaid] = useState('Nothing chosen yet')
  return (
    <div className="flex flex-col gap-3">
      <DataTable {...props} rowActions={rowActionList(setSaid).slice(0, only)} />
      <p role="status" className="text-[13px] text-ink-soft">
        {said}
      </p>
    </div>
  )
}

const openFirstMenu: Story['play'] = async ({ canvasElement }) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', {
      name: 'More actions for Crestview Bank',
    }),
  )
}

/**
 * `rowActions` as a list: the first two actions are buttons and the rest are in the ⋯ menu, which
 * opens, closes, flips upward near the foot of the screen and works from the keyboard. The
 * column's width follows from `showVisible`.
 */
export const RowActionList: Story = {
  args: { actionsHeader: 'visible', rowActionsVisible: 'always', rowLabel },
  render: (args) => <ActionListTable {...args} />,
}

/**
 * The default `rowActionsVisible="hover"`: the buttons and the ⋯ show on hover and focus, and the
 * ⋯ stays while its menu is open, even with the pointer over the menu.
 */
export const RowActionListOnHover: Story = {
  args: { rowLabel },
  render: (args) => <ActionListTable {...args} />,
}

/** `showVisible={3}`: three buttons and the ⋯, and the column is wider to hold them. */
export const ShowVisibleThree: Story = {
  ...RowActionList,
  args: { ...RowActionList.args, showVisible: 3 },
}

/** `showVisible={0}`: only the ⋯, for a table where the actions are secondary. */
export const ShowVisibleNone: Story = {
  ...RowActionList,
  args: { ...RowActionList.args, showVisible: 0 },
}

/** Three actions and `showVisible={3}`: room for all of them, so there is no ⋯. */
export const ShowVisibleAll: Story = {
  args: { ...RowActionList.args, showVisible: 3 },
  render: (args) => <ActionListTable {...args} only={3} />,
}

/**
 * An action without an icon is a small text button, and a glyph in the menu is optional too. A
 * text button's width is not known, so give `actionsWidth` for one.
 */
export const TextButtons: Story = {
  args: { actionsHeader: 'visible', rowActionsVisible: 'always', actionsWidth: '176px', rowLabel },
  render: (args) => (
    <DataTable
      {...args}
      showVisible={1}
      rowActions={[
        { id: 'open', label: 'Open', onSelect: () => {} },
        { id: 'rename', label: 'Rename', onSelect: () => {} },
        { id: 'archive', label: 'Archive', onSelect: () => {} },
        {
          id: 'delete',
          label: 'Delete',
          tone: 'danger',
          separatorBefore: true,
          onSelect: () => {},
        },
      ]}
    />
  ),
}

/** The ⋯ menu, open: Copy, Delete (disabled, with its hint), and a rule between. */
export const RowActionMenuOpen: Story = { ...RowActionList, play: openFirstMenu }

export const RowActionMenuOpenDark: Story = {
  ...RowActionList,
  globals: { mode: 'dark' },
  play: openFirstMenu,
}

/** Skeleton rows keep the header and frame; match `skeletonRows` to the page size. */
export const Loading: Story = { args: { loading: true, skeletonRows: 6 } }

/** Nothing yet: it says so at full height, and offers the next step with `emptyAction`. */
export const Empty: Story = {
  args: {
    rows: [],
    labels: {
      emptyTitle: 'No tenants yet',
      emptyBody: 'Tenants you add show up here, with their contacts and seats.',
    },
    emptyAction: (
      <Button variant="primary" size="sm">
        Add tenant
      </Button>
    ),
  },
}

/** Paged client-side with `pagination`: pages, rows per page, and the range it shows. */
export const Paged: Story = {
  render: function PagedStory(args) {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(5)
    return (
      <DataTable
        {...args}
        rows={TENANTS.slice((page - 1) * size, page * size)}
        pagination={{
          page,
          size,
          totalElements: TENANTS.length,
          onPageChange: setPage,
          onSizeChange: (n) => {
            setSize(n)
            setPage(1)
          },
          sizeOptions: [5, 10, 25],
        }}
      />
    )
  },
}

/**
 * Rows to sort by type. One has no created date, to show that a row with nothing to compare goes
 * last whichever way the column sorts, and one starts with a lowercase letter, to show that text
 * ignores case.
 */
const SORT_ROWS: Tenant[] = [
  ...TENANTS.slice(0, 7),
  { ...TENANTS[0], id: 'tnt_gap', name: 'apex Credit Union', initials: 'AC', created: '' },
]

/**
 * Typed columns. Seats compares as numbers, Created as dates, Name as text. Email has a `sortKey`
 * but `sortable: false`, the way a field the backend cannot order by looks. Status has no key.
 */
const SORT_COLUMNS: Column<Tenant>[] = [
  {
    id: 'name',
    header: 'Name',
    sortKey: 'name',
    width: '26%',
    cell: (t) => (
      <span className="flex items-center gap-2.5">
        <Avatar variant="text" text={t.initials} size={28} tone="soft" aria-hidden />
        <span data-row-title className="truncate font-bold text-ink-strong">
          {t.name}
        </span>
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: '14%',
    cell: (t) => (
      <Pill tone={STATUS_TONE[t.status]} variant="outline" size="sm">
        {STATUS_LABEL[t.status]}
      </Pill>
    ),
  },
  {
    id: 'email',
    header: 'Email',
    sortKey: 'email',
    sortable: false,
    width: '24%',
    cell: (t) => <span className="block truncate text-ink-soft">{t.email}</span>,
  },
  {
    id: 'seats',
    header: 'Seats in use',
    sortKey: 'seats',
    sortType: 'number',
    sortValue: (t) => t.seats[0],
    align: 'end',
    width: '16%',
    cell: (t) => (
      <span className="whitespace-nowrap tabular-nums">
        {t.seats[0]} / {t.seats[1]}
      </span>
    ),
  },
  {
    id: 'created',
    header: 'Created',
    sortKey: 'created',
    sortType: 'date',
    width: '20%',
    cell: (t) => (
      <span className="whitespace-nowrap text-ink-soft">
        {t.created ? fmtDate(t.created) : '–'}
      </span>
    ),
  },
]

function SortingHost() {
  const [sort, setSort] = useState<Sort[]>([])
  const rows = useMemo(() => sortByType(SORT_ROWS, sort, SORT_COLUMNS), [sort])
  // What a paged table would send. Columns that cannot sort never reach it.
  const param = toSortParam(sort, SORT_COLUMNS)
  return (
    <div className="flex flex-col gap-3">
      <DataTable
        caption="Tenants"
        columns={SORT_COLUMNS}
        rows={rows}
        rowId={(t) => t.id}
        sort={sort}
        onSortChange={setSort}
      />
      <p className="text-[12.5px] text-ink-soft">
        Request:{' '}
        <output aria-label="Sort request" className="rounded bg-code px-1 py-0.5 text-[11.5px]">
          {param ? `?sort=${param}` : '(no sort parameter)'}
        </output>
      </p>
    </div>
  )
}

/**
 * Sorting by type. Seats sorts as numbers (88 before 412, not after), Created as dates, Name as
 * text without regard to case. A row with nothing to compare goes last either way. The line below
 * is what a paged table would send: `toSortParam` writes it from the same columns, and Email, which
 * has a `sortKey` but `sortable: false`, can never appear in it.
 */
export const Sorting: Story = {
  render: () => <SortingHost />,
}
