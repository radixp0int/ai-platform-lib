import { describe, expect, it } from 'vitest'
import { RECENT_RUNS, WORKFLOW_SUMMARIES } from './workflowSummaries'

const byId = (id: string) => WORKFLOW_SUMMARIES.find((w) => w.id === id)!
const statuses = (id: string) =>
  byId(id).stages.flatMap((stage) => stage.columns.flat().map((step) => step.status))

describe('the workflow summaries', () => {
  it('is one page of ten, each with a unique id and unique step ids', () => {
    expect(WORKFLOW_SUMMARIES).toHaveLength(10)
    expect(new Set(WORKFLOW_SUMMARIES.map((w) => w.id)).size).toBe(10)
    for (const workflow of WORKFLOW_SUMMARIES) {
      const ids = workflow.stages.flatMap((stage) => stage.columns.flat().map((step) => step.id))
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('stops a waiting run at its approvals and nowhere else', () => {
    const loan = byId('loan-review')
    expect(loan.stages.map((s) => s.status)).toEqual([
      'done',
      'done',
      'done',
      'current',
      'upcoming',
    ])
    expect(loan.needs.map((n) => n.title)).toEqual(['Approve credit memo'])
    expect(statuses('loan-review').filter((s) => s === 'waiting')).toHaveLength(1)
    expect(statuses('loan-review')).toContain('skipped')
    expect(loan.now.title).toBe('Approve credit memo')
  })

  it('lists every approval a run is waiting on', () => {
    const onboarding = byId('onboarding')
    expect(onboarding.needs).toHaveLength(2)
    expect(onboarding.now.title).toBe('2 approvals open')
  })

  it('runs only the first column of the stage a running run is on', () => {
    expect(statuses('incident-triage').filter((s) => s === 'running')).toHaveLength(2)
    expect(byId('incident-triage').needs).toEqual([])
  })

  it('leaves an idle workflow unstarted', () => {
    expect(new Set(statuses('kyc-refresh'))).toEqual(new Set(['queued']))
    expect(byId('kyc-refresh').stages.every((s) => s.status === 'upcoming')).toBe(true)
  })

  it('gives the Recent list the one fact worth a glance', () => {
    const recent = new Map(RECENT_RUNS.map((r) => [r.id, r]))
    expect(recent.get('loan-review')!.trailing).toBe('3h 40m')
    expect(recent.get('incident-triage')!.trailing).toBe('Diagnose')
    expect(recent.get('kyc-refresh')!.trailing).toBeUndefined()
  })
})
