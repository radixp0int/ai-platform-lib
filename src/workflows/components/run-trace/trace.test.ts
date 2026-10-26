import { describe, expect, it } from 'vitest'
import {
  COMMERCIAL_LOAN_TRACE,
  COMMERCIAL_LOAN_TRACE_BUREAU_FAILED,
} from '../../fixtures/commercialLoanTrace'
import {
  currentStageId,
  currentStepId,
  formatDuration,
  formatOffset,
  formatTokens,
  spanRecord,
  summarizeStages,
} from './trace'

describe('formatDuration', () => {
  it('keeps tenths under a minute', () => {
    expect(formatDuration(0.4)).toBe('0.4s')
    expect(formatDuration(41.2)).toBe('41.2s')
  })

  it('reads in minutes and seconds under an hour', () => {
    expect(formatDuration(125)).toBe('2m 05s')
    expect(formatDuration(1172.4)).toBe('19m 32s')
  })

  it('reads in hours and minutes from an hour', () => {
    expect(formatDuration(3600)).toBe('1h 00m')
    expect(formatDuration(11520)).toBe('3h 12m')
  })

  it('says where something began', () => {
    expect(formatOffset(7.8)).toBe('+7.8s')
  })
})

describe('formatTokens', () => {
  it('abbreviates thousands', () => {
    expect(formatTokens(950)).toBe('950')
    expect(formatTokens(21500)).toBe('21.5k')
  })
})

describe('summarizeStages', () => {
  const stages = summarizeStages(COMMERCIAL_LOAN_TRACE)
  const byId = (id: string) => stages.find((stage) => stage.id === id)!

  it('makes one tile per stage, in order', () => {
    expect(stages.map((stage) => stage.id)).toEqual([
      'intake',
      'gather',
      'analyze',
      'approve',
      'decide',
    ])
  })

  it('calls a stage waiting while one of its steps waits on a person', () => {
    expect(byId('approve').state).toBe('waiting')
    expect(byId('approve').stateLabel).toBe('Needs a person')
  })

  it('calls a finished stage done', () => {
    expect(byId('gather').state).toBe('done')
    expect(byId('gather').stateLabel).toBe('Done')
  })

  it('names a failure even though the run went on past it', () => {
    const failed = summarizeStages(COMMERCIAL_LOAN_TRACE_BUREAU_FAILED).find(
      (stage) => stage.id === 'gather',
    )!
    expect(failed.state).toBe('failed')
    expect(failed.stateLabel).toBe('1 failed')
  })

  it('calls a stage with nothing begun queued, with no duration', () => {
    expect(byId('decide').state).toBe('queued')
    expect(byId('decide').duration).toBeUndefined()
  })

  it('measures a stage from its first step beginning to its last one ending', () => {
    // Gather: the credit pull begins at 48s, the spread ends at 120s.
    expect(byId('gather').duration).toBeCloseTo(72, 5)
    expect(byId('intake').duration).toBeCloseTo(48, 5)
  })

  it('keeps one mark per step, including one that was skipped', () => {
    expect(byId('gather').marks).toEqual(['done', 'done', 'done'])
    expect(byId('approve').marks).toEqual(['done', 'waiting', 'skipped'])
  })
})

describe('where a reader lands', () => {
  const stages = summarizeStages(COMMERCIAL_LOAN_TRACE)

  it('opens on the stage that is waiting', () => {
    expect(currentStageId(stages)).toBe('approve')
  })

  it('opens on the last stage that began when nothing is live', () => {
    const finished = stages.map((stage) =>
      stage.state === 'waiting' ? { ...stage, state: 'done' as const } : stage,
    )
    expect(currentStageId(finished)).toBe('approve')
  })

  it('opens the step that is still going, else the failed one, else the first', () => {
    expect(currentStepId(COMMERCIAL_LOAN_TRACE, 'approve')).toBe('approve')
    expect(currentStepId(COMMERCIAL_LOAN_TRACE_BUREAU_FAILED, 'gather')).toBe('bureau')
    expect(currentStepId(COMMERCIAL_LOAN_TRACE, 'gather')).toBe('bureau')
    expect(currentStepId(COMMERCIAL_LOAN_TRACE, 'analyze')).toBe('risk')
  })

  it('has nothing to open in a stage that does not exist', () => {
    expect(currentStepId(COMMERCIAL_LOAN_TRACE, 'nowhere')).toBeUndefined()
  })
})

describe('spanRecord', () => {
  it('is JSON a person can read, with the run it belongs to', () => {
    const step = COMMERCIAL_LOAN_TRACE.steps.find((s) => s.id === 'memo')!
    const parsed = JSON.parse(spanRecord(step, 'harbor-street'))
    expect(parsed).toMatchObject({ span_id: 'memo', run_id: 'harbor-street', status: 'done' })
    expect(parsed.usage).toEqual({
      model: 'claude-sonnet-5-5',
      input_tokens: 31000,
      output_tokens: 6400,
    })
    expect(parsed.calls).toHaveLength(5)
  })
})

describe('the commercial loan trace', () => {
  it('follows the scripted run: twelve steps over five stages', () => {
    expect(COMMERCIAL_LOAN_TRACE.steps).toHaveLength(12)
    expect(COMMERCIAL_LOAN_TRACE.stages).toHaveLength(5)
  })

  it('has every call inside the step that made it', () => {
    for (const step of COMMERCIAL_LOAN_TRACE.steps) {
      for (const call of step.calls ?? []) {
        expect(call.startedAt + call.duration).toBeLessThanOrEqual((step.duration ?? 0) + 1e-6)
      }
    }
  })

  it('never lets a step begin before the run could have reached it', () => {
    for (const step of COMMERCIAL_LOAN_TRACE.steps) {
      if (step.startedAt === undefined) continue
      expect(step.startedAt + (step.duration ?? 0)).toBeLessThanOrEqual(
        COMMERCIAL_LOAN_TRACE.elapsed + 1e-6,
      )
    }
  })
})
