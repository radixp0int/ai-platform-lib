import type { ReactNode } from 'react'
import type { TraceStep } from '../run-trace'

export type TraceStepListProps = {
  /** The steps to list, in the order they began. */
  steps: TraceStep[]
  /** The step whose trace is open. */
  selectedId?: string
  onSelect: (stepId: string) => void
  /** The small heading over the list: the stage's name and how many steps it holds. */
  heading?: ReactNode
  /** Shown when `steps` is empty. */
  empty?: ReactNode
  className?: string
}
