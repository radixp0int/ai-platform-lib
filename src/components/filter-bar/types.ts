import type { ReactNode } from 'react'
import type { FilterField } from '../filter-panel'

/**
 * How much of the filtering is on show.
 *
 * `simple` is the Filters button and its panel, plus an omnibox that suggests
 * dates and values as you type. `advanced` keeps all of that and adds quick
 * picks to the omnibox: focus it and choose a preset for any date, or a value
 * for any filter, in one click. Same filters either way, so switching loses
 * nothing.
 */
export type FilterStyle = 'simple' | 'advanced'

/** One typed condition. `field` is null for a search across every field. */
export type FilterTerm = {
  id: string
  field: string | null
  value: string
}

/** A field the omnibox can narrow a search to. */
export type FilterTermField = {
  key: string
  label: string
  /** A short glyph for the suggestion — `Aa`, `@`. */
  glyph: string
  /** The query parameter this narrowing produces. Shown with the suggestion. */
  param: string
}

export type FilterBarLabels = {
  filters: string
  searchEvery: string
  narrowToField: string
  dates: string
  values: string
  /** Placeholder while no filter is set and the style is `simple`. */
  placeholderSimple: string
  /** Placeholder while no filter is set and the style is `advanced`. */
  placeholderAdvanced: string
  custom: string
  /** Label for the quick pick of a yes-or-no filter, which has no label column of its own. */
  only: string
  switchToAdvanced: string
  switchToSimple: string
  /** The line under the quick picks, left of the style switch. */
  quickHint: string
  searchFor: string
  contains: (field: string) => string
  removeFilter: (name: string) => string
}

export type FilterBarProps = {
  /** The omnibox's accessible name. Nothing draws it. */
  label: string
  /**
   * Everything that can be filtered, as data — the same list `FilterPanel`
   * takes. The panel draws it, and so do the chips in the omnibox, the
   * suggestions you get while typing and the quick picks, so the four can never
   * disagree about what a filter is or what it is set to.
   */
  fields: FilterField[]
  /** Typed conditions: searches and field narrowings. They show as chips too. */
  terms: FilterTerm[]
  onTermsChange: (terms: FilterTerm[]) => void
  /** What "Narrow to a field" offers. Empty hides that group. */
  termFields?: FilterTermField[]
  filterStyle?: FilterStyle
  /** Given, the panel and the quick picks carry a link to the other style. */
  onFilterStyleChange?: (style: FilterStyle) => void
  /** Clears the panel's fields. Wired to the panel's Reset. */
  onReset?: () => void
  /**
   * Draws the header: the Filters button and the omnibox. Defaults to `true`.
   * Off, there is no search box and no way to open or pin the panel, so a panel
   * that is still on (`showPanel`) becomes a docked rail that is always open,
   * with nothing to close or pin. Off with the panel off too, only the table is
   * drawn. Filters the host already holds keep applying; nothing shows them.
   */
  showHeader?: boolean
  /**
   * Draws the filters panel, and the Filters button that opens it. Defaults to
   * `true`. Off, the omnibox is the only way to filter: its chips, suggestions
   * and quick picks all still work. The one thing lost is a quick pick's
   * "Custom" range, which opened the panel.
   */
  showPanel?: boolean
  /** Whether the panel is showing at first. */
  defaultOpen?: boolean
  /**
   * Whether it starts docked beside the table or floating over it. Kept apart
   * from open so the pin survives closing and reopening the panel.
   */
  defaultPinned?: boolean
  onPinnedChange?: (pinned: boolean) => void
  /** The panel's heading. */
  title?: string
  /** The table. Docked, the panel sits beside it. */
  children: ReactNode
  labels?: Partial<FilterBarLabels>
  className?: string
}
