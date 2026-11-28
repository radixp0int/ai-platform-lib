import type { ReactNode } from 'react'
import type { TraceStep } from '../run-trace'

/** What the inspector can show of a step. */
export type TraceInspectorTab = 'summary' | 'trace' | 'io' | 'raw'

export type TraceInspectorProps = {
  step: TraceStep
  /** The name of the stage the step belongs to, shown over its title. */
  stageName: string
  /** The run it belongs to, for the raw record. */
  runId: string
  /** The open tab, when the host holds it. Leave it out and the inspector holds it. */
  tab?: TraceInspectorTab
  defaultTab?: TraceInspectorTab
  onTabChange?: (tab: TraceInspectorTab) => void
  /** Overrides the status pill's words: "Needs you", "Waiting on Dana W.". */
  statusLabel?: string
  /** Where the step sits, in place of its stage and kind: "Approve · step 2 of 3". */
  context?: string
  /**
   * What someone can do about the step, drawn between its description and its
   * facts: an approval bar, or a failed step's Retry. With it, a step's
   * `failure` is left to the bar to say.
   */
  actions?: ReactNode
  className?: string
}
