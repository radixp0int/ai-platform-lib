// The two dates on a history card, said two ways on purpose. "Updated" is
// what the list is sorted by and what a reader scans for, so it is relative:
// "2 hours ago" is easier to place than a clock time. "Created" is a fact
// about the conversation that never changes, so it is a plain date.

const MINUTE = 60_000

const UNITS: [unit: Intl.RelativeTimeFormatUnit, minutes: number][] = [
  ['year', 525_600],
  ['month', 43_800],
  ['week', 10_080],
  ['day', 1_440],
  ['hour', 60],
  ['minute', 1],
]

// `auto` gives "yesterday" and "last week" where the language has the word.
const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

/** "just now", "12 minutes ago", "yesterday", "3 weeks ago" — whole units, rounded down. */
export function formatUpdated(iso: string, now: number): string {
  const minutes = Math.floor((now - Date.parse(iso)) / MINUTE)
  // Under a minute, or a server clock a little ahead of this one.
  if (minutes < 1) return 'just now'
  const [unit, size] = UNITS.find(([, size]) => minutes >= size)!
  return relative.format(-Math.floor(minutes / size), unit)
}

/** "Sep 12, 2026". */
export const formatCreated = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// The filter side: local calendar days, `YYYY-MM-DD`, as the date fields give
// them. A day is a local day — "today" ends at the reader's midnight, not UTC's.

const pad = (n: number) => String(n).padStart(2, '0')

/** A date as its local calendar day. */
export const toIsoDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** A local calendar day as people read it: "Sep 12, 2026". */
export const formatDay = (isoDay: string) => formatCreated(`${isoDay}T00:00:00`)

/** The first instant of a local day. */
export const dayStart = (isoDay: string) => new Date(`${isoDay}T00:00:00`).getTime()

/** The first instant after a local day — the exclusive end of a range that includes it. */
export function dayEnd(isoDay: string) {
  const next = new Date(`${isoDay}T00:00:00`)
  next.setDate(next.getDate() + 1)
  return next.getTime()
}

/**
 * Today and the days before it, `days` in all — the same reading of "last 7
 * days" as `dateRangePresets()`, so the tabs and a calendar pick agree.
 */
export function lastDays(days: number, today = new Date()) {
  const from = new Date(today)
  from.setDate(from.getDate() - (days - 1))
  return { from: toIsoDay(from), to: toIsoDay(today) }
}
