import type { TraceStep } from '../run-trace'

/** What the inspector can show of a step. */
export type TraceInspectorTab = 'trace' | 'io' | 'raw'

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
  className?: string
}
