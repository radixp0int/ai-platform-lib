import { withDefaults } from '../../lib/withDefaults'
import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { Checkbox } from '../../primitives/checkbox'
import { ArrowDownIcon, ArrowUpIcon } from '../../primitives/icons'
import { BulkBar } from './bulk-bar'
import { directionFor, isColumnSortable, toggleSort } from './sorting'
import { EmptyRow, SkeletonRows } from './states'
import type { Column, DataTableLabels, DataTableProps } from './types'

const DEFAULT_LABELS: DataTableLabels = {
  selectAll: 'Select all rows on this page',
  selectRow: (row) => `Select ${row}`,
  expandRow: (row) => `Show details for ${row}`,
  sortBy: (column) => `Sort by ${column}`,
  selected: (n) => `${n.toLocaleString()} selected`,
  clearSelection: 'Clear',
  emptyTitle: 'Nothing to show',
}

const alignClass = (align: Column<unknown>['align']) =>
  align === 'end' ? 'text-right' : 'text-left'

/**
 * Written out in full rather than built from a template literal — Tailwind
 * scans source text for class names, and `hidden ${bp}:table-cell` produces
 * nothing at all in the stylesheet.
 */
const HIDE_BELOW: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
}

const hideClass = (c: { hideBelow?: Column<unknown>['hideBelow'] }) =>
  c.hideBelow ? HIDE_BELOW[c.hideBelow] : ''

/**
 * A row's click target is the row, but the row is not the control.
 *
 * `<tr>` carries an `onClick` for the mouse, and the first cell carries a real
 * `<button>` for everything else — so Tab reaches the toggle and a screen
 * reader announces it with `aria-expanded`. There is no caret: an open row says
 * so with a rail down its edge and a filled `Avatar`, and a closed one
 * underlines whatever the cell marks `data-row-title` on hover and focus. The
 * row click is convenience layered on top, never the only path, which is what
 * keeps this from being the `onClick`-on-a-div pattern it superficially
 * resembles.
 *
 * Clicks that begin inside another control — the checkbox, a row action, a
 * link — must not also toggle the row, hence the `closest` guard.
 */
const cameFromAnotherControl = (target: EventTarget | null) =>
  target instanceof Element && target.closest('button, a, input, select, textarea, label') !== null

/**
 * Which way a sortable column is sorted, as a pair of arrows.
 *
 * The arrow for the active direction is dark and the other is left grey, so the
 * column reads as "sorted this way, and could go that way" without a label. An
 * unsorted column shows the pair only while it is hovered or focused.
 */
function SortArrows({ dir }: { dir: 'asc' | 'desc' | null }) {
  const lit = 'text-ink-strong'
  const dim = 'text-ink-soft/45'
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex shrink-0 items-center',
        dir ? '' : 'opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ArrowUpIcon width={12} height={12} strokeWidth={2.2} className={dir === 'asc' ? lit : dim} />
      <ArrowDownIcon
        width={13}
        height={13}
        strokeWidth={2.2}
        className={`-ml-1 ${dir === 'desc' ? lit : dim}`}
      />
    </span>
  )
}

/**
 * The table.
 *
 * Controlled and inert, like everything else in the library: it fetches
 * nothing, sorts nothing and remembers nothing. `rows` are already the page,
 * `sort` is already applied, selection and expansion are the host's. That is
 * what lets one fixture and one live endpoint satisfy the same props.
 *
 * A real `<table>` rather than a grid of divs. Row and column relationships
 * are what a screen reader navigates a table by, and `role="…"` sprinkled on
 * divs reproduces them only if every role is right — which is a worse bet than
 * the element that has them for free.
 */
