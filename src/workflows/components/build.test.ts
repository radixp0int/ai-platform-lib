import { describe, expect, it } from 'vitest'
import {
  buildFoldEdges,
  buildFoldNodes,
  feeds,
  foldHeight,
  foldNodeId,
  never,
  STEP_H,
  stepHeight,
  type EdgeSeed,
} from './build'
import type { StageSeed, StatusMap, StepSeed } from './types'

const seed = (id: string, stageId: string): StepSeed => ({
  id,
  kind: 'agent',
  stageId,
  title: id,
  meta: '',
  detail: {},
  x: 0,
  y: 0,
})

const STEPS = [seed('a1', 'a'), seed('a2', 'a'), seed('b1', 'b'), seed('c1', 'c')]
const STAGES: StageSeed[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id.toUpperCase(),
  sub: '',
  status: 'upcoming',
}))
const EDGES: EdgeSeed[] = [
  { from: 'a1', to: 'a2', state: feeds('a2') },
  { from: 'a1', to: 'b1', state: feeds('b1') },
  { from: 'a2', to: 'b1', state: feeds('b1') },
  { from: 'b1', to: 'c1', state: never },
]
const STATUSES: StatusMap = { a1: 'done', a2: 'done', b1: 'waiting', c1: 'queued' }

describe('stepHeight', () => {
  it('is the plain height when there is nothing to draw', () => {
    expect(stepHeight()).toBe(STEP_H)
    expect(stepHeight({})).toBe(STEP_H)
    expect(stepHeight({ facts: [], tools: [] })).toBe(STEP_H)
  })

  it('grows by each part that is present', () => {
    const facts = stepHeight({ facts: [['Result', 'OK']] })
    const two = stepHeight({
      facts: [
        ['Result', 'OK'],
        ['Took', '2s'],
      ],
    })
    expect(facts).toBeGreaterThan(STEP_H)
    expect(two).toBeGreaterThan(facts)
    expect(stepHeight({ facts: [['Result', 'OK']], note: 'Advice' })).toBeGreaterThan(facts)
  })
})

describe('a folded run’s nodes and edges', () => {
  it('draws one node per folded stage, holding that stage’s steps', () => {
    const nodes = buildFoldNodes(STAGES, STEPS, { a: { x: 10, y: 20 } }, STATUSES)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].id).toBe(foldNodeId('a'))
    expect(nodes[0].position).toEqual({ x: 10, y: 20 })
    expect(nodes[0].data.steps.map((s) => s.id)).toEqual(['a1', 'a2'])
    expect(foldHeight(2)).toBeGreaterThan(foldHeight(1))
  })

  it('re-points edges at a folded stage, drops the ones inside it, and merges the rest', () => {
    const edges = buildFoldEdges(EDGES, STEPS, new Set(['a']), STATUSES, false)
    // a1→a2 is inside the fold; a1→b1 and a2→b1 become one edge.
    expect(edges.map((e) => e.id)).toEqual([`${foldNodeId('a')}-b1`, 'b1-c1'])
    expect(edges[0].source).toBe(foldNodeId('a'))
  })

  it('leaves an unfolded run’s edges alone', () => {
    const edges = buildFoldEdges(EDGES, STEPS, new Set(), STATUSES, false)
    expect(edges.map((e) => e.id)).toEqual(['a1-a2', 'a1-b1', 'a2-b1', 'b1-c1'])
  })
})
