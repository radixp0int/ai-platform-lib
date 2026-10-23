/**
 * Wire protocol for the workflow run server.
 *
 * Keep the protocol types compatible with workflow-ws-server/src/types.ts.
 * These are independent checkouts with no shared package or codegen, so wire
 * changes must be coordinated with the server. Client documentation may differ.
 *
 * The names here are deliberately the canvas kit's vocabulary (see
 * ../components/types.ts) so the client can pass most fields straight through. Two
 * places where the wire cannot mirror the kit:
 *
 *   - `EdgeSeed.state` is a *function*, so only the rule crosses (`EdgeRule`)
 *     and the client rehydrates it through the kit's `feeds()` / `never`.
 *   - Steps carry `{column, row}` rather than pixels; the client derives x/y in
 *     ./layout.ts. `x`/`y` remain available as an escape hatch.
 */

/** `flow` is a step that runs another workflow and waits for it. */
export type WireStepKind = 'trigger' | 'agent' | 'tool' | 'human' | 'decision' | 'flow'

export type WireStepStatus =
  | 'done'
  | 'running'
  | 'waiting'
  | 'queued'
  | 'skipped'
  | 'failed'
  | 'approved'
  | 'changes'

export type WireStageStatus = 'done' | 'current' | 'upcoming'

/** The two edge rules the kit ships. `never` is a branch this run won't take. */
export type EdgeRule = 'feeds' | 'never'

/**
 * What a person can do at a gate. Note `declined` has no `WireStepStatus` of
 * its own — a declined step lands on `failed`. That mapping is protocol, not a
 * reducer detail, which is why it is written down here.
 */
export type Decision = 'approved' | 'changes' | 'declined'

export type RunPhase = 'idle' | 'running' | 'paused' | 'awaiting' | 'finished' | 'failed'

export type LogLevel = 'info' | 'warn' | 'error' | 'human'

export type VariantId = 'loan-review' | 'incident-triage' | 'onboarding' | 'rfp-response'

/**
 * What every variant puts in the detail panel. The canvas only carries it — see
 * `StepDetailData` in ../components/types.ts — but the *host's* inspector has to render
 * it, so all three variants share one shape rather than one per run.
 *
 * `recommendation.label` and `exception.label` exist so incident triage can say
 * "Probe failure" where the loan run says "Policy exception", without either the
 * kit or the panel learning what a run is about.
 */
export type RunDetail = {
  summary: string
  /** When this is due, written out. The step's `statusLabel` is the terse
      version the node's marker wants ("3h 40m"); this is the sentence. */
  due?: string
  rows: [string, string][]
  recommendation?: {
    label?: string
    from: string
    verdict: string
    figures: [string, string][]
  }
  exception?: { label?: string; text: string; mitigant: string }
  trace?: [string, string, string][]
}

/**
 * What a node draws under its result line. Every part is optional.
 *
 * Unlike `detail`, the canvas reads this — and lays the run out from it, since
 * it decides how tall and how wide the node is. Send the parts a step will have
 * on the snapshot, even if their values arrive later: a part that first appears
 * in a patch makes the node taller than the space it was given.
 */
export type WireStepContent = {
  /** Label and value pairs, e.g. `['Result', '201 Created']`. */
  facts?: [string, string][]
  /** What a decision can route to. `taken` marks the path this run took. */
  branches?: { when: string; to: string; taken?: boolean }[]
  /** Parts done of a total: an agent's sections, or a sub-workflow's stages. */
  progress?: { done: number; total: number; label: string }
  /** Tools an agent called. */
  tools?: string[]
  /** One line of advice, e.g. what the agent recommends on an approval. */
  note?: string
}

/** What a step or run input carries. Picks the start form's field and the type pill. */
export type IoType =
  | 'text'
  | 'number'
  | 'money'
  | 'date'
  | 'file'
  | 'list'
  | 'object'
  | 'choice'
  | 'person'
  | 'boolean'

/** Where an input comes from: an earlier step's output, or one of the run's own inputs. */
export type IoSource = { step: string; output: string } | { run: string }

/**
 * An input never carries a value of its own. The client reads it off the source
 * output once that step is done — the same rule statuses follow in
 * workflowSummaries.ts — so a run cannot show an input that disagrees with the
 * output it came from.
 */
export type StepInput = { name: string; type: IoType; from: IoSource }

/** `value` is absent until the step produces it, and arrives in an `io` patch. */
export type StepOutput = { name: string; type: IoType; value?: string }

export type StepIO = { inputs: StepInput[]; outputs: StepOutput[] }

/** One field of the start form. */
export type RunInputSpec = {
  name: string
  type: IoType
  required: boolean
  description: string
  /** The choices for `choice`; the people who can be picked for `person`. */
  options?: string[]
}

/** What a run hands back when it ends, and where it goes. */
export type RunOutputSpec = { name: string; type: IoType; description: string; goesTo: string }

