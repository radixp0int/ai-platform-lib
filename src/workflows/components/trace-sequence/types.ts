import type { TraceCall } from '../run-trace'

export type TraceSequenceProps = {
  /** The calls a step made, in order. */
  calls: TraceCall[]
  /** Seconds the step took. The bars are drawn against it, so a call that took half of it fills half the track. */
  duration: number
  className?: string
}
