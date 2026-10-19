import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatSummary } from '../../fixtures/platform/chatHistory'
import { createHistoryApi, type HistoryQuery } from './historyApi'
import { lastDays, toIsoDay } from './historyDates'

// Local times throughout: the filter speaks in the reader's calendar days.
const at = (local: string) => new Date(local).toISOString()
const chat = (id: string, title: string, updated: string): ChatSummary => ({
  id,
  title,
  createdAt: at(updated),
  updatedAt: at(updated),
})

const ROWS = [
  chat('a', 'Wire cutoff times', '2026-10-07T09:00:00'),
  chat('b', 'Sweep thresholds', '2026-10-03T23:59:00'),
  chat('c', 'Dual approval for WIRES', '2026-10-03T00:00:00'),
  chat('d', 'Lockbox matching', '2026-10-02T23:59:00'),
  chat('e', 'Wire recall', '2026-09-20T12:00:00'),
]

describe('createHistoryApi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  async function ask(query: HistoryQuery, page = 1, size = 10) {
    const api = createHistoryApi(ROWS, { latencyMs: 100 })
    const answer = api(query, { page, size, sort: [] }, new AbortController().signal)
    await vi.advanceTimersByTimeAsync(100)
    return answer
  }
  const ids = async (query: HistoryQuery) => (await ask(query)).content.map((row) => row.id)

  it('returns everything, in order, for an empty query', async () => {
    expect(await ids({})).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(await ids({ search: '  ', updatedFrom: null, updatedTo: null })).toHaveLength(5)
  })

  it('matches the title whatever its case', async () => {
    expect(await ids({ search: 'wire' })).toEqual(['a', 'c', 'e'])
  })

  it('includes both ends of a date range, as whole local days', async () => {
    expect(await ids({ updatedFrom: '2026-10-03', updatedTo: '2026-10-03' })).toEqual(['b', 'c'])
    expect(await ids({ updatedFrom: '2026-10-03' })).toEqual(['a', 'b', 'c'])
    expect(await ids({ updatedTo: '2026-10-02' })).toEqual(['d', 'e'])
  })

  it('combines search and dates', async () => {
    expect(await ids({ search: 'wire', updatedFrom: '2026-10-01' })).toEqual(['a', 'c'])
  })

  it('pages what matched, and counts only that', async () => {
    const first = await ask({ search: 'wire' }, 1, 2)
    expect(first).toMatchObject({ totalElements: 3, totalPages: 2, last: false, page: 1 })
    const second = await ask({ search: 'wire' }, 2, 2)
    expect(second.content.map((row) => row.id)).toEqual(['e'])
    expect(second.last).toBe(true)
  })

  it('says nothing matched with an empty last page', async () => {
    expect(await ask({ search: 'zebra' })).toMatchObject({ totalElements: 0, last: true })
  })
})

describe('lastDays', () => {
  it('counts today as the first of the days', () => {
    const today = new Date('2026-10-07T15:00:00')
    expect(lastDays(7, today)).toEqual({ from: '2026-10-01', to: '2026-10-07' })
    expect(lastDays(14, today)).toEqual({ from: '2026-09-24', to: '2026-10-07' })
    expect(lastDays(1, today)).toEqual({ from: '2026-10-07', to: '2026-10-07' })
  })

  it('uses the local day, late in the evening too', () => {
    expect(toIsoDay(new Date('2026-10-07T23:30:00'))).toBe('2026-10-07')
  })
})