export type WireStep = {
  id: string
  kind: WireStepKind
  stageId: string
  title: string
  /** The result line under the title. Replaced wholesale as work completes. */
  meta: string
  /** Tool names render in the mono face. */
  mono?: boolean
  /** Initials for a named person; omit for a step routed to a role. */
  initials?: string
  /** What the status marker says in words, e.g. "3h 40m". */
  statusLabel?: string
  assignee?: string
  /** Facts, branches, progress and tools under the result line. */
  content?: WireStepContent
  /** Placement. The client derives x/y — see ./layout.ts. */
  column: number
  /** Orders steps within a column. It orders; it is not an index, so gaps are fine. */
  row: number
  /** Escape hatch: an explicit position wins over column/row. */
  x?: number
  y?: number
  /** Overrides the width the kind implies (NODE_W, or GATE_W for a decision). */
  w?: number
  detail: RunDetail
  /**
   * What the step reads and produces. Kept out of `detail` because the client
   * resolves it across steps, and out of `content` because the canvas never
   * draws it: only the panels do, so it cannot change a node's size.
   */
  io?: StepIO
}

export type WireStage = {
  id: string
  name: string
  sub: string
  status: WireStageStatus
}

export type WireEdge = { from: string; to: string; rule: EdgeRule }

/** A gate that is open: which step, and what it will accept. */
export type OpenGate = { stepId: string; decisions: Decision[]; dueLabel?: string }

/** The run card at the top of the run's section of the menu. */
export type RunHeader = { primary: string; secondary: string; tertiary: string }

/** Whose seat this is. Decisions made in the fixture source are logged under this name. */
export type RunActor = { initials: string; name: string; role: string }

/**
 * The whole graph. It arrives complete on every snapshot and its node set never
 * changes mid-run: steps that will be skipped ship already at `skipped`. A
 * changing node set flips React Flow's `useNodesInitialized()` back to false and
 * refits the viewport under the reader, so only a snapshot may change it.
 */
export type WireRun = {
  runId: string
  variantId: VariantId
  /** The top bar's title. */
  title: string
  header: RunHeader
  actor: RunActor
  stages: WireStage[]
  steps: WireStep[]
  edges: WireEdge[]
  statuses: Record<string, WireStepStatus>
  phase: RunPhase
  /**
   * Every gate open right now. This has to be state rather than only the
   * `run.awaiting` event: a client attaching to a run that is already waiting
   * has no other way to learn what the waiting step will accept, and would draw
   * a decision it cannot make.
   */
  awaiting: OpenGate[]
  /** Which step to open in the inspector on arrival. */
  focusStepId?: string
  /**
   * The values this run was started with, by input name. State rather than only
   * the `run.start` message, so a client attaching mid-run can still show what
   * a `{ run }` input was given.
   */
  inputs?: Record<string, string>
}

export type LogEntry = {
  /** `${runId}-${seq}`. Key rows on this — the client caps the log from the head. */
  id: string
  at: number
  /** Since the run started. What the row shows, as m:ss. */
  elapsedMs: number
  level: LogLevel
  /** Clicking the row selects this step. */
  stepId?: string
  /** Short attribution: 'Intake agent', 'credit_bureau.pull', 'Dana W.' */
  source?: string
  text: string
}

/**
 * A patch to one step. `meta`, `detail`, `content` and `io` are whole replacements:
 * `detail` is opaque to the canvas, so merging into it would mean a deep merge for
 * nothing. A step that finishes sends `io` with its outputs' values filled in; a
 * step sent back sends it again with them cleared.
 */
export type StepPatch = Partial<
  Pick<WireStep, 'meta' | 'statusLabel' | 'assignee' | 'detail' | 'content' | 'io'>
> & {
  status?: WireStepStatus
}

export type StagePatch = { status?: WireStageStatus; sub?: string }

/**
 * `seq` is monotonic per run. The client drops anything at or below the last
 * seq it saw and resets that watermark on every snapshot, which is what makes
 * an attach arriving mid-flight idempotent.
 *
 * `runId` is `''` on an error that belongs to no run — a start that failed, or
 * an attach to an id the server has already disposed.
 */
type Envelope = { runId: string; seq: number; timestamp: number }

export type ServerMessage =
  /** The catalogue rides along so the variant switcher needs no second call. */
  | ({ type: 'run.snapshot'; run: WireRun; log: LogEntry[]; variants: VariantInfo[] } & Envelope)
  | ({ type: 'step.update'; stepId: string; patch: StepPatch } & Envelope)
  | ({ type: 'stage.update'; stageId: string; patch: StagePatch } & Envelope)
  | ({ type: 'log.append'; entries: LogEntry[] } & Envelope)
  | ({ type: 'run.awaiting' } & OpenGate & Envelope)
  | ({ type: 'run.phase'; phase: RunPhase } & Envelope)
  | ({ type: 'run.error'; message: string; code?: string; recoverable: boolean } & Envelope)

export type ControlAction = 'pause' | 'resume' | 'restart'

/**
 * `run.start` carries the start form's values by input name. A server that finds a
 * required one missing answers with `run.error` code `MISSING_INPUT`, and one it
 * cannot read with `INVALID_INPUT`; both are recoverable.
 */
export type ClientMessage =
  | { type: 'run.start'; variantId: VariantId; inputs?: Record<string, string> }
  | { type: 'run.attach'; runId: string }
  | { type: 'run.decide'; runId: string; stepId: string; decision: Decision; note?: string }
  | { type: 'run.control'; runId: string; action: ControlAction }

/**
 * What the variant switcher needs to draw a button, and the start form to draw its
 * fields. Rides on every snapshot, so the form exists before the run does. An older
 * server sends neither list; read them as empty, and start without a form.
 */
export type VariantInfo = {
  id: VariantId
  label: string
  blurb: string
  inputs?: RunInputSpec[]
  outputs?: RunOutputSpec[]
}
