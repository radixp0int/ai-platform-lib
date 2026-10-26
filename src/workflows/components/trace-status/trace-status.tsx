import { CircleCheckIcon, CircleXIcon, ClockIcon } from '../../../primitives/icons'
import { SkipIcon } from '../../../primitives/icons/workflow-icons'
import { Pill, type PillTone } from '../../../primitives/pill'
import { STEP_KIND_LABEL } from '../types'
import type { TraceKindTagProps, TraceStatusIconProps } from './types'

// What state a step is in and who does its work, for the trace page.
//
// The glyph differs by shape as well as colour (a check, a cross, an arc, a
// clock, a dashed ring), so a run that is read in greyscale, or by someone who
// cannot tell orange from blue, still reads. Orange stays reserved for a step
// waiting on a person.

export function TraceStatusIcon({
  status,
  size = 20,
  label,
  className = '',
}: TraceStatusIconProps) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  const common = { width: size, height: size, className: `shrink-0 ${className}`, ...a11y }
  switch (status) {
    case 'done':
    case 'approved':
      return <CircleCheckIcon {...common} className={`${common.className} text-success-fg`} />
    case 'failed':
      return <CircleXIcon {...common} className={`${common.className} text-danger-fg`} />
    case 'waiting':
      return <ClockIcon {...common} className={`${common.className} text-pill-orange-fg`} />
    case 'running':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          {...common}
          className={`${common.className} text-brand-fg motion-safe:animate-spin`}
        >
          <circle cx="12" cy="12" r="9" strokeOpacity={0.25} />
          <path d="M12 3a9 9 0 0 1 9 9" />
        </svg>
      )
    case 'queued':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="3 3"
          {...common}
          className={`${common.className} text-ink-soft`}
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
    default:
      return <SkipIcon {...common} className={`${common.className} text-ink-soft`} />
  }
}

/** A small tag for the kinds worth picking out of a list: an agent, a person. */
export function TraceKindTag({ kind, className = '' }: TraceKindTagProps) {
  const tone: PillTone = kind === 'agent' ? 'brand' : kind === 'human' ? 'orange' : 'neutral'
  return (
    <Pill size="sm" tone={tone} className={`shrink-0 uppercase ${className}`}>
      {STEP_KIND_LABEL[kind]}
    </Pill>
  )
}
