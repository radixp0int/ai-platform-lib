import { describe, expect, it } from 'vitest'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { shapeLine, shapeOf, stepCount, totalSteps } from './spec'

describe('shapeOf', () => {
  const shape = shapeOf(COMMERCIAL_LOAN_SPEC.stages)

  it('keeps the stages and their columns as the workflow has them', () => {
    expect(shape.map((stage) => stage.name)).toEqual([
      'Intake',
      'Gather',
      'Analyze',
      'Approve',
      'Decide & notify',
    ])
    expect(shape.find((stage) => stage.id === 'approve')!.columns.map((c) => c.length)).toEqual([
      1, 2,
    ])
  })

  it('draws a step that only sometimes runs as not reached, and the rest alike', () => {
    const statuses = Object.fromEntries(
      shape.flatMap((stage) => stage.columns.flat().map((step) => [step.id, step.status])),
    )
    expect(statuses.senior).toBe('queued')
    expect(statuses.approve).toBe('done')
    expect(Object.values(statuses).filter((status) => status === 'queued')).toHaveLength(1)
  })

  it('has no stage in progress, since a definition is not a run', () => {
    expect(new Set(shape.map((stage) => stage.status))).toEqual(new Set(['upcoming']))
  })
})

describe('counts', () => {
  it('counts the steps in a stage across its columns', () => {
    const approve = COMMERCIAL_LOAN_SPEC.stages.find((stage) => stage.id === 'approve')!
    expect(stepCount(approve)).toBe(3)
  })

  it('counts twelve steps over five stages in the commercial loan review', () => {
    expect(totalSteps(COMMERCIAL_LOAN_SPEC)).toBe(12)
    expect(shapeLine(COMMERCIAL_LOAN_SPEC)).toBe('5 stages · 12 steps')
  })

  it('gives every step an id that is unique in the workflow', () => {
    const ids = COMMERCIAL_LOAN_SPEC.stages.flatMap((stage) =>
      stage.columns.flat().map((s) => s.id),
    )
    expect(new Set(ids).size).toBe(ids.length)
  })
})
