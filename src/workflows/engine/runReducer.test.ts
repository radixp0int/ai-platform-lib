import { describe, expect, it } from 'vitest'
import { LOG_CAP, initialRunState, runReducer } from './runReducer'
import type { LogEntry, RunAction, RunGraph, RunState } from './types'

// A three-step run. Only what the reducer reads is filled in.
function graph(): RunGraph {
  const steps = ['intake', 'credit', 'approve'].map((id, i) => ({
    id,
    kind: 'tool' as const,
    title: id,
    meta: '',
    stageId: 'review',
    detail: {},
    x: i * 200,
    y: 0,
  }))
  return {
    steps,
    stepById: new Map(steps.map((step) => [step.id, step])),
    stages: [
      { id: 'review', name: 'Review', sub: '3 steps', status: 'current' },
      { id: 'close', name: 'Close', sub: '1 step', status: 'upcoming' },
    ],
    epoch: 1,
  } as unknown as RunGraph
}

const entries = (count: number, from = 0): LogEntry[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `run-${from + i}`,
    at: 0,
    elapsedMs: 0,
    level: 'info',
    text: `entry ${from + i}`,
  }))

const snapshot = (over: Partial<Extract<RunAction, { type: 'snapshot' }>> = {}): RunAction => ({
  type: 'snapshot',
  graph: graph(),
  statuses: { intake: 'done', credit: 'running', approve: 'queued' },
  phase: 'running',
  log: [],
  awaiting: [],
  ...over,
})

const run = (...actions: RunAction[]): RunState => actions.reduce(runReducer, initialRunState())

