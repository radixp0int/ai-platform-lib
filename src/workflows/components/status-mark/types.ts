import type { StepStatus } from '../types'
import type { ZoomTier } from '../zoom'

export type StatusMarkProps = {
  status: StepStatus
  text?: string
  tier?: ZoomTier
}
