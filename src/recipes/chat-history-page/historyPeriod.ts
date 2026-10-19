import type { DateRange } from '../../primitives/date-field'
import { formatDay, lastDays } from './historyDates'

/** `any` is no date filter; the numbers are days back from today, today included. */
export type Period = 'any' | '7' | '14' | 'custom'

export const PERIODS: { value: Period; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: 'custom', label: 'Custom range' },
]

export const NO_RANGE: DateRange = { from: null, to: null }

/** The days a period covers. Custom with no dates chosen yet covers everything, like Any time. */
export function periodRange(period: Period, custom: DateRange): DateRange {
  if (period === 'any') return NO_RANGE
  return period === 'custom' ? custom : lastDays(Number(period))
}

/**
 * The date filter as a clause — "in the last 7 days", "between Sep 1 and
 * Sep 14, 2026" — or nothing when no dates are filtered.
 */
export function describePeriod(period: Period, range: DateRange) {
  if (!range.from || !range.to) return ''
  if (period !== 'custom') return `in the last ${period} days`
  return range.from === range.to
    ? `on ${formatDay(range.from)}`
    : `between ${formatDay(range.from)} and ${formatDay(range.to)}`
}
