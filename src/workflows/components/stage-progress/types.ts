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
   * which is reserved for a run that is waiting on a person; `failed` in the
   * danger colour, for a run stopped by a step that failed.
   */
  current?: 'running' | 'waiting' | 'failed'
  /**
   * Each stage's name, drawn under its segment. For a bar with room to spare,
   * like the band over a run; a table cell leaves them out.
   */
  names?: string[]
  /** `inverse` is for a bar on the navy band. Defaults to `default`. */
  tone?: 'default' | 'inverse'
  className?: string
}
