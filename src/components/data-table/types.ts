import type { ReactNode } from 'react'
import type { PaginationProps } from '../pagination'
import type { Sort } from '../paging'
import type { RowTone } from './row-tone'

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

/** A value, or a function of the row for one that depends on it. */
export type PerRow<V, T> = V | ((row: T) => V)

/**
 * One row action, for `rowActions` given as a list. The first `showVisible`
 * show as buttons; the rest go into the built-in ⋯ menu, in order.
 */
export type RowAction<T> = {
  /** Stable key. */
  id: string
  /**
   * The action's name: the button's tooltip, its text when it has no icon, and
   * the menu item's label. A button's accessible name adds the row's, as
   * `labels.rowAction` writes it ("Edit for Bayshore Foods").
   */
  label: string
  /**
   * A glyph, about 15px. With one, a visible action is an icon button; without
   * one it is a small text button. In the menu it is an optional glyph before
   * the label.
   */
  icon?: ReactNode
  onSelect: (row: T) => void
  /** Leaves this action out for the rows it says so for: no "Switch" on the tenant you are in. */
  hidden?: PerRow<boolean, T>
  disabled?: PerRow<boolean, T>
  /** A quieter line under the label in the menu: why it is disabled, say. */
  hint?: PerRow<ReactNode, T>
  /** `danger` for an action that removes something. It colours the menu item and a text button. */
  tone?: 'default' | 'danger'
  /** A rule above this item when it is in the menu — before a destructive one. */
  separatorBefore?: boolean
}

export type DataTableLabels = {
  selectAll: string
  selectRow: (row: string) => string
  expandRow: (row: string) => string
  sortBy: (column: string) => string
  selected: (n: number) => string
  /** The bulk bar's count when there is a limit: "2 of 3 selected". */
  selectedOf: (n: number, max: number) => string
  /** The bulk bar when one row may be picked: "Crestview Bank selected". */
  selectedOne: (row: string) => string
  clearSelection: string
  /** A row action button's accessible name: "Edit for Bayshore Foods". */
  rowAction: (action: string, row: string) => string
  /** The ⋯ button's tooltip, and with the row's name its accessible name and its menu's. */
  moreActions: string
  emptyTitle: string
  emptyBody?: ReactNode
  errorTitle: string
  errorBody?: ReactNode
  retry: string
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
   * `sm` icon buttons; a lone `lg` one needs about `72px`. With `rowActions` as
   * a list of icon actions it is worked out from `showVisible`, and this
   * overrides it; give one when a visible action is a text button.
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
  /**
   * How many rows can be picked at once. Omit for no limit.
   *
   * `1` draws radio buttons: picking another row replaces the one before, and
   * clicking anywhere on the row picks it (unless rows expand). Above 1, a pick
   * past the limit drops the oldest one, so the latest `max` picks are kept.
   * Select-all is only offered when the whole page fits under the limit.
   */
  maxSelections?: number
  /**
   * A row's name for people: used in the checkbox's accessible name and in the
   * bulk bar when one row is picked. Defaults to the row's id.
   */
  rowLabel?: (row: T) => string
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

  /**
   * Trailing per-row controls. Clicks inside never toggle the row.
   *
   * Either a function that draws whatever you like for the row, or a list of
   * `RowAction`s, which the table draws for you: the first `showVisible` as
   * buttons and the rest in a ⋯ menu that opens, closes, flips upward near the
   * foot of the screen and works from the keyboard with nothing more from you.
   */
  rowActions?: ((row: T) => ReactNode) | RowAction<T>[]
  /**
   * With `rowActions` as a list: how many show as buttons before the rest move
   * into the ⋯ menu. Defaults to `2`, which with the ⋯ is about as wide as the
   * default `actionsWidth`. Enough to show them all leaves no ⋯; `0` leaves only the ⋯.
   */
  showVisible?: number
  /**
   * When the row actions show. `hover` (the default) keeps a long list quiet:
   * they appear on hover, focus, selection or an open row, and always on a
   * touch screen. `always` draws them on every row, for a list whose action is
   * the point of the row — a "Resend invite" button, say.
   */
  rowActionsVisible?: 'hover' | 'always'
  /**
   * Whether the row-actions column's header shows its name. The header is named
   * "Actions" and stays a column header either way. `hidden` (the default)
   * keeps that name for screen readers only, so the column looks unlabelled;
   * `visible` draws it in the other headers' small caps, right-aligned so it
   * ends over the last button.
   */
  actionsHeader?: 'visible' | 'hidden'

  /**
   * A row's state, drawn as a 3px edge down the row's full height on the left:
   * `'error'` for a failed step, `'warning'` for a row that needs someone,
   * `'info'` or `'success'`. The same tone names `Alert` takes. Return
   * `undefined` for a row with nothing to say, and it renders as it always has.
   *
   * The edge is an inset shadow, so the cells do not move. It sits alongside
   * hover, focus and selection: a selected warning row keeps its edge. An open
   * row's rail takes the tone too, down through its expanded detail.
   *
   * Colour is reinforcement, not the message: say the state in a cell as well
   * ("Failed at Approve", "Waiting on you").
   */
  rowTone?: (row: T) => RowTone | undefined

  /** Replaces the whole empty state. */
  empty?: ReactNode
  /**
   * What to do when there is nothing yet: an "Add tenant" button, say. Shown
   * under the empty state's title and body.
   */
  emptyAction?: ReactNode
  /**
   * The rows failed to load. `true` shows the default message; a node replaces
   * its body. An error is never drawn as "nothing to show".
   */
  error?: boolean | ReactNode
  /** Given, the error state offers Try again. */
  onRetry?: () => void
  /**
   * The least height of the rows area, so empty, error, loading and a short page
   * all keep the same frame. Defaults to `22rem`, about seven rows. `none` turns
   * it off.
   */
  minBodyHeight?: string
  /** Above the header — an omnibox, a filter bar. */
  toolbar?: ReactNode
  /**
   * Pages and rows per page, under the rows. The same props `Pagination` takes,
   * except `totalPages` (worked out from `totalElements` and `size` when left
   * out) and `busy` (follows `loading`). Leave out `onSizeChange` to hide the
   * rows-per-page control. Hidden while there are no rows at all.
   */
  pagination?: DataTablePagination
  /** Anything else below the rows, after the pagination. */
  footer?: ReactNode

  labels?: Partial<DataTableLabels>
  className?: string
}

/** `Pagination`'s props, as `DataTable` takes them. */
export type DataTablePagination = Omit<PaginationProps, 'totalPages' | 'busy'> & {
  totalPages?: number
}
