// Fixture dates are written as of the day the designs were drawn. Shifting
// them by however many days have passed since keeps every "last 30 days",
// "added this week" and "sent 3 days ago" true on whatever day the story is
// opened, so filters by date always have something to find.

/** The day the Finals 2.0 fixtures were written against. */
export const FIXTURE_DAY = '2026-11-27'

const DAY = 864e5

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** Today, as `yyyy-mm-dd` in local time. */
export const todayIso = () => iso(new Date())

/** `date` moved forward by the days between `FIXTURE_DAY` and today. */
export function asOfToday(date: string, today = new Date()): string {
  const offset = Math.round((Date.parse(date) - Date.parse(FIXTURE_DAY)) / DAY)
  const shifted = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset)
  return iso(shifted)
}

/** `yyyy-mm-dd`, `days` before today. */
export function daysAgo(days: number, today = new Date()): string {
  return iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days))
}

/** Whole days from `date` to today. */
export function daysSince(date: string, today = new Date()): number {
  const [y, m, d] = date.split('-').map(Number)
  const then = new Date(y, m - 1, d)
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((now.getTime() - then.getTime()) / DAY)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Nov 24" — the month and day, for a date this year. */
export function shortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}`
}

/** "Nov 24, 2026". */
export function longDate(date: string): string {
  const [y] = date.split('-')
  return `${shortDate(date)}, ${y}`
}
