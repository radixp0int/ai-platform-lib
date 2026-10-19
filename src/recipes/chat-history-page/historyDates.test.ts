import { describe, expect, it } from 'vitest'
import { formatCreated, formatUpdated } from './historyDates'

const NOW = Date.parse('2026-10-07T15:00:00Z')
const ago = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString()

describe('formatUpdated', () => {
  it.each([
    [0, 'just now'],
    [0.9, 'just now'],
    [1, '1 minute ago'],
    [59, '59 minutes ago'],
    [60, '1 hour ago'],
    [119, '1 hour ago'],
    [23 * 60 + 59, '23 hours ago'],
    [24 * 60, 'yesterday'],
    [6 * 24 * 60, '6 days ago'],
    [7 * 24 * 60, 'last week'],
    [29 * 24 * 60, '4 weeks ago'],
    [31 * 24 * 60, 'last month'],
    [200 * 24 * 60, '6 months ago'],
    [366 * 24 * 60, 'last year'],
  ])('%d minutes back reads "%s"', (minutes, label) => {
    expect(formatUpdated(ago(minutes), NOW)).toBe(label)
  })

  it('does not say "in 2 minutes" when the server clock is ahead', () => {
    expect(formatUpdated(ago(-2), NOW)).toBe('just now')
  })
})

describe('formatCreated', () => {
  it('is a short date with its year', () => {
    expect(formatCreated('2026-09-12T12:00:00')).toBe('Sep 12, 2026')
  })
})
