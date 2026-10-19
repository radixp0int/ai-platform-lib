import { formatDisplay, formatRange, type DateRange } from '../../primitives/date-field'
import {
  activePreset,
  hasRange,
  presetsOf,
  sameRange,
  type DateRangeFilterField,
  type FilterField,
  type OptionsFilterField,
} from '../filter-panel'
import type { FilterTerm, FilterTermField } from './types'

// Everything here is the logic of the filter bar with no drawing in it: what
// the chips are, what typing suggests, what the quick picks hold. A field list
// goes in, plain data comes out, and `run` / `remove` / `pick` are the host's
// own `onChange`s in a closure. That is why it can be tested without a browser.

const NONE: DateRange = { from: null, to: null }

/** How many dates and values typing lists. Search and narrowing are never cut. */
const MAX_DATES = 4
const MAX_VALUES = 3

/** Past this many options a filter is a list, not a row of picks, and stays in the panel. */
export const QUICK_OPTIONS_MAX = 6

/** "Sep 9 – Oct 8, 2026", "Up to Oct 7, 2026", "From Oct 1, 2026". */
export function describeDates(range: DateRange): string {
  if (range.from && range.to) {
    return range.from === range.to ? formatDisplay(range.from) : formatRange(range)
  }
  if (range.to) return `Up to ${formatDisplay(range.to)}`
  if (range.from) return `From ${formatDisplay(range.from)}`
  return ''
}

const lower = (s: string) => s.toLowerCase()

/** Whether every word typed appears somewhere in `text`. */
const matches = (tokens: string[], text: string) => tokens.every((t) => lower(text).includes(t))

// ---------------------------------------------------------------------------
// Chips

type ChipSpec = {
  id: string
  /** The dimmed qualifier before the value, colon included. Empty for none. */
  prefix: string
  text: string
  /** Quieter text after the value: the dates a preset stands for. */
  detail?: string
  /** For the remove button's name. */
  name: string
  remove: () => void
}

type ChipArgs = {
  fields: FilterField[]
  terms: FilterTerm[]
  termFields: FilterTermField[]
  onTermsChange: (terms: FilterTerm[]) => void
  today?: Date
}

/**
 * Every active filter as a chip: typed terms first, then each field in the
 * order given. The omnibox's Backspace takes the last one off, so this order
 * is also the order they come off in.
 */
export function buildChips({
  fields,
  terms,
  termFields,
  onTermsChange,
  today,
}: ChipArgs): ChipSpec[] {
  const chips: ChipSpec[] = []

  for (const term of terms) {
    const label = term.field ? termFields.find((f) => f.key === term.field)?.label : 'search'
    const prefix = `${lower(label ?? term.field ?? 'search')}:`
    chips.push({
      id: `term:${term.id}`,
      prefix,
      text: term.value,
      name: `${prefix} ${term.value}`,
      remove: () => onTermsChange(terms.filter((t) => t.id !== term.id)),
    })
  }

  for (const field of fields) {
    const prefix = `${lower(field.label)}:`
    switch (field.type) {
      case 'string':
        if (field.value) {
          chips.push({
            id: `field:${field.id}`,
            prefix,
            text: field.value,
            name: `${prefix} ${field.value}`,
            remove: () => field.onChange(''),
          })
        }
        break
      case 'options':
        for (const option of field.options) {
          if (!field.value.includes(option.value)) continue
          chips.push({
            id: `field:${field.id}:${option.value}`,
            prefix,
            text: option.label,
            name: `${prefix} ${option.label}`,
            remove: () => field.onChange(field.value.filter((v) => v !== option.value)),
          })
        }
        break
      case 'boolean':
        if (field.value) {
          chips.push({
            id: `field:${field.id}`,
            prefix: '',
            text: field.label,
            name: field.label,
            remove: () => field.onChange(false),
          })
        }
        break
      case 'date':
        if (field.value) {
          const text = formatDisplay(field.value)
          chips.push({
            id: `field:${field.id}`,
            prefix,
            text,
            name: `${prefix} ${text}`,
            remove: () => field.onChange(null),
          })
        }
        break
      case 'dateRange': {
        if (!hasRange(field.value)) break
        const preset = activePreset(field, today)
        const text = preset?.label ?? describeDates(field.value)
        chips.push({
          id: `field:${field.id}`,
          prefix,
          text,
          detail: preset ? describeDates(field.value) : undefined,
          name: `${prefix} ${text}`,
          remove: () => field.onChange(NONE),
        })
        break
      }
    }
  }
  return chips
}

