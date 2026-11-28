import type { ReactNode } from 'react'

/**
 * Where a stage or a step stands, in the words the runs list uses: `needs` waits
 * on you, `waiting` on someone else.
 */
export type GlanceState = 'done' | 'needs' | 'waiting' | 'running' | 'failed' | 'queued' | 'skipped'

export type GlanceStage = { id: string; name: string; state: GlanceState }

export type GlanceStep = {
  id: string
  name: string
  state: GlanceState
  /** How long a finished step took: "0.4s". */
  took?: string
}

/** One event from the run log, with its run-relative time. */
export type GlanceEvent = { at: string; step: string; text: string }

/** Where a chip leads: a stage's group, or one step, in the run's details. */
export type GlanceTarget = { stageId: string; stepId?: string }

export type RunGlanceProps = {
  /** Every stage of the run, in order. The line is windowed past six. */
  stages: GlanceStage[]
  /** The current stage's steps, in order. The chain is windowed past seven. */
  steps: GlanceStep[]
  /** Makes every chip a link into the run's details. */
  hrefFor?: (target: GlanceTarget) => string
  /** What the run waits on, as a square status bar: an `Alert` with `variant="bar"`. */
  status?: ReactNode
  /** The last few run log events. */
  latest?: GlanceEvent[]
  /** The footer's left side: "Started by You · v12". */
  meta?: ReactNode
  /** The footer's buttons, on the right. */
  actions?: ReactNode
  className?: string
}
