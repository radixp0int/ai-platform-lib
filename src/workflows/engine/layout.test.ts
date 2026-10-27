import { describe, expect, it } from 'vitest'
import { FOLD_W, foldHeight, RICH_W, STEP_H, stepHeight } from '../components/build'
import { FOLD_GUTTER, foldRun, LANE_BLEED, placeRun, ROW_AXIS, ROW_PITCH } from './layout'
import type { WireStage, WireStep } from './wireProtocol'

const step = (id: string, stageId: string, column: number, row = 0, extra = {}): WireStep => ({
  id,
  kind: 'agent',
  stageId,
  title: id,
  meta: '',
  column,
  row,
  detail: { summary: '', rows: [] },
  ...extra,
})

const STAGES: WireStage[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  sub: '',
  status: 'upcoming',
}))

/** A longer run than the loan's: five stages, two steps in the middle one. */
const LONG_STAGES: WireStage[] = ['intake', 'qualify', 'draft', 'review', 'submit'].map((id) => ({
  id,
  name: id,
  sub: '',
  status: 'upcoming',
}))
const LONG_STEPS: WireStep[] = [
  step('received', 'intake', 0),
  step('fit', 'qualify', 1),
  step('write', 'draft', 2),
  step('check', 'review', 3, 0),
  step('legal', 'review', 3, 1),
  step('send', 'submit', 4),
]

const byId = (steps: { id: string; x: number; y: number }[]) => new Map(steps.map((s) => [s.id, s]))

describe('placeRun', () => {
  it('reproduces the loan run’s authored columns, gate narrowing included', () => {
    const steps: WireStep[] = [
      step('trigger', 'a', 0),
      step('bureau', 'a', 1),
      step('risk', 'b', 2),
      step('policy', 'b', 3, 0, { kind: 'decision' }),
      step('approve', 'c', 4),
      step('letter', 'c', 5),
    ]
    const xs = placeRun(steps, STAGES).steps.map((s) => s.x)
    expect(xs).toEqual([0, 300, 600, 900, 1174, 1474])
  })

  it('spaces a column of plain steps by the row pitch, centred on the axis', () => {
    const steps = [step('one', 'a', 0, 0), step('two', 'a', 0, 1), step('three', 'a', 0, 2)]
    const ys = placeRun(steps, STAGES).steps.map((s) => s.y)
    expect(ys).toEqual([ROW_AXIS - ROW_PITCH, ROW_AXIS, ROW_AXIS + ROW_PITCH])
  })

  it('gives a step with content more room, and keeps the gap between nodes', () => {
    const content = { facts: [['Result', '201 Created'] as [string, string]], note: 'Advice' }
    const steps = [step('tall', 'a', 0, 0, { content }), step('plain', 'a', 0, 1)]
    const placed = byId(placeRun(steps, STAGES).steps)
    const gap = ROW_PITCH - STEP_H
    expect(stepHeight(content)).toBeGreaterThan(STEP_H)
    expect(placed.get('plain')!.y - placed.get('tall')!.y).toBe(stepHeight(content) + gap)
    expect(placeRun(steps, STAGES).steps[0].w).toBe(RICH_W)
  })

  it('folds a stage to one narrow slot and closes up what follows', () => {
    const steps = [
      step('a1', 'a', 0),
      step('b1', 'b', 1, 0),
      step('b2', 'b', 1, 1),
      step('b3', 'b', 2),
      step('c1', 'c', 3),
    ]
    const open = placeRun(steps, STAGES)
    const folded = placeRun(steps, STAGES, { folded: new Set(['b']) })

    expect(open.folds).toEqual({})
    // Two columns of `b` became one slot, with the tighter gutter on each side.
    const foldX = 196 + FOLD_GUTTER
    expect(folded.folds.b).toEqual({ x: foldX, y: ROW_AXIS + STEP_H / 2 - foldHeight(3) / 2 })
    expect(byId(folded.steps).get('c1')!.x).toBe(foldX + FOLD_W + FOLD_GUTTER)
    expect(byId(folded.steps).get('c1')!.x).toBeLessThan(byId(open.steps).get('c1')!.x)

    // Lanes still tile: each one starts where the last one stopped.
    const { a, b, c } = folded.lanes
    expect(a.x).toBe(-LANE_BLEED)
    expect(b.x).toBe(a.x + a.w)
    expect(c.x).toBe(b.x + b.w)
  })

  it('does not let a folded stage’s rows decide how tall the lanes are', () => {
    const steps = [
      step('a1', 'a', 0),
      ...Array.from({ length: 5 }, (_, row) => step(`b${row}`, 'b', 1, row)),
      step('c1', 'c', 2),
    ]
    const open = placeRun(steps, STAGES)
    const folded = placeRun(steps, STAGES, { folded: new Set(['b']) })
    expect(folded.laneBottom - folded.laneTop).toBeLessThan(open.laneBottom - open.laneTop)
  })

  it('keeps an unfolded run exactly where it was', () => {
    const before = placeRun(LONG_STEPS, LONG_STAGES)
    const after = placeRun(LONG_STEPS, LONG_STAGES, { folded: new Set() })
    expect(after.steps.map((s) => [s.x, s.y])).toEqual(before.steps.map((s) => [s.x, s.y]))
    expect(after.lanes).toEqual(before.lanes)
  })
})

describe('foldRun', () => {
  it('reads the grid back off a placed run, so folding nothing moves nothing', () => {
    const placed = placeRun(LONG_STEPS, LONG_STAGES)
    const again = foldRun({ steps: placed.steps, stages: LONG_STAGES }, new Set())
    expect(again.steps.map((s) => [s.id, s.x, s.y])).toEqual(
      placed.steps.map((s) => [s.id, s.x, s.y]),
    )
  })

  it('folds every stage it is asked to, and only those', () => {
    const placed = placeRun(LONG_STEPS, LONG_STAGES)
    const folded = foldRun(
      { steps: placed.steps, stages: LONG_STAGES },
      new Set(['intake', 'qualify', 'submit']),
    )
    expect(Object.keys(folded.folds).sort()).toEqual(['intake', 'qualify', 'submit'])
    const width = (run: typeof placed) => Math.max(...run.steps.map((s) => s.x))
    expect(width(folded)).toBeLessThan(width(placed))
  })
})
