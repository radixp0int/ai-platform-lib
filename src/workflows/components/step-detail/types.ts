import type { Decision, RunDetail } from '../../engine/wireProtocol'
import type { StepSeed, StepStatus } from '../index'

export type StepDetailProps = {
  step: StepSeed<RunDetail>
  status: StepStatus | undefined
  /** What the breadcrumb goes back to. */
  runTitle: string
  /** What runs after this one, nearest first. Only drawn on an open gate. */
  next: StepSeed<RunDetail>[]
  decisions: Decision[]
  busy: boolean
  onClose: () => void
  onDecide: (decision: Decision, note?: string) => void
}
