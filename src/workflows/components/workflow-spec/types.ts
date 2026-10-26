import type { RunInputSpec, RunOutputSpec, StepIO } from '../../engine/wireProtocol'
import type { StepKind } from '../types'

// What a workflow detail page reads: the workflow itself, not any one run of it.
// How it is built, what each stage is for, who decides, and how its runs have
// gone. A run's own trace is `RunTrace`; this is the definition it follows.

/** One step as the workflow defines it. */
export type WorkflowStepSpec = {
  id: string
  kind: StepKind
  title: string
  /** A few words beside the title: "analyst", "$500k+". */
  note?: string
  /** The step runs only on some runs. Drawn dashed. */
  sometimes?: boolean
  /** What it does, in a sentence. */
  does: string
  /** What it reads, in words. */
  reads: string
  /** What it hands on, in words. */
  handsOn: string
  /** Particulars of its kind: who approves, what it can call, what happens if it fails. */
  facts?: [label: string, value: string][]
  /** Its typed inputs and outputs. */
  io?: StepIO
}

export type WorkflowStageSpec = {
  id: string
  name: string
  /** How long the stage usually takes: "0:48", "2h 50m". */
  typicalTime: string
  /** What the stage is for. */
  purpose: string
  /** Steps by column, then top to bottom. Steps in one column run side by side. */
  columns: WorkflowStepSpec[][]
}

export type WorkflowApprover = {
  /** Initials for a named person; absent for a role. */
  initials?: string
  step: string
  who: string
  when: string
}

export type WorkflowRunState = 'waiting' | 'running' | 'done' | 'stopped'

/** One past or live run, as a row of the Runs tab. */
export type WorkflowRunRow = {
  id: string
  name: string
  startedBy: string
  /** What it came to: "Waiting on Dana W.", "Approved". */
  result: string
  state: WorkflowRunState
  /** How many stages it finished. */
  stagesDone: number
  /** In words: "Stage 4 of 5 · Approve". */
  progress: string
  started: string
  /** How long it took. Absent while it is going. */
  took?: string
}

export type WorkflowVersionRow = {
  id: string
  change: string
  meta: string
  /** The version runs start on today. */
  current?: boolean
}

export type WorkflowLiveRun = {
  state: 'waiting' | 'running'
  title: string
  sub: string
}

export type WorkflowSpec = {
  id: string
  name: string
  description: string
  owner: string
  /** What starts a run, completing "Starts when …". */
  startsWhen: string
  /** "v12 · edited 26 Sep by Dana W." */
  version: string
  /** The next version a draft would become: "v13". */
  nextVersion: string
  liveRun?: WorkflowLiveRun
  stages: WorkflowStageSpec[]
  inputs: RunInputSpec[]
  outputs: RunOutputSpec[]
  approvers: WorkflowApprover[]
  /** Systems the workflow reaches, in the mono face. */
  systems: string[]
  stats: [label: string, value: string][]
  statsNote: string
  /** "Typical time, last 31 runs". */
  timeNote: string
  runs: WorkflowRunRow[]
  /** How many runs there are in all, of which `runs` shows the latest. */
  runsTotal: number
  versions: WorkflowVersionRow[]
  draftNote: string
}
