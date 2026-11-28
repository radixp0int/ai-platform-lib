import type { PerRow, RowAction } from './types'

/** Two buttons and the ⋯ fill the default `actionsWidth`. */
export const DEFAULT_SHOW_VISIBLE = 2

/** The default `actionsWidth`, for actions the table cannot measure. */
export const DEFAULT_ACTIONS_WIDTH = '128px'

/** A `PerRow` value for one row. */
export function perRow<V, T>(value: PerRow<V, T> | undefined, row: T): V | undefined {
  return typeof value === 'function' ? (value as (row: T) => V)(row) : value
}

/**
 * Which of a row's actions are buttons and which are in the ⋯ menu.
 *
 * Actions that are hidden for this row are gone before anything is counted, so
 * a row that loses one does not leave a gap among the buttons: the next one
 * moves up.
 */
export function splitRowActions<T>(
  actions: RowAction<T>[],
  row: T,
  showVisible: number,
): { buttons: RowAction<T>[]; menu: RowAction<T>[] } {
  const shown = actions.filter((action) => !perRow(action.hidden, row))
  const count = Number.isFinite(showVisible) ? Math.max(0, Math.floor(showVisible)) : 0
  return { buttons: shown.slice(0, count), menu: shown.slice(count) }
}

/** An `sm` icon button, and the gap between two of them. */
const BUTTON = 32
const GAP = 2
/** The cell's padding on both sides: `px-3`. */
const CELL = 24
/** Wide enough for the "Actions" header when there is only the ⋯. */
const LEAST = 88

/**
 * The width of an actions column that holds `showVisible` icon buttons and the
 * ⋯, so a host that passes a list never has to work one out. `undefined` when a
 * visible action is a text button, whose width is not known here: the default
 * applies, or the host passes `actionsWidth`.
 */
export function actionsColumnWidth<T>(
  actions: RowAction<T>[],
  showVisible: number,
): string | undefined {
  const count = Number.isFinite(showVisible) ? Math.max(0, Math.floor(showVisible)) : 0
  const buttons = actions.slice(0, count)
  if (buttons.some((action) => !action.icon)) return undefined
  const slots = buttons.length + (actions.length > count ? 1 : 0)
  if (slots === 0) return undefined
  return `${Math.max(LEAST, CELL + slots * (BUTTON + GAP) - GAP)}px`
}

/** Item heights in the menu (`min-h-11`, or taller with a hint), and its padding. */
const ITEM = 44
const ITEM_WITH_HINT = 52
const SEPARATOR = 10
const PADDING = 16

/**
 * About how tall the menu will be, to decide before it opens whether it fits
 * below the button. A little over is fine: it only flips a menu that had room.
 */
export function menuHeight<T>(items: RowAction<T>[], row: T): number {
  return items.reduce(
    (height, action, index) =>
      height +
      (perRow(action.hint, row) ? ITEM_WITH_HINT : ITEM) +
      (action.separatorBefore && index > 0 ? SEPARATOR : 0),
    PADDING,
  )
}
