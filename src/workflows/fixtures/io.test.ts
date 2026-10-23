import { describe, expect, it } from 'vitest'
import { validateIO } from '../engine/io'
import { EDGE_SEEDS, RUN_INPUT_SPECS, RUN_INPUTS, STEP_IO, STEPS } from './loanRun'

const loan = {
  id: 'loan-review',
  steps: STEPS.map((s) => ({ ...s, io: STEP_IO[s.id] })),
  edges: EDGE_SEEDS,
  inputs: RUN_INPUT_SPECS,
}

describe('the loan run’s I/O', () => {
  const run = loan

  it('is wired soundly', () => {
    expect(validateIO(run, run.inputs)).toEqual([])
  })

  it('says what every step reads, and what every step produces', () => {
    for (const step of run.steps) {
      expect(step.io?.inputs.length, `${step.id} inputs`).toBeGreaterThan(0)
      expect(step.io?.outputs.length, `${step.id} outputs`).toBeGreaterThan(0)
    }
  })

  it('reads only run inputs that the start form asks for', () => {
    const names = new Set(run.inputs.map((i) => i.name))
    for (const step of run.steps)
      for (const input of step.io?.inputs ?? [])
        if ('run' in input.from) expect(names.has(input.from.run), input.name).toBe(true)
  })
})

describe('the loan run’s start values', () => {
  it('fill every required input', () => {
    for (const input of RUN_INPUT_SPECS.filter((i) => i.required))
      expect(RUN_INPUTS[input.name], input.name).toBeTruthy()
  })
})