describe('runReducer', () => {
  describe('snapshot', () => {
    it('takes the graph, the statuses and the phase whole', () => {
      const state = run(snapshot())
      expect(state.graph?.steps).toHaveLength(3)
      expect(state.statuses).toEqual({ intake: 'done', credit: 'running', approve: 'queued' })
      expect(state.phase).toBe('running')
    })

    it('lists the waiting steps in graph order, whatever order the statuses came in', () => {
      const state = run(
        snapshot({ statuses: { approve: 'waiting', credit: 'running', intake: 'waiting' } }),
      )
      expect(state.awaiting).toEqual(['intake', 'approve'])
    })

    it('learns what each open gate accepts', () => {
      const state = run(
        snapshot({
          statuses: { intake: 'done', credit: 'done', approve: 'waiting' },
          awaiting: [{ stepId: 'approve', decisions: ['approved', 'declined'] }],
        }),
      )
      expect(state.decisionsFor).toEqual({ approve: ['approved', 'declined'] })
    })

    it('clears a decision in flight and a standing error', () => {
      const state = run(
        snapshot(),
        { type: 'local/busy', stepId: 'approve' },
        { type: 'error', message: 'Lost the run', recoverable: true },
        snapshot(),
      )
      expect(state.busyStepId).toBeNull()
      expect(state.error).toBeNull()
    })

    it('keeps the newest rows of an oversized log and says how many it dropped', () => {
      const state = run(snapshot({ log: entries(LOG_CAP + 20) }))
      expect(state.log).toHaveLength(LOG_CAP)
      expect(state.log[0].id).toBe('run-20')
      expect(state.logTrimmed).toBe(20)
    })
  })

  describe('step', () => {
    it('changes one status and leaves the graph alone, so the canvas does not rebuild', () => {
      const before = run(snapshot())
      const after = runReducer(before, {
        type: 'step',
        stepId: 'credit',
        change: { status: 'done' },
      })
      expect(after.statuses).toEqual({ intake: 'done', credit: 'done', approve: 'queued' })
      expect(after.graph).toBe(before.graph)
    })

    it('returns the same state for a status the step already has', () => {
      const before = run(snapshot())
      const after = runReducer(before, {
        type: 'step',
        stepId: 'credit',
        change: { status: 'running' },
      })
      expect(after).toBe(before)
    })

    it('patches the step for a detail change and keeps the status map as it was', () => {
      const before = run(snapshot())
      const after = runReducer(before, {
        type: 'step',
        stepId: 'credit',
        change: { meta: 'Score 712', assignee: 'Dana W.' },
      })
      expect(after.statuses).toBe(before.statuses)
      expect(after.graph?.stepById.get('credit')).toMatchObject({
        meta: 'Score 712',
        assignee: 'Dana W.',
      })
      expect(after.graph?.steps.find((step) => step.id === 'credit')).toBe(
        after.graph?.stepById.get('credit'),
      )
      // The other steps are the same objects they were.
      expect(after.graph?.steps[0]).toBe(before.graph?.steps[0])
    })

    it('never moves the epoch, so a patch cannot make the canvas refit', () => {
      const before = run(snapshot())
      const after = runReducer(before, {
        type: 'step',
        stepId: 'credit',
        change: { status: 'done', meta: 'Score 712' },
      })
      expect(after.graph).not.toBe(before.graph)
      expect(after.graph?.epoch).toBe(before.graph?.epoch)
    })

    it('ignores a detail patch for a step the graph does not have', () => {
      const before = run(snapshot())
      const after = runReducer(before, {
        type: 'step',
        stepId: 'missing',
        change: { meta: 'nobody home' },
      })
      expect(after).toBe(before)
    })

    it('adds a step to "needs you" when it starts waiting', () => {
      const state = run(snapshot(), {
        type: 'step',
        stepId: 'approve',
        change: { status: 'waiting' },
      })
      expect(state.awaiting).toEqual(['approve'])
    })

    it('settles a decision once the step leaves waiting', () => {
      const state = run(
        snapshot({ statuses: { intake: 'done', credit: 'done', approve: 'waiting' } }),
        { type: 'awaiting', stepId: 'approve', decisions: ['approved', 'changes'] },
        { type: 'local/busy', stepId: 'approve' },
        { type: 'step', stepId: 'approve', change: { status: 'approved' } },
      )
      expect(state.awaiting).toEqual([])
      expect(state.decisionsFor).toEqual({})
      expect(state.busyStepId).toBeNull()
    })

    it('keeps the awaiting list as the same array when it has not changed', () => {
      const before = run(
        snapshot({ statuses: { intake: 'done', credit: 'running', approve: 'waiting' } }),
      )
      const after = runReducer(before, {
        type: 'step',
        stepId: 'credit',
        change: { status: 'done' },
      })
      expect(after.awaiting).toBe(before.awaiting)
    })
  })

  describe('stage', () => {
    it('patches the one stage', () => {
      const state = run(snapshot(), {
        type: 'stage',
        stageId: 'review',
        change: { status: 'done', sub: 'Complete' },
      })
      expect(state.graph?.stages).toEqual([
        { id: 'review', name: 'Review', sub: 'Complete', status: 'done' },
        { id: 'close', name: 'Close', sub: '1 step', status: 'upcoming' },
      ])
    })

    it('has nothing to patch before the first snapshot', () => {
      const before = initialRunState()
      expect(
        runReducer(before, { type: 'stage', stageId: 'review', change: { status: 'done' } }),
      ).toBe(before)
    })
  })

  describe('log', () => {
    it('appends in order', () => {
      const state = run(snapshot({ log: entries(2) }), { type: 'log', entries: entries(2, 2) })
      expect(state.log.map((entry) => entry.id)).toEqual(['run-0', 'run-1', 'run-2', 'run-3'])
      expect(state.logTrimmed).toBe(0)
    })

    it('drops from the head past the cap and keeps a running count', () => {
      const state = run(
        snapshot({ log: entries(LOG_CAP) }),
        { type: 'log', entries: entries(5, LOG_CAP) },
        { type: 'log', entries: entries(3, LOG_CAP + 5) },
      )
      expect(state.log).toHaveLength(LOG_CAP)
      expect(state.log[0].id).toBe('run-8')
      expect(state.log.at(-1)?.id).toBe(`run-${LOG_CAP + 7}`)
      expect(state.logTrimmed).toBe(8)
    })

    it('keeps the same log array when there is nothing to add', () => {
      const before = run(snapshot({ log: entries(2) }))
      expect(runReducer(before, { type: 'log', entries: [] }).log).toBe(before.log)
    })
  })

  describe('decisions and errors', () => {
    it('marks a decision as in flight, once', () => {
      const busy = run(snapshot(), { type: 'local/busy', stepId: 'approve' })
      expect(busy.busyStepId).toBe('approve')
      expect(runReducer(busy, { type: 'local/busy', stepId: 'approve' })).toBe(busy)
    })

    it('gives the buttons back when a gate reopens for the busy step', () => {
      const state = run(
        snapshot(),
        { type: 'local/busy', stepId: 'approve' },
        { type: 'awaiting', stepId: 'approve', decisions: ['approved'] },
      )
      expect(state.busyStepId).toBeNull()
      expect(state.decisionsFor.approve).toEqual(['approved'])
    })

    it('gives the buttons back on an error, and carries on if it is recoverable', () => {
      const state = run(
        snapshot(),
        { type: 'local/busy', stepId: 'approve' },
        { type: 'error', message: 'Decision rejected', code: 'conflict', recoverable: true },
      )
      expect(state.busyStepId).toBeNull()
      expect(state.error).toEqual({ message: 'Decision rejected', code: 'conflict' })
      expect(state.phase).toBe('running')
    })

    it('fails the run on an error it cannot recover from', () => {
      const state = run(snapshot(), { type: 'error', message: 'Run lost', recoverable: false })
      expect(state.phase).toBe('failed')
    })
  })

  describe('phase and connection', () => {
    it('returns the same state when told what it already knows', () => {
      const before = run(snapshot(), { type: 'connection', state: 'open' })
      expect(runReducer(before, { type: 'phase', phase: 'running' })).toBe(before)
      expect(runReducer(before, { type: 'connection', state: 'open' })).toBe(before)
    })

    it('records a change', () => {
      const state = run(
        snapshot(),
        { type: 'phase', phase: 'paused' },
        { type: 'connection', state: 'closed' },
      )
      expect(state.phase).toBe('paused')
      expect(state.connection).toBe('closed')
    })
  })
})
