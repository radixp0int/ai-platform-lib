import { describe, expect, it } from 'vitest'
import { change, insightsFor } from './insights-data'

describe('insightsFor', () => {
  it('draws one point a day for the day ranges and one an hour for today', () => {
    expect(insightsFor({ id: '14d' }).labels).toHaveLength(14)
    expect(insightsFor({ id: '7d' }).labels).toHaveLength(7)
    const today = insightsFor({ id: 'today' })
    expect(today.labels[0]).toBe('06:00')
    expect(today.labels.at(-1)).toBe('14:00')
    expect(today.priorNoun).toBe('yesterday by 14:00')
  })

  it('takes a custom range end to end, both days included', () => {
    const w = insightsFor({ id: 'custom', from: '2026-11-02', to: '2026-11-15' })
    expect(w.labels[0]).toBe('Nov 2')
    expect(w.labels.at(-1)).toBe('Nov 15')
    expect(w.short).toBe('Nov 2 – Nov 15')
  })

  it('says there is nothing to compare with when the range starts at the first day', () => {
    const w = insightsFor({ id: 'custom', from: '2026-10-26', to: '2026-11-08' })
    expect(w.hasPrior).toBe(false)
    expect(w.questions.change).toEqual({ text: 'No earlier data to compare' })
    expect(w.errors.rising).toBeNull()
  })

  it('keeps the errors consistent: the types add up to the total, day by day', () => {
    const w = insightsFor({ id: '14d' })
    const byType = w.errors.types.reduce((n, t) => n + t.count, 0)
    expect(byType).toBe(w.errors.total)
    expect(w.errors.totals.reduce((a, b) => a + b, 0)).toBe(w.errors.total)
    expect(w.errors.commonest.count).toBe(Math.max(...w.errors.types.map((t) => t.count)))
  })

  it('notes the Nov 23 dip only when the range covers it', () => {
    expect(insightsFor({ id: '14d' }).evaluation.note).toMatch(/Nov 23/)
    expect(
      insightsFor({ id: 'custom', from: '2026-11-02', to: '2026-11-15' }).evaluation.note,
    ).not.toMatch(/Nov 23/)
  })
})

describe('change', () => {
  it('colours by whether the move is good news, not by its sign', () => {
    expect(change(110, 100, false)).toEqual({ text: '10%', direction: 'up', upIsGood: false })
    expect(change(90, 100, true)).toEqual({ text: '10%', direction: 'down', upIsGood: true })
  })

  it('compares percentages in points, and says when nothing moved', () => {
    expect(change(93.6, 93.3, true, 'pts')).toEqual({
      text: '0.3 pts',
      direction: 'up',
      upIsGood: true,
    })
    expect(change(5, 5, true)).toEqual({ text: 'No change' })
  })
})
