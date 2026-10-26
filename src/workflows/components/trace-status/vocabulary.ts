import type { PillTone } from '../../../primitives/pill'
import type { StepStatus } from '../types'
// The words for a step's status and kind, and the tone a status takes as a pill.

/** The status in words. */
export const TRACE_STATUS_LABEL: Record<StepStatus, string> = {
  done: 'Done',
  running: 'Running',
  waiting: 'Needs a person',
  queued: 'Queued',
  skipped: 'Skipped',
  failed: 'Failed',
  approved: 'Approved',
  changes: 'Sent back',
}

/** The tone a status takes when it is written out as a pill. */
export const TRACE_STATUS_TONE: Record<StepStatus, PillTone> = {
  done: 'success',
  approved: 'success',
  running: 'brand',
  waiting: 'orange',
  failed: 'danger',
  queued: 'neutral',
  skipped: 'neutral',
  changes: 'neutral',
}
