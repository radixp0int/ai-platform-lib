import type { Decision, RunDetail } from '../../engine/wireProtocol'
import type { StepSeed, StepStatus } from '../index'

export type StepInspectorProps = {
  step: StepSeed<RunDetail> | null
  status: StepStatus | undefined
  /** Which buttons this gate allows. Empty hides the footer entirely. */
  decisions: Decision[]
  /** A decision is in flight — the server hasn't answered yet. */
  busy: boolean
  onClose: () => void
  /** Opens the same step as a full-width page. Omitted when there is no step. */
  onExpand: () => void
  onDecide: (decision: Decision, note?: string) => void
}
