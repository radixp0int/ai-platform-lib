// In-process playback for the authored story fixtures. Work completes immediately;
// human gates remain interactive. No timers, sockets, or dependency on the server.
import { feeds, never } from '../../components'
import { placeRun } from '../../engine/layout'
import type { RunEvent, RunGraph, RunSource } from '../../engine/types'
import type { Decision, LogEntry, StepIO, WireRun, WireStepStatus } from '../../engine/wireProtocol'
import type { RunScript, ScriptStep, WorkStep } from '../../fixtures/script-types'

type Gate = Extract<ScriptStep, { kind: 'gate' | 'gateAll' }>
export type FixtureRunOptions = {
  decisions?: Record<string, Decision>
  /** Freeze an intermediate state, such as a failed verification or its retry. */
  stopAt?: { stepId: string; status: WireStepStatus }
}
const START = Date.parse('2026-10-04T10:00:00Z')

/** The statuses at which a step's outputs exist. Mirrors `resolveStepIO`. */
const PRODUCES = new Set<WireStepStatus>(['done', 'approved'])

/** A step's I/O with its output values in or out, by whether it has produced them. */
function ioAt(authored: StepIO, status: WireStepStatus): StepIO {
  const produced = PRODUCES.has(status)
  return {
    inputs: authored.inputs,
    outputs: authored.outputs.map(({ value, ...output }) =>
      produced && value !== undefined ? { ...output, value } : output,
    ),
  }
}

