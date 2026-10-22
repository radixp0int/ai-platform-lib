import { describe, expect, it } from 'vitest'
import type { StatusMap, StepStatus } from '../components/index'
import { io } from '../fixtures/io-spec'
import { PENDING_OUTPUT, resolveStepIO, RUN_SOURCE, validateIO } from './io'
import type { RunGraph } from './types'
import type { StepIO } from './wireProtocol'

// Three steps in a line: the trigger reads the run's inputs, `score` reads the
// trigger, and `approve` reads both.
const IO: Record<string, StepIO> = {
  trigger: io('applicant:text<run; amount:money<run', 'amount:money=$450,000'),
  score: io('amount:money<trigger', 'grade:number=4 of 10'),
  approve: io('grade:number<score; amount:money<trigger', 'decision:choice'),
}
const TITLES: Record<string, string> = {
  trigger: 'Application received',
  score: 'Risk scoring',
  approve: 'Approve credit memo',
}

function graph(inputs: Record<string, string> = { applicant: 'Harbor Street Bakery' }): RunGraph {
  const steps = Object.keys(IO).map((id) => ({ id, title: TITLES[id] }))
  return {
    steps,
    stepById: new Map(steps.map((s) => [s.id, s])),
    io: IO,
    inputs,
  } as unknown as RunGraph
}

const at = (statuses: StatusMap, stepId: string) => resolveStepIO(graph(), statuses, stepId)!

describe('resolveStepIO', () => {
  it('reads an input off its source once the source is done', () => {
    const { inputs } = at({ trigger: 'done', score: 'done', approve: 'waiting' }, 'approve')
    expect(inputs).toEqual([
      { name: 'grade', type: 'number', source: 'Risk scoring', value: '4 of 10', ready: true },
      {
        name: 'amount',
        type: 'money',
        source: 'Application received',
        value: '$450,000',
        ready: true,
      },
    ])
  })

  it('says an input is not ready while its source is not done', () => {
    const { inputs } = at({ trigger: 'done', score: 'running', approve: 'queued' }, 'approve')
    expect(inputs[0]).toMatchObject({ value: 'Not ready yet', ready: false })
    expect(inputs[1]).toMatchObject({ value: '$450,000', ready: true })
  })

  it('names a skipped or failed source rather than waiting on it forever', () => {
    expect(at({ score: 'skipped' }, 'approve').inputs[0].value).toBe('Skipped on this run')
    expect(at({ score: 'failed' }, 'approve').inputs[0].value).toBe('Source step failed')
  })

  it('reads a run input from what the run was started with', () => {
    const { inputs } = at({ trigger: 'done' }, 'trigger')
    expect(inputs[0]).toMatchObject({
      source: RUN_SOURCE,
      value: 'Harbor Street Bakery',
      ready: true,
    })
    // `amount` was optional and left empty.
    expect(inputs[1]).toMatchObject({ value: 'Not provided', ready: false })
  })

  it('shows an output only once its step has produced it', () => {
    expect(at({ score: 'done' }, 'score').outputs[0]).toMatchObject({
      value: '4 of 10',
      ready: true,
    })
    // A step sent back still holds last time's value on the wire; it must not show.
    expect(at({ score: 'running' }, 'score').outputs[0]).toMatchObject({
      value: 'Being produced',
      ready: false,
    })
  })

  it('has a word for every status an output can be pending at', () => {
    const statuses: StepStatus[] = ['running', 'waiting', 'queued', 'skipped', 'failed', 'changes']
    for (const status of statuses) {
      const [output] = at({ approve: status }, 'approve').outputs
      expect(output).toMatchObject({ value: PENDING_OUTPUT[status], ready: false })
    }
  })

  it('says "Produced" for a finished output that carries no value', () => {
    expect(at({ approve: 'approved' }, 'approve').outputs[0]).toMatchObject({
      value: 'Produced',
      ready: true,
    })
  })

  it('treats a step with no status as queued', () => {
    expect(at({}, 'score').outputs[0].value).toBe('Not produced yet')
  })

  it('returns null for a step that declares no I/O', () => {
    expect(resolveStepIO(graph(), {}, 'nowhere')).toBeNull()
  })
})

describe('validateIO', () => {
  const steps = Object.entries(IO).map(([id, stepIO]) => ({
    id,
    title: TITLES[id],
    kind: 'agent',
    io: stepIO,
  }))
  const edges = [
    { from: 'trigger', to: 'score' },
    { from: 'score', to: 'approve' },
  ]
  const declared = [
    { name: 'applicant', type: 'text' as const, required: true, description: '' },
    { name: 'amount', type: 'money' as const, required: false, description: '' },
  ]

  it('passes sound wiring', () => {
    expect(validateIO({ steps, edges }, declared)).toEqual([])
  })

  it('reports every problem at once instead of throwing', () => {
    const broken = [
      ...steps,
      {
        id: 'letter',
        title: 'Draft letter',
        kind: 'agent',
        io: io('decision:choice<approve; memo:file<ghost; grade:number<score.risk; tone:text<run'),
      },
      { id: 'early', title: 'Early', kind: 'agent', io: io('decision:choice<approve') },
    ]
    expect(
      validateIO({ steps: broken, edges: [...edges, { from: 'approve', to: 'letter' }] }, declared),
    ).toEqual([
      'letter.memo reads from unknown step "ghost"',
      'letter.grade reads "risk", which score does not output',
      'letter.tone reads run input "tone", which is not declared',
      'early.decision reads from approve, which does not come before it',
    ])
  })
})
