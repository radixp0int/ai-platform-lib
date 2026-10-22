// The seam between "what a run is" and "where a run comes from".
//
// This mirrors `Responder` in ai-platform-lib/chat (engine/chatEngine.ts): the page knows only
// `RunSource`, and the two implementations — a hard-coded run and a WebSocket
// server — are interchangeable behind it. Nothing in here imports React.
import type {
  EdgeSeed,
  StageSeed,
  StageStatus,
  StatusMap,
  StepContent,
  StepSeed,
  StepStatus,
} from '../components/index'
import type {
  ControlAction,
  Decision,
  LogEntry,
  OpenGate,
  RunActor,
  RunDetail,
  RunHeader,
  RunPhase,
  StepIO,
  VariantInfo,
} from './wireProtocol'

export type { ControlAction, Decision, LogEntry, OpenGate, RunPhase, VariantInfo }

export type Lane = { x: number; w: number }

/**
 * Everything structural about a run, resolved once per snapshot: positions are
 * pixels by the time they get here, and edge rules are back to being the
 * functions the canvas kit wants.
 */
export type RunGraph = {
  runId: string
  variantId: string
  title: string
  header: RunHeader
  actor: RunActor
  stages: StageSeed[]
  steps: StepSeed<RunDetail>[]
  stepById: Map<string, StepSeed<RunDetail>>
  edges: EdgeSeed[]
  /** Lane geometry behind the steps. */
  lanes: Record<string, Lane>
  laneTop: number
  laneBottom: number
  focusStepId?: string
  /**
   * Each step's inputs and outputs, by step id. Beside the steps rather than on
   * them: the seeds are the canvas kit's type, and the kit never reads I/O.
   */
  io: Record<string, StepIO>
  /** The values the run was started with, by input name. */
  inputs: Record<string, string>
  /**
   * Bumped only when the node set or their positions change — i.e. on a
   * snapshot, never on a status or detail patch. The canvas refits on this, and
   * refitting on every status change would yank the viewport out from under the
   * reader several times a second.
   */
  epoch: number
}

/** A step's mutable half. The canvas reads `status`; the panels read the rest. */
export type StepChange = {
  status?: StepStatus
  meta?: string
  statusLabel?: string
  assignee?: string
  content?: StepContent
  detail?: RunDetail
  /** A whole replacement, like `detail`. */
  io?: StepIO
}

export type StageChange = { status?: StageStatus; sub?: string }

export type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed'

/** What a source tells the page. The reducer below is the only thing that reads it. */
export type RunEvent =
  | {
      type: 'snapshot'
      graph: RunGraph
      statuses: StatusMap
      phase: RunPhase
      log: LogEntry[]
      /** Gates already open when this snapshot was taken. */
      awaiting: OpenGate[]
    }
  | { type: 'step'; stepId: string; change: StepChange }
  | { type: 'stage'; stageId: string; change: StageChange }
  | { type: 'log'; entries: LogEntry[] }
  | { type: 'awaiting'; stepId: string; decisions: Decision[] }
  | { type: 'phase'; phase: RunPhase }
  | { type: 'connection'; state: ConnectionState }
  | { type: 'error'; message: string; code?: string; recoverable: boolean }

/** What the page dispatches itself, alongside everything the source sends. */
export type RunAction = RunEvent | { type: 'local/busy'; stepId: string }

export type RunState = {
  graph: RunGraph | null
  statuses: StatusMap
  phase: RunPhase
  log: LogEntry[]
  /** How many entries the cap has dropped, so the log can admit to it. */
  logTrimmed: number
  /** Step ids at `waiting`, in graph order. Drives "Needs you". */
  awaiting: string[]
  /** What each waiting step allows. A gate that only approves/declines is real. */
  decisionsFor: Record<string, Decision[]>
  /** A decision is in flight — the source hasn't confirmed it yet. */
  busyStepId: string | null
  connection: ConnectionState
  error: { message: string; code?: string } | null
}

/**
 * Where a run comes from. `subscribe` returns its own unsubscribe, the way an
 * effect wants; everything else is fire-and-forget, because the answer comes
 * back as an event like any other.
 */
export type RunSource = {
  subscribe(listener: (event: RunEvent) => void): () => void
  /** `inputs` are the start form's values, by input name. */
  start(variantId: string, inputs?: Record<string, string>): void
  decide(stepId: string, decision: Decision, note?: string): void
  control(action: ControlAction): void
  /** Empty when there is nothing to switch between — the static source. */
  variants: VariantInfo[]
}
