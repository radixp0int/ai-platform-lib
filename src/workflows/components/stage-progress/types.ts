import type { StageStatus } from '../types'

export type StageProgressProps = {
  /** One entry per stage, in order. */
  segments: StageStatus[]
  /**
   * What the bar says, for someone who cannot see it: "Stage 4 of 5, Approve".
   * The bar is a picture of that sentence, so it takes the sentence itself.
   */
  label: string
  /**
   * Why the current stage has stopped. `waiting` paints it in the notify colour,
   * which is reserved for a run that is waiting on a person.
   */
  current?: 'running' | 'waiting'
  className?: string
}
