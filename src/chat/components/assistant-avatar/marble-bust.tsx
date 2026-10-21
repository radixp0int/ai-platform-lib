import { useId } from 'react'
import type { AssistantAvatarState } from './types'

type MarbleBustProps = {
  size: number
  state: AssistantAvatarState
  className?: string
}

/**
 * Aristotle as a friendly marble bust: curly hair, a full beard, and a
 * himation over one shoulder in the warm accent. Drawn on a 48-unit grid in
 * flat shapes, so it holds together down to 24px.
 *
 * Its moves are CSS, keyed off `data-state` (`.marble-bust` in chat.css):
 * it blinks at rest, tilts its head and raises its brows while thinking, and
 * nods while talking. Reduced motion stills all of them.
 */
export function MarbleBust({ size, state, className = '' }: MarbleBustProps) {
  const clip = useId()
  return (
    <svg
      aria-hidden
      data-state={state}
      data-avatar="marble-bust"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`marble-bust block shrink-0 ${className}`}
    >
      <defs>
        <clipPath id={clip}>
          <rect width="48" height="48" rx="16" />
        </clipPath>
      </defs>
      <rect className="mb-tile" width="48" height="48" rx="16" />
      <g clipPath={`url(#${clip})`}>
        <path
          className="mb-marble"
          d="M7 48 C8.5 41.5 14 38.2 24 38.2 C34 38.2 39.5 41.5 41 48 Z"
        />
        <path
          className="mb-cloth"
          d="M10.5 48 C13 42.4 19 39.6 27 40.4 C31.5 40.9 35 42.6 37.5 44.6 L36 48 Z"
        />
      </g>
      <g className="mb-head">
        <g className="mb-shade">
          <circle cx="15.2" cy="16.4" r="3.6" />
          <circle cx="18" cy="12.4" r="3.8" />
          <circle cx="22.4" cy="10.4" r="3.9" />
          <circle cx="27" cy="10.6" r="3.8" />
          <circle cx="31" cy="12.8" r="3.6" />
          <circle cx="33" cy="16.8" r="3.2" />
        </g>
        <ellipse className="mb-marble" cx="24" cy="22.6" rx="9.6" ry="10.6" />
        <g className="mb-brows mb-line" strokeWidth="1.5">
          <path d="M18.6 17.4 Q20.6 16.2 22.4 17.2" />
          <path d="M25.6 17.2 Q27.4 16.2 29.4 17.4" />
        </g>
        <g className="mb-eyes">
          <rect className="mb-deep" x="19.3" y="19" width="2.6" height="4" rx="1.3" />
          <rect className="mb-deep" x="26.1" y="19" width="2.6" height="4" rx="1.3" />
        </g>
        <g className="mb-shade">
          <circle cx="15.6" cy="27" r="3.4" />
          <circle cx="16.8" cy="31.4" r="3.7" />
          <circle cx="19.6" cy="35" r="3.9" />
          <circle cx="24" cy="36.4" r="4.1" />
          <circle cx="28.4" cy="35" r="3.9" />
          <circle cx="31.2" cy="31.4" r="3.7" />
          <circle cx="32.4" cy="27" r="3.4" />
        </g>
        <path
          className="mb-marble"
          d="M18.6 28.4 Q24 25.6 29.4 28.4 Q29 33 24 33.4 Q19 33 18.6 28.4 Z"
        />
        <path
          className="mb-shade"
          d="M18.4 28.2 Q21 26.1 24 27.3 Q27 26.1 29.6 28.2 Q27.3 29.3 24 28.6 Q20.7 29.3 18.4 28.2 Z"
        />
        <path className="mb-mouth mb-line" d="M21.2 30.6 Q24 32.6 26.8 30.6" strokeWidth="1.6" />
      </g>
    </svg>
  )
}
