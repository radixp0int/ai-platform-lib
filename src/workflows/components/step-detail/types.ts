import type { ResolvedIO } from '../../engine/io'
import type { Decision, RunDetail } from '../../engine/wireProtocol'
import type { StepSeed, StepStatus } from '../index'

export type StepDetailProps = {
  step: StepSeed<RunDetail>
  status: StepStatus | undefined
  /** The step's inputs and outputs, resolved against the run. Omit for none. */
  io?: ResolvedIO | null
  /** What the breadcrumb goes back to. */
  runTitle: string
  /** What runs after this one, nearest first. Only drawn on an open gate. */
  next: StepSeed<RunDetail>[]
  decisions: Decision[]
  busy: boolean
  onClose: () => void
  onDecide: (decision: Decision, note?: string) => void
}
