import { EDGE_DASH, EDGE_STROKE } from '../../build'
import type { LegendLineProps } from './types'
export function LegendLine({ state }: LegendLineProps) {
  return (
    <svg width="30" height="10" viewBox="0 0 30 10" className="block shrink-0" aria-hidden>
      <path
        d="M1 5 H28"
        fill="none"
        stroke={EDGE_STROKE[state]}
        strokeWidth={state === 'done' ? 1.5 : 2}
        strokeLinecap="round"
        strokeDasharray={EDGE_DASH[state]}
      />
    </svg>
  )
}
