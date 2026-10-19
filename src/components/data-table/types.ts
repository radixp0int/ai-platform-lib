import type { ReactNode } from 'react'
import type { Sort } from '../paging'

export type ColumnAlign = 'start' | 'end'

/** How a sortable column's values compare. See `Column.sortType`. */
export type SortType = 'text' | 'number' | 'date'

export type Column<T> = {
  /** Stable key. Also the React key for the cell. */
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  /**
   * A CSS width, `'28%'` or `'140px'`. The table is `table-fixed`, so these
   * are honoured rather than negotiated against content: one long email
   * cannot shove every other column out of shape. Omit on the column that
   * should absorb the remainder.
   */
  width?: string
  /**
   * Drops this column below the given breakpoint instead of letting every
   * column get narrower. Order columns by priority and hide from the right:
   * a table that sheds `Email` at `md` stays readable far longer than one
   * that keeps all six columns and squeezes them.
   */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Makes the header a sort button. The value is what goes on the wire
   * (`sort=<sortKey>,asc`), which is often the API's field name rather than
   * this column's `id`.
   */
  sortKey?: string
  /**
   * Turns sorting off for this column while keeping its `sortKey`. Defaults to
   * `true`. Use it for a field the backend cannot order by: its header stops
   * being a button, it never reports a sort, and `toSortParam` leaves it out of
   * the query, so the service call cannot fail on a field it does not support.
   * A column with no `sortKey` is unsortable too; this is for columns whose key
   * comes from a shared config and should stay put.
   */
  sortable?: boolean
  /**
   * How values compare when `sortRows` orders rows in the browser: `text`
   * (the default, case-blind, "Suite 2" before "Suite 10"), `number`, or
   * `date`. A server decides for itself; this only matters for client-side
   * sorting.
   */
  sortType?: SortType
  /**
   * Reads the value `sortRows` compares from a row. Defaults to the row's own
   * `sortKey` property. Give one when the column shows a derived value — seats
   * in use, say, out of a `[used, total]` pair — or the key is not a property.
   */
  sortValue?: (row: T) => unknown
  align?: ColumnAlign
  /** Header-only class — for `sr-only` on an actions column, say. */
  headerClassName?: string
  cellClassName?: string
}

export type DataTableLabels = {
  selectAll: string
  selectRow: (row: string) => string
  expandRow: (row: string) => string
  sortBy: (column: string) => string
  selected: (n: number) => string
  clearSelection: string
  emptyTitle: string
  emptyBody?: ReactNode
}

export type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  /** Stable identity per row. Selection and expansion are keyed on it. */
  rowId: (row: T) => string
  /** Accessible name for the table. Rendered as a visually hidden `<caption>`. */
  caption: string

  /**
   * The width below which the table scrolls sideways instead of compressing.
   *
   * Without a floor, `table-fixed` percentage columns keep shrinking until
   * cells overlap and names truncate to a single letter — the table does not
   * break loudly, it just becomes wrong. With one, the columns keep their
   * proportions and the container scrolls. Pass `'none'` to opt out, or widen
   * it for tables with more columns.
   */
  minWidth?: string

  /**
   * Width of the row-actions column. It is sized rather than left to share
   * what the other columns leave over: unsized, it takes half of the slack and
   * squeezes whichever data column was also unsized. Default fits three
   * `sm` icon buttons; a lone `lg` one needs about `72px`.
   */
  actionsWidth?: string

  /** Skeleton rows instead of content. Keeps the header and the frame. */
  loading?: boolean
  /** How many skeleton rows to draw. Match your page size. */
  skeletonRows?: number

  /** Single-column sort, in the `paging` model's shape. */
  sort?: Sort[]
  onSortChange?: (sort: Sort[]) => void
  /**
   * Turns sorting off for the whole table: no header is a button and
   * `onSortChange` is never called. Defaults to `true`. For a list endpoint
   * that takes no `sort` parameter at all.
   */
  sortable?: boolean

  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  /** Rendered in the bulk bar once something is selected. */
  bulkActions?: ReactNode

  /**
   * Supplying this makes rows expandable: clicking a row (or its name button)
   * opens this underneath. Omit and rows are inert.
   *
   * There is no caret. An open row shows a rail and a filled `Avatar`; a closed
   * one underlines whatever its first cell marks `data-row-title`.
   */
  renderExpanded?: (row: T) => ReactNode
  expandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void

  /** Trailing per-row controls. Clicks inside never toggle the row. */
  rowActions?: (row: T) => ReactNode

  /** Replaces the whole empty state. */
  empty?: ReactNode
  /** Above the header — an omnibox, a filter bar. */
  toolbar?: ReactNode
  /** Below the rows — `Pagination`, typically. */
  footer?: ReactNode

  labels?: Partial<DataTableLabels>
  className?: string
}