/** How many fields are set. Typed terms are not counted: the panel does not show them. */
export function countActive(fields: FilterField[]): number {
  return fields.filter((field) => {
    switch (field.type) {
      case 'string':
        return field.value !== ''
      case 'options':
        return field.value.length > 0
      case 'boolean':
        return field.value
      case 'date':
        return field.value !== null
      case 'dateRange':
        return hasRange(field.value)
    }
  }).length
}

// ---------------------------------------------------------------------------
// Typed suggestions

type SuggestionSpec = {
  id: string
  /** Text before the emphasised part. */
  lead: string
  strong: string
  glyph?: string
  /** The parameter the choice produces, shown quietly at the right. */
  hint: string
  run: () => void
}

export type SuggestionGroupSpec = {
  id: 'search' | 'terms' | 'dates' | 'values'
  items: SuggestionSpec[]
}

type SuggestionArgs = ChipArgs & {
  query: string
  newId?: () => string
  labels: { searchFor: string; contains: (field: string) => string }
}

let counter = 0
const defaultId = () => `t${Date.now().toString(36)}${(counter += 1)}`

const slug = (s: string) =>
  lower(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * What typing offers, in this order: search every field, narrow to one field,
 * then the dates and values that match what was typed.
 *
 * Search comes first, always, so Enter does what it always did. The two that
 * follow swap places when a value starts with what was typed — "act" is Active
 * before it is "Last active" — because that is the stronger match.
 */
export function buildSuggestionGroups({
  query,
  fields,
  terms,
  termFields,
  onTermsChange,
  today,
  newId = defaultId,
  labels,
}: SuggestionArgs): SuggestionGroupSpec[] {
  const q = query.trim()
  if (!q) return []
  const tokens = lower(q).split(/\s+/)
  const add = (field: string | null) => () =>
    onTermsChange([...terms, { id: newId(), field, value: q }])

  const groups: SuggestionGroupSpec[] = [
    {
      id: 'search',
      items: [
        {
          id: 'search',
          glyph: '⌕',
          lead: `${labels.searchFor} `,
          strong: `“${q}”`,
          hint: `?search=${q}`,
          run: add(null),
        },
      ],
    },
  ]
  if (termFields.length > 0) {
    groups.push({
      id: 'terms',
      items: termFields.map((f) => ({
        id: `term:${f.key}`,
        glyph: f.glyph,
        lead: `${labels.contains(f.label)} `,
        strong: q,
        hint: f.param,
        run: add(f.key),
      })),
    })
  }

  const dates = fields
    .filter((f): f is DateRangeFilterField => f.type === 'dateRange')
    .flatMap((field) =>
      presetsOf(field, today)
        .filter((preset) => matches(tokens, `${field.label} ${preset.label}`))
        .map((preset) => ({
          // A field named in the query ("renew") outranks one that only matches a preset ("30").
          rank: lower(field.label).includes(lower(q)) ? 0 : 1,
          item: {
            id: `date:${field.id}:${slug(preset.label)}`,
            lead: `${field.label} · `,
            strong: preset.label,
            hint: `${field.id}=${slug(preset.label)}`,
            run: () => field.onChange(preset.value),
          } satisfies SuggestionSpec,
        })),
    )
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_DATES)
    .map((entry) => entry.item)

  const values: { starts: boolean; item: SuggestionSpec }[] = []
  for (const field of fields) {
    if (field.type === 'options') {
      for (const option of field.options) {
        if (field.value.includes(option.value)) continue
        if (!matches(tokens, `${field.label} ${option.label}`)) continue
        values.push({
          starts: lower(option.label).startsWith(lower(q)),
          item: {
            id: `value:${field.id}:${option.value}`,
            lead: `${field.label} · `,
            strong: option.label,
            hint: `${field.id}=${option.value}`,
            run: () =>
              field.onChange(
                field.multiple === false ? [option.value] : [...field.value, option.value],
              ),
          },
        })
      }
    } else if (field.type === 'boolean' && !field.value && matches(tokens, field.label)) {
      values.push({
        starts: lower(field.label).startsWith(lower(q)),
        item: {
          id: `value:${field.id}`,
          lead: '',
          strong: field.label,
          hint: `${field.id}=true`,
          run: () => field.onChange(true),
        },
      })
    }
  }
  const valueItems = values.slice(0, MAX_VALUES).map((entry) => entry.item)

  const dateGroup: SuggestionGroupSpec | null = dates.length ? { id: 'dates', items: dates } : null
  const valueGroup: SuggestionGroupSpec | null = valueItems.length
    ? { id: 'values', items: valueItems }
    : null
  const valueFirst = values.some((entry) => entry.starts)
  const rest = valueFirst ? [valueGroup, dateGroup] : [dateGroup, valueGroup]
  return groups.concat(rest.filter((g): g is SuggestionGroupSpec => g !== null))
}

