// A run's record, laid out for the canvas. The Details view reads the run as a
// `RunTrace`; the canvas wants a `RunGraph` with positions and edges. Both come
// from one record here, so the two views of a run can't disagree.
import { feeds, type EdgeSeed, type StatusMap } from '../../../workflows/components'
import { summarizeStages, type RunTrace } from '../../../workflows/components/run-trace'
import { placeRun, type LogEntry, type RunGraph } from '../../../workflows/engine'
import type { WireStage, WireStep } from '../../../workflows/engine/wireProtocol'
import type { RunRecord } from '../fixtures/runs'

/** The kit's stage states: done, the one the run is on, and those still to come. */
export function stageStates(trace: RunTrace): WireStage['status'][] {
  const summaries = summarizeStages(trace)
  const at = summaries.findIndex((s) => s.state === 'waiting' || s.state === 'running')
  return summaries.map((s, i) =>
    i === at
      ? 'current'
      : s.state === 'queued'
        ? 'upcoming'
        : at >= 0 && i > at
          ? 'upcoming'
          : 'done',
  )
}

/** Each column joined to the next, like for like, as the blueprint does. */
function edgesOf(steps: WireStep[]): EdgeSeed[] {
  const columns = new Map<number, WireStep[]>()
  for (const step of steps) columns.set(step.column, [...(columns.get(step.column) ?? []), step])
  const order = [...columns.keys()].sort((a, b) => a - b)
  return order.slice(0, -1).flatMap((c, k) => {
    const here = columns.get(c)!.sort((a, b) => a.row - b.row)
    const next = columns.get(order[k + 1])!.sort((a, b) => a.row - b.row)
    return here.flatMap((a, i) =>
      next.flatMap((b, j) => {
        const joined =
          here.length === 1 ||
          next.length === 1 ||
          i === j ||
          (i === here.length - 1 && j > i) ||
          (j === next.length - 1 && i > j)
        return joined ? [{ from: a.id, to: b.id, state: feeds(b.id) }] : []
      }),
    )
  })
}

export function graphOf(run: RunRecord): { graph: RunGraph; statuses: StatusMap } {
  const { trace } = run
  const states = stageStates(trace)
  const stages: WireStage[] = trace.stages.map((stage, i) => {
    const count = trace.steps.filter((s) => s.stageId === stage.id).length
    return {
      id: stage.id,
      name: stage.name,
      sub: `${count} step${count === 1 ? '' : 's'}`,
      status: states[i],
    }
  })
  const wire: WireStep[] = trace.steps.map((step) => {
    const [column, row] = run.layout[step.id] ?? [0, 0]
    return {
      id: step.id,
      kind: step.kind,
      stageId: step.stageId,
      title: step.title,
      meta: step.summary,
      mono: step.mono,
      statusLabel: step.status === 'waiting' ? step.due : undefined,
      assignee: step.assignee,
      column,
      row,
      detail: { summary: step.description, rows: [] },
    }
  })
  const placed = placeRun(wire, stages)
  const focus = trace.steps.find((s) => s.status === 'waiting' || s.status === 'failed')
  const graph: RunGraph = {
    runId: trace.id,
    variantId: run.workflowId,
    title: trace.workflow,
    header: { primary: run.subject, secondary: trace.workflow, tertiary: `Run ${trace.id}` },
    actor: { initials: 'JO', name: 'You', role: '' },
    stages: stages.map((s) => ({ id: s.id, name: s.name, sub: s.sub, status: s.status })),
    steps: placed.steps,
    stepById: new Map(placed.steps.map((s) => [s.id, s])),
    edges: edgesOf(wire),
    lanes: placed.lanes,
    laneTop: placed.laneTop,
    laneBottom: placed.laneBottom,
    focusStepId: focus?.id,
    io: {},
    inputs: {},
    epoch: 0,
  }
  const statuses: StatusMap = Object.fromEntries(trace.steps.map((s) => [s.id, s.status]))
  return { graph, statuses }
}

/** The run log, from each step's history: what the Run log panel lists. */
export function logOf(run: RunRecord): LogEntry[] {
  return run.trace.steps.flatMap((step) =>
    step.startedAt === undefined
      ? []
      : [
          {
            id: `${step.id}-start`,
            at: 0,
            elapsedMs: step.startedAt * 1000,
            level:
              step.status === 'failed' ? 'error' : step.status === 'waiting' ? 'human' : 'info',
            stepId: step.id,
            source: step.title,
            text: step.summary,
          } satisfies LogEntry,
        ],
  )
}
