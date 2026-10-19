import type { Decision } from '../../../engine/wireProtocol'
export type DecisionButtonProps = {
  decision: Decision
  busy: boolean
  onDecide: (decision: Decision) => void
}