// ---------------------------------------------------------------------------
// Quick picks

export type QuickPick = {
  id: string
  label: string
  count?: number
  pressed: boolean
  toggle: () => void
}

export type QuickRow = {
  id: string
  kind: 'date' | 'options' | 'boolean'
  label: string
  picks: QuickPick[]
  /** For a date: the exact dates the current pick stands for, or empty. */
  detail: string
  /** For a date: the panel's row to open for a range no pick covers. */
  custom: boolean
}

/**
 * The rows of one-click picks shown when the omnibox is empty and focused: a
 * row per date field (its presets that have a short label, since there is no
 * room for the long ones), then a row per filter small enough to be a row.
 */
export function buildQuickRows(fields: FilterField[], today?: Date): QuickRow[] {
  const dates: QuickRow[] = []
  const rest: QuickRow[] = []
  for (const field of fields) {
    if (field.type === 'dateRange') {
      const picks = presetsOf(field, today)
        .filter((preset) => preset.short)
        .map((preset) => {
          const pressed = hasRange(field.value) && sameRange(preset.value, field.value)
          return {
            id: `${field.id}:${slug(preset.label)}`,
            label: preset.short as string,
            pressed,
            toggle: () => field.onChange(pressed ? NONE : preset.value),
          }
        })
      dates.push({
        id: field.id,
        kind: 'date',
        label: field.label,
        picks,
        detail: hasRange(field.value) ? describeDates(field.value) : '',
        custom: hasRange(field.value) && !activePreset(field, today),
      })
    } else if (field.type === 'options' && field.options.length <= QUICK_OPTIONS_MAX) {
      rest.push({
        id: field.id,
        kind: 'options',
        label: field.label,
        detail: '',
        custom: false,
        picks: field.options.map((option: OptionsFilterField['options'][number]) => {
          const pressed = field.value.includes(option.value)
          return {
            id: `${field.id}:${option.value}`,
            label: option.label,
            count: option.count,
            pressed,
            toggle: () =>
              field.onChange(
                pressed
                  ? field.value.filter((v) => v !== option.value)
                  : field.multiple === false
                    ? [option.value]
                    : [...field.value, option.value],
              ),
          }
        }),
      })
    } else if (field.type === 'boolean') {
      rest.push({
        id: field.id,
        kind: 'boolean',
        label: field.label,
        detail: '',
        custom: false,
        picks: [
          {
            id: field.id,
            label: field.label,
            pressed: field.value,
            toggle: () => field.onChange(!field.value),
          },
        ],
      })
    }
  }
  return [...dates, ...rest]
}
