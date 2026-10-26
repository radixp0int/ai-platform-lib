import type { RunTrace, TraceStageState, TraceStageSummary, TraceStep } from './types'

// Reading a trace: durations in words, a stage's state from its steps, and the
// place a reader should land first. Plain functions, so a host can derive the
// same things from its own data.

/** "0.4s", "41.2s", "2m 05s", "3h 12m". Tenths only where they still matter. */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  if (seconds < 3600) return `${minutes}m ${String(Math.floor(seconds % 60)).padStart(2, '0')}s`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

/** When something began, relative to what it sits inside: "+7.8s". */
export const formatOffset = (seconds: number): string => `+${formatDuration(seconds)}`

/** "21.1k" for the thousands, the whole number below that. */
export const formatTokens = (count: number): string =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count)

function stateOf(steps: TraceStep[]): TraceStageState {
  if (steps.some((step) => step.status === 'waiting')) return 'waiting'
  if (steps.some((step) => step.status === 'running')) return 'running'
  if (steps.some((step) => step.status === 'failed')) return 'failed'
  if (steps.every((step) => step.status === 'queued')) return 'queued'
  return 'done'
}

function labelOf(state: TraceStageState, steps: TraceStep[]): string {
  switch (state) {
    case 'waiting':
      return 'Needs a person'
    case 'running':
      return 'Running'
    case 'failed':
      return `${steps.filter((step) => step.status === 'failed').length} failed`
    case 'queued':
      return 'Queued'
    default:
      return 'Done'
  }
}

/** Each stage of a run, reduced to what its tile draws. */
export function summarizeStages(trace: RunTrace): TraceStageSummary[] {
  return trace.stages.map((stage) => {
    const steps = trace.steps.filter((step) => step.stageId === stage.id)
    const begun = steps.filter((step) => step.startedAt !== undefined)
    const state = stateOf(steps)
    return {
      id: stage.id,
      name: stage.name,
      state,
      stateLabel: labelOf(state, steps),
      stepCount: steps.length,
      duration: begun.length
        ? Math.max(...begun.map((step) => (step.startedAt ?? 0) + (step.duration ?? 0))) -
          Math.min(...begun.map((step) => step.startedAt ?? 0))
        : undefined,
      marks: steps.map((step) => step.status),
    }
  })
}

/**
 * Where a reader should land: the stage that is waiting, else the one that is
 * running, else the last one that began. A finished run opens on its last stage.
 */
export function currentStageId(stages: TraceStageSummary[]): string {
  const live =
    stages.find((stage) => stage.state === 'waiting') ??
    stages.find((stage) => stage.state === 'running')
  if (live) return live.id
  const begun = stages.filter((stage) => stage.state !== 'queued')
  return (begun[begun.length - 1] ?? stages[0]).id
}

/** The step to open in a stage: the one still going, else the first one. */
export function currentStepId(trace: RunTrace, stageId: string): string | undefined {
  const steps = trace.steps.filter((step) => step.stageId === stageId)
  return (
    steps.find((step) => step.status === 'waiting') ??
    steps.find((step) => step.status === 'running') ??
    steps.find((step) => step.status === 'failed') ??
    steps[0]
  )?.id
}

/** The step as a plain record, for the raw view. */
export function spanRecord(step: TraceStep, runId: string): string {
  return JSON.stringify(
    {
      span_id: step.id,
      run_id: runId,
      stage: step.stageId,
      kind: step.kind,
      status: step.status,
      started_at_s: step.startedAt ?? null,
      duration_s: step.duration ?? null,
      usage: step.usage
        ? {
            model: step.usage.model,
            input_tokens: step.usage.inputTokens,
            output_tokens: step.usage.outputTokens,
          }
        : undefined,
      calls: step.calls?.map((call) => ({
        kind: call.kind,
        label: call.label,
        started_at_s: call.startedAt,
        duration_s: call.duration,
      })),
      input: step.input,
      output: step.output,
    },
    null,
    2,
  )
}