export function DataTable<T>({
  columns,
  rows,
  rowId,
  caption,
  minWidth = '680px',
  actionsWidth = '128px',
  loading = false,
  skeletonRows = 5,
  sort = [],
  sortable = true,
  onSortChange,
  selectedIds,
  onSelectionChange,
  bulkActions,
  renderExpanded,
  expandedIds = [],
  onExpandedChange,
  rowActions,
  empty,
  toolbar,
  footer,
  labels,
  className = '',
}: DataTableProps<T>) {
  const t = withDefaults(DEFAULT_LABELS, labels)
  const baseId = useId()

  const selectable = Boolean(onSelectionChange)
  const expandable = Boolean(renderExpanded)
  const selected = selectedIds ?? []

  const pageIds = rows.map(rowId)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const someSelected = selected.length > 0 && !allSelected

  const extraCols = (selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const totalCols = columns.length + extraCols

  // A row that spans the table must span the columns that are showing. A
  // `colSpan` of `totalCols` while `hideBelow` has hidden some of them makes a
  // fixed-layout table invent phantom columns to fit it, and the header band
  // stops short of the frame. So the span is counted from the header.
  const tableRef = useRef<HTMLTableElement>(null)
  const [visibleCols, setVisibleCols] = useState(totalCols)
  useEffect(() => {
    const table = tableRef.current
    const headerRow = table?.tHead?.rows[0]
    if (!table || !headerRow) return
    const count = () => {
      const shown = [...headerRow.cells].filter((c) => c.offsetParent !== null).length
      setVisibleCols(shown || totalCols)
    }
    count()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(count)
    observer.observe(table)
    return () => observer.disconnect()
  }, [totalCols])

  const toggleAll = () =>
    onSelectionChange?.(
      allSelected
        ? selected.filter((id) => !pageIds.includes(id))
        : [...new Set([...selected, ...pageIds])],
    )

  const toggleRow = (id: string) =>
    onSelectionChange?.(
      selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id],
    )

  const toggleExpanded = (id: string) =>
    onExpandedChange?.(
      expandedIds.includes(id) ? expandedIds.filter((v) => v !== id) : [...expandedIds, id],
    )

  return (
    <div className={['flex min-w-0 flex-col gap-3', className].filter(Boolean).join(' ')}>
      {toolbar}

      {selectable && selected.length > 0 && (
        <BulkBar
          countLabel={t.selected(selected.length)}
          clearLabel={t.clearSelection}
          onClear={() => onSelectionChange?.([])}
        >
          {bulkActions}
        </BulkBar>
      )}

      <div className="min-w-0 overflow-hidden rounded-surface border border-line bg-panel-solid">
        {/* `relative`, so visually hidden text in a cell (the actions header) is placed against
            this box and scrolls with it. Without it, that text is placed against the page, and a
            table wider than the screen makes the whole page scroll sideways. */}
        <div className="relative min-w-0 overflow-x-auto">
          <table
            ref={tableRef}
            className="w-full table-fixed border-collapse text-left"
            style={minWidth === 'none' ? undefined : { minWidth }}
          >
            <caption className="sr-only">{caption}</caption>

            <thead>
              <tr className="border-b border-line bg-canvas">
                {selectable && (
                  <th scope="col" style={{ width: '44px' }} className="px-4 py-0">
                    <Checkbox
                      aria-label={t.selectAll}
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                    />
                  </th>
                )}

                {columns.map((c) => {
                  // One question, asked in one place: a column that cannot sort shows no
                  // button, no arrows and no aria-sort, even if the host's sort names it.
                  const canSort = isColumnSortable(c, sortable && Boolean(onSortChange))
                  const dir = canSort ? directionFor(c.sortKey, sort) : null
                  const head = (
                    <span className="min-w-0 truncate text-[10.5px] font-extrabold tracking-[0.07em] uppercase">
                      {c.header}
                    </span>
                  )
                  return (
                    <th
                      key={c.id}
                      scope="col"
                      style={c.width ? { width: c.width } : undefined}
                      aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                      className={[
                        'h-11 truncate px-4 align-middle whitespace-nowrap text-ink-soft',
                        alignClass(c.align),
                        hideClass(c),
                        c.headerClassName ?? '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={() => onSortChange?.(toggleSort(c.sortKey!, sort))}
                          title={t.sortBy(String(c.header))}
                          className={[
                            'group inline-flex max-w-full items-center gap-1 transition hover:text-ink-strong',
                            dir ? 'text-ink-strong' : '',
                            c.align === 'end' ? 'flex-row-reverse' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {head}
                          <SortArrows dir={dir} />
                        </button>
                      ) : (
                        head
                      )}
                    </th>
                  )
                })}

                {rowActions && (
                  <th scope="col" style={{ width: actionsWidth }} className="px-4">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <SkeletonRows
                  rows={skeletonRows}
                  columns={totalCols}
                  cellClasses={[
                    ...(selectable ? [''] : []),
                    ...columns.map(hideClass),
                    ...(rowActions ? [''] : []),
                  ]}
                />
              )}

              {!loading &&
                rows.length === 0 &&
                (empty ? (
                  <tr>
                    <td colSpan={visibleCols} className="px-6 py-14">
                      {empty}
                    </td>
                  </tr>
                ) : (
                  <EmptyRow colSpan={visibleCols} title={t.emptyTitle} body={t.emptyBody} />
                ))}

              {!loading &&
                rows.map((row) => {
                  const id = rowId(row)
                  const isOpen = expandedIds.includes(id)
                  const isSelected = selected.includes(id)
                  const panelId = `${baseId}-panel-${id}`
                  const [first, ...rest] = columns

                  return (
                    <Fragment key={id}>
                      <tr
                        data-open={isOpen}
                        data-selected={isSelected}
                        onClick={
                          expandable
                            ? (e) => {
                                if (!cameFromAnotherControl(e.target)) toggleExpanded(id)
                              }
                            : undefined
                        }
                        className={[
                          'group/row border-b border-line/70 transition',
                          isOpen
                            ? 'shadow-[inset_3px_0_0_var(--brand-solid)] [&_[data-avatar]]:bg-brand-solid [&_[data-avatar]]:text-on-brand-solid'
                            : isSelected
                              ? 'bg-chip/50'
                              : 'hover:bg-tint/4',
                          !isOpen &&
                            'hover:[&_[data-row-title]]:underline has-[button:focus-visible]:[&_[data-row-title]]:underline [&_[data-row-title]]:decoration-ink-soft/40 [&_[data-row-title]]:decoration-[1.5px] [&_[data-row-title]]:underline-offset-4',
                          expandable ? 'cursor-pointer' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {selectable && (
                          <td className="px-4">
                            <Checkbox
                              aria-label={t.selectRow(id)}
                              checked={isSelected}
                              onChange={() => toggleRow(id)}
                            />
                          </td>
                        )}

                        <td
                          className={[
                            'h-13 overflow-hidden px-4 text-[13.5px] text-ink',
                            alignClass(first.align),
                            hideClass(first),
                            first.cellClassName ?? '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {expandable ? (
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={panelId}
                              onClick={() => toggleExpanded(id)}
                              className="w-full text-left"
                            >
                              {first.cell(row)}
                            </button>
                          ) : (
                            first.cell(row)
                          )}
                        </td>

                        {rest.map((c) => (
                          <td
                            key={c.id}
                            className={[
                              'h-13 overflow-hidden px-4 text-[13.5px] text-ink',
                              alignClass(c.align),
                              hideClass(c),
                              c.cellClassName ?? '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {c.cell(row)}
                          </td>
                        ))}

                        {rowActions && (
                          <td className="px-3">
                            <div className="flex items-center justify-end gap-0.5 opacity-0 transition group-hover/row:opacity-100 group-data-[open=true]/row:opacity-100 group-data-[selected=true]/row:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                              {rowActions(row)}
                            </div>
                          </td>
                        )}
                      </tr>

                      {expandable && isOpen && (
                        <tr className="border-b border-line bg-canvas shadow-[inset_3px_0_0_var(--brand-solid)]">
                          <td
                            id={panelId}
                            colSpan={visibleCols}
                            className="px-4 py-4"
                            style={selectable ? { paddingLeft: 'calc(44px + 1rem)' } : undefined}
                          >
                            {renderExpanded?.(row)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
            </tbody>
          </table>
        </div>

        {footer}
      </div>
    </div>
  )
}
