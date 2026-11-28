import { describe, expect, it } from 'vitest'
import { asOfToday, daysAgo, daysSince, longDate, shortDate } from './as-of-today'

const today = new Date(2027, 0, 10) // Jan 10, 2027: 44 days after the fixture day

describe('as-of-today', () => {
  it('moves a fixture date forward by the days since the fixture day', () => {
    expect(asOfToday('2026-11-27', today)).toBe('2027-01-10')
    expect(asOfToday('2026-11-04', today)).toBe('2026-12-18')
  })

  it('keeps the gap to today, so "23 days ago" stays true', () => {
    expect(daysSince(asOfToday('2026-11-04', today), today)).toBe(23)
  })

  it('counts days back from today', () => {
    expect(daysAgo(30, today)).toBe('2026-12-11')
  })

  it('formats dates short and long', () => {
    expect(shortDate('2026-11-24')).toBe('Nov 24')
    expect(longDate('2026-01-11')).toBe('Jan 11, 2026')
  })
})
