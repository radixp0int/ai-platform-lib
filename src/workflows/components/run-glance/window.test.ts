import { describe, expect, it } from 'vitest'
import type { GlanceStage, GlanceState, GlanceStep } from './types'
import { chainHeading, windowStages, windowSteps } from './window'

const stages = (states: GlanceState[]): GlanceStage[] =>
  states.map((state, i) => ({ id: `s${i}`, name: `Stage ${i + 1}`, state }))
const steps = (states: GlanceState[]): GlanceStep[] =>
  states.map((state, i) => ({ id: `t${i}`, name: `Step ${i + 1}`, state }))
const describeWindow = (entries: ReturnType<typeof windowStages | typeof windowSteps>) =>
  entries.map((e) => (e.kind === 'item' ? e.item.name : `${e.kind}:${e.count}`))

describe('windowStages', () => {
  it('lists up to six stages whole', () => {
    expect(
      describeWindow(windowStages(stages(['done', 'done', 'needs', 'queued', 'queued']))),
    ).toEqual(['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'])
  })

  it('past six, counts the stages done, then previous, current and next, then how many more', () => {
    const nine = stages([
      'done',
      'done',
      'done',
      'running',
      ...Array<GlanceState>(5).fill('queued'),
    ])
    expect(describeWindow(windowStages(nine))).toEqual([
      'done:2',
      'Stage 3',
      'Stage 4',
      'Stage 5',
      'more:4',
    ])
  })

  it('has no "more" when the run is on its last stage', () => {
    const eight = stages([...Array<GlanceState>(7).fill('done'), 'failed'])
    expect(describeWindow(windowStages(eight))).toEqual(['done:6', 'Stage 7', 'Stage 8'])
  })
})

describe('windowSteps', () => {
  it('lists up to seven steps whole', () => {
    expect(windowSteps(steps(['done', 'needs', 'skipped']))).toHaveLength(3)
  })

  it('past seven, keeps the last done step, every current one and the next two', () => {
    const nine = steps([
      'done',
      'done',
      'done',
      'running',
      'running',
      'running',
      'queued',
      'queued',
      'queued',
    ])
    expect(describeWindow(windowSteps(nine))).toEqual([
      'done:2',
      'Step 3',
      'Step 4',
      'Step 5',
      'Step 6',
      'Step 7',
      'Step 8',
      'more:1',
    ])
  })

  it('windows a failed step the same way', () => {
    const nine = steps([
      'done',
      'done',
      'done',
      'failed',
      'queued',
      'queued',
      'queued',
      'queued',
      'queued',
    ])
    expect(describeWindow(windowSteps(nine))).toEqual([
      'done:2',
      'Step 3',
      'Step 4',
      'Step 5',
      'Step 6',
      'more:3',
    ])
  })
})

describe('chainHeading', () => {
  it('says where one waiting step sits in its stage', () => {
    const stage = { id: 'a', name: 'Approve', state: 'needs' as const }
    expect(chainHeading(stage, steps(['done', 'needs', 'skipped']))).toBe('Approve · 2 of 3 steps')
  })

  it('counts the steps while several run', () => {
    const stage = { id: 'd', name: 'Diagnose', state: 'running' as const }
    expect(chainHeading(stage, steps(['done', 'running', 'running']))).toBe('Diagnose · 3 steps')
  })
})