export function createFixtureRunSource(
  script: RunScript,
  options: FixtureRunOptions = {},
): RunSource {
  const listeners = new Set<(event: RunEvent) => void>()
  let run: WireRun
  let queue: ScriptStep[]
  let pending: Map<string, Gate>
  let log: LogEntry[]
  let elapsedMs: number
  let epoch = 0
  let stopped = false
  let paused = false
  let layout: ReturnType<typeof placeRun>
  /** The run's start values. Kept across restarts; a new `start` replaces them. */
  let inputs = { ...script.defaultInputs }
  /** Each step's I/O as the script wrote it, values included. */
  const authoredIO = new Map(
    script.steps.flatMap((step) => (step.io ? [[step.id, step.io] as const] : [])),
  )

  function addLog(level: LogEntry['level'], text: string, stepId?: string, source?: string) {
    log.push({
      id: `${script.id}-${log.length}`,
      at: START + elapsedMs,
      elapsedMs,
      level,
      text,
      stepId,
      source,
    })
  }
  function patch(
    stepId: string,
    status: WireStepStatus,
    patch: Partial<WireRun['steps'][number]> = {},
  ) {
    const step = run.steps.find((item) => item.id === stepId)
    if (!step) throw new Error(`Unknown fixture step: ${stepId}`)
    run.statuses[stepId] = status
    Object.assign(step, patch)
    const authored = authoredIO.get(stepId)
    if (authored) step.io = ioAt(authored, status)
    if (options.stopAt?.stepId === stepId && options.stopAt.status === status) stopped = true
  }
  function finishWork(step: WorkStep, start: number) {
    elapsedMs = start + step.durationMs
    patch(step.stepId, step.outcome ?? 'done', {
      meta: step.meta,
      ...(step.detail && { detail: structuredClone(step.detail) }),
      ...(step.content && { content: structuredClone(step.content) }),
    })
    addLog(step.outcome === 'failed' ? 'error' : 'info', step.log ?? step.meta, step.stepId)
  }
  function advance() {
    while (queue.length && pending.size === 0 && !stopped) {
      const step = queue.shift()!
      switch (step.kind) {
        case 'work': {
          if (step.startLog) addLog('info', step.startLog, step.stepId)
          finishWork(step, elapsedMs)
          break
        }
        case 'parallel': {
          const start = elapsedMs
          for (const item of [...step.steps].sort((a, b) => a.durationMs - b.durationMs))
            finishWork(item, start)
          break
        }
        case 'status': {
          elapsedMs += step.afterMs ?? 0
          patch(step.stepId, step.status, {
            ...(step.meta !== undefined && { meta: step.meta }),
            ...(step.statusLabel !== undefined && { statusLabel: step.statusLabel }),
            ...(step.detail && { detail: structuredClone(step.detail) }),
          })
          break
        }
        case 'stage': {
          const stage = run.stages.find((item) => item.id === step.stageId)
          if (!stage) throw new Error(`Unknown fixture stage: ${step.stageId}`)
          stage.status = step.status
          if (step.sub !== undefined) stage.sub = step.sub
          break
        }
        case 'log':
          addLog(step.level, step.text, step.stepId, step.source)
          break
        case 'skip':
          for (const id of step.stepIds) patch(id, 'skipped')
          if (step.log) addLog('warn', step.log)
          break
        case 'wait':
          elapsedMs += step.ms
          break
        case 'gate':
        case 'gateAll': {
          const gates = step.kind === 'gate' ? [step] : step.gates
          for (const gate of gates) {
            pending.set(gate.stepId, step)
            patch(gate.stepId, 'waiting', { statusLabel: gate.dueLabel })
            addLog('human', 'Waiting on a decision', gate.stepId)
          }
          break
        }
      }
    }
    run.awaiting = [...pending].map(([stepId, gate]) => {
      const item = gate.kind === 'gate' ? gate : gate.gates.find((item) => item.stepId === stepId)!
      return { stepId, decisions: item.decisions, dueLabel: item.dueLabel }
    })
    run.phase = paused
      ? 'paused'
      : pending.size
        ? 'awaiting'
        : stopped || queue.length
          ? 'running'
          : 'finished'
  }
  function decide(stepId: string, decision: Decision, note?: string) {
    const gate = pending.get(stepId)
    const open = run.awaiting.find((item) => item.stepId === stepId)
    if (!gate || !open?.decisions.includes(decision) || paused) return
    pending.delete(stepId)
    patch(stepId, decision === 'declined' ? 'failed' : decision, {
      meta:
        decision === 'approved'
          ? 'Approved'
          : decision === 'declined'
            ? 'Declined'
            : 'Changes requested',
      statusLabel: undefined,
    })
    addLog('human', note ? `${decision} — ${note}` : decision, stepId, script.actor.name)
    if (gate.kind === 'gate') queue.unshift(...(gate.branches[decision] ?? []))
    else if (decision === 'declined') {
      for (const [id, other] of pending)
        if (other === gate) {
          patch(id, 'skipped', { meta: 'Approval no longer required', statusLabel: undefined })
          pending.delete(id)
        }
      queue.unshift(...(gate.onDecline ?? []))
    } else if (![...pending.values()].includes(gate)) queue.unshift(...gate.afterGates)
    advance()
  }
  function reset() {
    epoch++
    const copy = structuredClone(script)
    run = {
      runId: `story-${script.id}`,
      variantId: script.id,
      title: script.title,
      header: copy.header,
      actor: copy.actor,
      stages: copy.stages,
      steps: copy.steps,
      edges: copy.edges,
      statuses: copy.initialStatuses,
      phase: 'running',
      awaiting: [],
      focusStepId: script.focusStepId,
      inputs: { ...inputs },
    }
    for (const step of run.steps) {
      const authored = authoredIO.get(step.id)
      if (authored) step.io = ioAt(authored, run.statuses[step.id])
    }
    queue = copy.play
    pending = new Map()
    log = []
    elapsedMs = 0
    stopped = false
    paused = false
    advance()
    for (const [stepId, decision] of Object.entries(options.decisions ?? {}))
      decide(stepId, decision)
    run.focusStepId = options.stopAt?.stepId ?? run.awaiting[0]?.stepId ?? script.focusStepId
    layout = placeRun(run.steps, run.stages)
  }
  function snapshot(): RunEvent {
    const steps = layout.steps.map((placed) => {
      const current = run.steps.find((step) => step.id === placed.id)!
      return {
        ...placed,
        meta: current.meta,
        detail: current.detail,
        statusLabel: current.statusLabel,
        content: current.content,
      }
    })
    const io: Record<string, StepIO> = {}
    for (const step of run.steps) if (step.io) io[step.id] = step.io
    const graph: RunGraph = {
      lanes: layout.lanes,
      laneTop: layout.laneTop,
      laneBottom: layout.laneBottom,
      runId: run.runId,
      variantId: run.variantId,
      title: run.title,
      header: run.header,
      actor: run.actor,
      stages: run.stages.map((stage) => ({ ...stage })),
      steps,
      stepById: new Map(steps.map((step) => [step.id, step])),
      edges: run.edges.map(({ from, to, rule }) => ({
        from,
        to,
        state: rule === 'never' ? never : feeds(to),
      })),
      focusStepId: run.focusStepId,
      io,
      inputs: { ...run.inputs },
      epoch,
    }
    return {
      type: 'snapshot',
      graph,
      statuses: { ...run.statuses },
      phase: run.phase,
      log: [...log],
      awaiting: [...run.awaiting],
    }
  }
  function publish() {
    const event = snapshot()
    for (const listener of listeners) listener(event)
  }
  reset()
  return {
    /* One variant, so the outline draws no switcher — but the page can still
       find what this run asks for when it is started again. */
    variants: [
      {
        id: script.id,
        label: script.label,
        blurb: script.blurb,
        inputs: script.inputs,
        outputs: script.outputs,
      },
    ],
    subscribe(listener) {
      listeners.add(listener)
      listener(snapshot())
      listener({ type: 'connection', state: 'open' })
      return () => listeners.delete(listener)
    },
    start(_variantId, given) {
      if (given) inputs = { ...given }
      reset()
      publish()
    },
    decide(stepId, decision, note) {
      decide(stepId, decision, note)
      publish()
    },
    control(action) {
      if (action === 'restart') reset()
      else if (action === 'pause') {
        paused = true
        advance()
      } else {
        paused = false
        stopped = false
        advance()
      }
      publish()
    },
  }
}
