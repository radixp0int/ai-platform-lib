import type { Decision } from '../../engine/wireProtocol'

export type DecisionFormProps = {
  id: string
  /** Which buttons this gate allows. */
  decisions: Decision[]
  /** A decision is in flight — the server hasn't answered yet. */
  busy: boolean
  onDecide: (decision: Decision, note?: string) => void
}
