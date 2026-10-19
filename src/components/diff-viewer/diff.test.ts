import { describe, expect, it } from 'vitest'
import { alignChange, changedRanges, diffBlocks, myersDiff } from './diff'
import type { DiffOp } from './diff'

/** Rebuilds both sides from the ops: the check that a diff is a diff at all. */
function replay(ops: DiffOp[], a: readonly string[], b: readonly string[]) {
  const left: string[] = []
  const right: string[] = []
  for (const op of ops) {
    if (op.type !== 'insert') left.push(a[op.a])
    if (op.type !== 'delete') right.push(b[op.b])
  }
  return { left, right }
}

const edits = (ops: DiffOp[]) => ops.filter((op) => op.type !== 'equal').length

describe('myersDiff', () => {
  it('finds nothing to change between identical sequences', () => {
    const lines = ['a', 'b', 'c']
    expect(myersDiff(lines, lines)).toEqual([
      { type: 'equal', a: 0, b: 0 },
      { type: 'equal', a: 1, b: 1 },
      { type: 'equal', a: 2, b: 2 },
    ])
  })

  it('handles an empty side', () => {
    expect(myersDiff([], [])).toEqual([])
    expect(myersDiff([], ['a', 'b'])).toEqual([
      { type: 'insert', b: 0 },
      { type: 'insert', b: 1 },
    ])
    expect(myersDiff(['a'], [])).toEqual([{ type: 'delete', a: 0 }])
  })

  it('reports a replaced line as one removal and one addition', () => {
    expect(myersDiff(['a', 'b', 'c'], ['a', 'x', 'c'])).toEqual([
      { type: 'equal', a: 0, b: 0 },
      { type: 'delete', a: 1 },
      { type: 'insert', b: 1 },
      { type: 'equal', a: 2, b: 2 },
    ])
  })

  it.each([
    [['a', 'b', 'c', 'a', 'b', 'b', 'a'], ['c', 'b', 'a', 'b', 'a', 'c'], 5],
    [['a', 'b', 'c'], ['x', 'y'], 5],
    [['a', 'b', 'c', 'd'], ['a', 'd'], 2],
    [['a', 'd'], ['a', 'b', 'c', 'd'], 2],
    [['same', 'same', 'same'], ['same', 'same'], 1],
  ])('rebuilds both sides of %j → %j in the fewest edits', (a, b, shortest) => {
    const ops = myersDiff(a, b)
    expect(replay(ops, a, b)).toEqual({ left: a, right: b })
    expect(edits(ops)).toBe(shortest)
  })

  it('costs one edit for a one-line change to a long file', () => {
    const before = Array.from({ length: 5000 }, (_, i) => `line ${i}`)
    const after = before.with(2500, 'changed')
    const ops = myersDiff(before, after)
    expect(edits(ops)).toBe(2)
    expect(replay(ops, before, after).right).toEqual(after)
  })
})

describe('diffBlocks', () => {
  it('groups neighbouring removals and additions into one change', () => {
    expect(diffBlocks(['a', 'b', 'c', 'd'], ['a', 'x', 'y', 'd'])).toEqual([
      { type: 'equal', pairs: [{ a: 0, b: 0 }] },
      { type: 'change', deleted: [1, 2], inserted: [1, 2] },
      { type: 'equal', pairs: [{ a: 3, b: 3 }] },
    ])
  })

  it('keeps two changes apart when unchanged lines sit between them', () => {
    const blocks = diffBlocks(['a', 'b', 'c', 'd', 'e'], ['A', 'b', 'c', 'd', 'E'])
    expect(blocks.map((block) => block.type)).toEqual(['change', 'equal', 'change'])
  })

  it('is one unchanged block for identical input, and empty for no input', () => {
    expect(diffBlocks(['a', 'b'], ['a', 'b'])).toEqual([
      {
        type: 'equal',
        pairs: [
          { a: 0, b: 0 },
          { a: 1, b: 1 },
        ],
      },
    ])
    expect(diffBlocks([], [])).toEqual([])
  })
})

describe('changedRanges', () => {
  const slices = (text: string, ranges: [number, number][]) =>
    ranges.map(([start, end]) => text.slice(start, end))

  it('marks the number that changed and not the key beside it', () => {
    const before = 'maxLength: 2000'
    const after = 'maxLength: 4000'
    const [left, right] = changedRanges(before, after)
    expect(slices(before, left)).toEqual(['2000'])
    expect(slices(after, right)).toEqual(['4000'])
  })

  it('merges changed tokens that touch into one range', () => {
    // `!` and `!` are two tokens; side by side they are one mark, not two.
    const [left, right] = changedRanges('done', 'done!!')
    expect(left).toEqual([])
    expect(right).toEqual([[4, 6]])
  })

  it('keeps changes apart when unchanged text sits between them', () => {
    const before = 'retries: 3, timeout: 30'
    const after = 'retries: 5, timeout: 60'
    const [left, right] = changedRanges(before, after)
    expect(slices(before, left)).toEqual(['3', '30'])
    expect(slices(after, right)).toEqual(['5', '60'])
  })

  it('marks nothing between identical lines', () => {
    expect(changedRanges('same', 'same')).toEqual([[], []])
  })

  it('marks the whole of a line that had no counterpart', () => {
    expect(changedRanges('', 'new words')).toEqual([[], [[0, 9]]])
  })
})

describe('alignChange', () => {
  it('pairs each removed line with the added line that is an edit of it', () => {
    // An insertion in the middle: pairing by position would put `- faqs`
    // against `- policies`.
    expect(alignChange(['topK: 5', '- faqs'], ['topK: 8', '- policies', '- faqs'])).toEqual([
      { deleted: 0, inserted: 0, similar: true },
      { deleted: null, inserted: 1, similar: false },
      { deleted: 1, inserted: 2, similar: true },
    ])
  })

  it('sets unrelated lines side by side without calling them an edit', () => {
    expect(alignChange(['one'], ['two', 'three'])).toEqual([
      { deleted: 0, inserted: 0, similar: false },
      { deleted: null, inserted: 1, similar: false },
    ])
  })

  it('handles a change that only removes, or only adds', () => {
    expect(alignChange(['gone'], [])).toEqual([{ deleted: 0, inserted: null, similar: false }])
    expect(alignChange([], ['new'])).toEqual([{ deleted: null, inserted: 0, similar: false }])
  })

  it('uses every line on both sides exactly once', () => {
    const deleted = ['alpha beta gamma', 'unrelated', 'delta epsilon zeta']
    const inserted = ['zzz', 'alpha beta gamma!', 'delta epsilon eta', 'tail']
    const rows = alignChange(deleted, inserted)
    const used = (side: 'deleted' | 'inserted') =>
      rows.map((row) => row[side]).filter((index) => index !== null)
    expect(used('deleted')).toEqual([0, 1, 2])
    expect(used('inserted')).toEqual([0, 1, 2, 3])
  })

  it('stops looking after the look-ahead, so a huge change stays cheap', () => {
    const inserted = [...Array.from({ length: 8 }, (_, i) => `filler ${i} xx yy zz`), 'needle']
    expect(alignChange(['needle'], inserted).some((row) => row.similar)).toBe(false)
    expect(alignChange(['needle'], inserted, 0.4, 9).some((row) => row.similar)).toBe(true)
  })
})
