// A step's inputs and outputs as they stand in this run. Pure — no React.
//
// Values are stored once, on outputs. An input only names its source, and is
// resolved here against that source's output and the source step's status: so
// "Not ready yet" is not something a server can forget to clear, it follows from
// the source not being done.
import type { StatusMap, StepStatus } from '../components/index'
import type { RunGraph } from './types'
import type { IoType, RunInputSpec, StepIO, WireEdge } from './wireProtocol'

/** One row of the I/O block. `ready` false draws the value as a pending note. */
export type IoCell = {
  name: string
  type: IoType
  /** Where an input comes from, written out. Absent on an output. */
  source?: string
  value: string
  ready: boolean
}

export type ResolvedIO = { inputs: IoCell[]; outputs: IoCell[] }

/** The statuses at which a step's outputs exist. An approval produces its decision. */
const PRODUCED: ReadonlySet<StepStatus> = new Set(['done', 'approved'])

/** What an output says in place of a value, by its step's status. */
export const PENDING_OUTPUT: Record<StepStatus, string> = {
  done: 'Produced',
  approved: 'Produced',
  running: 'Being produced',
  waiting: 'Waiting on this step',
  queued: 'Not produced yet',
  skipped: 'Skipped on this run',
  failed: 'Not produced: the step failed',
  changes: 'Sent back for changes',
}

/** What an input says while its source step has not produced it. */
const PENDING_INPUT: Partial<Record<StepStatus, string>> = {
  skipped: 'Skipped on this run',
  failed: 'Source step failed',
}
const NOT_READY = 'Not ready yet'
const NOT_PROVIDED = 'Not provided'
export const RUN_SOURCE = 'the run’s inputs'

export function resolveStepIO(
  graph: RunGraph,
  statuses: StatusMap,
  stepId: string,
): ResolvedIO | null {
  const io = graph.io[stepId]
  if (!io) return null

  const inputs = io.inputs.map((input): IoCell => {
    const base = { name: input.name, type: input.type }
    if ('run' in input.from) {
      const given = graph.inputs[input.from.run]
      return {
        ...base,
        source: RUN_SOURCE,
        value: given || NOT_PROVIDED,
        ready: !!given,
      }
    }
    const { step, output } = input.from
    const source = graph.stepById.get(step)?.title ?? step
    const status = statuses[step]
    if (status && PRODUCED.has(status)) {
      const value = graph.io[step]?.outputs.find((o) => o.name === output)?.value
      return { ...base, source, value: value ?? PENDING_OUTPUT[status], ready: true }
    }
    return {
      ...base,
      source,
      value: (status && PENDING_INPUT[status]) || NOT_READY,
      ready: false,
    }
  })

  const status = statuses[stepId] ?? 'queued'
  const produced = PRODUCED.has(status)
  const outputs = io.outputs.map((output): IoCell => ({
    name: output.name,
    type: output.type,
    value: (produced && output.value) || PENDING_OUTPUT[status],
    ready: produced,
  }))

  return { inputs, outputs }
}

/** The shape `validateIO` checks: a wire run, or a fixture script, which share it. */
type Wiring = {
  steps: { id: string; title: string; kind: string; io?: StepIO }[]
  edges: Pick<WireEdge, 'from' | 'to'>[]
}

/**
 * Everything wrong with a run's I/O wiring, as sentences. Empty means sound.
 *
 * A step input must name a step that exists, comes before it — reaches it along
 * the edges — and declares that output; a run input must name a declared run
 * input. Reported rather than thrown, so a server can refuse a run with all of
 * them at once.
 */
export function validateIO(run: Wiring, runInputs: RunInputSpec[] = []): string[] {
  const problems: string[] = []
  const byId = new Map(run.steps.map((s) => [s.id, s]))
  const declared = new Set(runInputs.map((i) => i.name))

  const next = new Map<string, string[]>()
  for (const { from, to } of run.edges) next.set(from, [...(next.get(from) ?? []), to])
  const reaches = (from: string, to: string) => {
    const seen = new Set<string>()
    const stack = [from]
    while (stack.length) {
      const id = stack.pop()!
      if (id === to) return true
      if (seen.has(id)) continue
      seen.add(id)
      stack.push(...(next.get(id) ?? []))
    }
    return false
  }

  for (const step of run.steps) {
    for (const { name, from } of step.io?.inputs ?? []) {
      const where = `${step.id}.${name}`
      if ('run' in from) {
        if (!declared.has(from.run))
          problems.push(`${where} reads run input "${from.run}", which is not declared`)
        continue
      }
      const source = byId.get(from.step)
      if (!source) {
        problems.push(`${where} reads from unknown step "${from.step}"`)
        continue
      }
      if (!source.io?.outputs.some((o) => o.name === from.output))
        problems.push(`${where} reads "${from.output}", which ${source.id} does not output`)
      if (source.id === step.id || !reaches(source.id, step.id))
        problems.push(`${where} reads from ${source.id}, which does not come before it`)
    }
  }
  return problems
}
