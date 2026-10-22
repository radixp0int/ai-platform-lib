import { describe, expect, it } from 'vitest'
import { validateIO } from '../engine/io'
import { incidentTriage } from './incidentTriage'
import { EDGE_SEEDS, RUN_INPUT_SPECS, STEP_IO, STEPS } from './loanRun'
import { onboarding } from './onboarding'
import { rfpResponse } from './rfpResponse'

const loan = {
  id: 'loan-review',
  steps: STEPS.map((s) => ({ ...s, io: STEP_IO[s.id] })),
  edges: EDGE_SEEDS,
  inputs: RUN_INPUT_SPECS,
}

describe.each([loan, rfpResponse, onboarding, incidentTriage])('$id I/O', (run) => {
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

describe('script defaults', () => {
  it.each([rfpResponse, onboarding, incidentTriage])('$id fills every required input', (run) => {
    for (const input of run.inputs.filter((i) => i.required))
      expect(run.defaultInputs[input.name], input.name).toBeTruthy()
  })
})
