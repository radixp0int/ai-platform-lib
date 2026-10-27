import type { StepKind, StepStatus } from '../types'

export type TraceStatusIconProps = {
  status: StepStatus
  /** Pixels. Defaults to 20. */
  size?: number
  /**
   * The status in words, for someone who cannot see the glyph. Leave it out
   * when the word is written beside the icon.
   */
  label?: string
  className?: string
}

export type TraceKindTagProps = {
  kind: StepKind
  className?: string
}
