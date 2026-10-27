import type { StepKind, StepStatus } from '../types'

// What a run's trace page reads. It is a record of work already done or under
// way, not a layout: the canvas draws a run's shape, this describes what each
// step did, how long it took, and what went in and came out.

/** A call made inside a step: the model, or a tool the step reached for. */
export type TraceCallKind = 'model' | 'tool'

export type TraceCall = {
  id: string
  kind: TraceCallKind
  /** What the call was for. A tool call names the tool, in the mono face. */
  label: string
  /** Seconds after the step began. */
  startedAt: number
  /** Seconds. */
  duration: number
}

/** What a step that called a model spent. */
export type TraceUsage = {
  model: string
  inputTokens: number
  outputTokens: number
}

export type TraceStep = {
  id: string
  stageId: string
  kind: StepKind
  title: string
  status: StepStatus
  /** Tool names read best in the mono face. */
  mono?: boolean
  /** Seconds after the run began. Absent until the step has started. */
  startedAt?: number
  /** Seconds. For a step still going, how long so far. Absent until it starts. */
  duration?: number
  /** One line: what the step came to. Shown in the step list. */
  summary: string
  /** What the step is for. */
  description: string
  /** What went in, as the step saw it. */
  input: string
  /** What came out. */
  output: string
  /** An agent's own account of how it got there, summarized. */
  reasoning?: string
  /** The calls made inside the step, in order. */
  calls?: TraceCall[]
  usage?: TraceUsage
  /** Who a person step is waiting on, or answered. */
  assignee?: string
  /**
   * Why a failed step failed, and what the run did about it. Drawn as a notice
   * above the trace, since a failure that did not stop the run is the thing
   * someone reading a trace most wants to find.
   */
  failure?: string
}

export type TraceStage = { id: string; name: string }

/** Where the run as a whole stands. */
export type TraceRunState = 'running' | 'waiting' | 'done' | 'failed'

export type RunTrace = {
  id: string
  /** The workflow this is a run of. */
  workflow: string
  /** The run's own name: what it is about. */
  title: string
  state: TraceRunState
  startedBy: string
  /** When it began, as the host wants it said: "9:02 AM". */
  startedLabel: string
  /** Seconds since the run began. */
  elapsed: number
  /** Stages, in order. */
  stages: TraceStage[]
  /** Steps in the order they began. */
  steps: TraceStep[]
}

/** How a stage stands, from the steps inside it. */
export type TraceStageState = 'done' | 'running' | 'waiting' | 'failed' | 'queued'

/** A stage reduced to what its tile draws. */
export type TraceStageSummary = {
  id: string
  name: string
  state: TraceStageState
  /** The state in words: "Done", "Needs a person", "1 failed". */
  stateLabel: string
  stepCount: number
  /** Seconds from the first step beginning to the last one ending. Absent when none has begun. */
  duration?: number
  /** One entry per step, in order. */
  marks: StepStatus[]
}
