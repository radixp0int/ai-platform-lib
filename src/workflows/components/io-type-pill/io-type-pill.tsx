import type { IoTypePillProps } from './types'

/**
 * The type of an input or output, in the mono face. Drawn like the tool chips on
 * a node — a type is the same kind of fact, a name an engineer would recognise —
 * rather than as a Pill, whose rounded tones mean state.
 */
export function IoTypePill({ type, className = '' }: IoTypePillProps) {
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded-control bg-tint/8 px-1.5 font-mono text-[10.5px] text-ink ${className}`}
    >
      {type}
    </span>
  )
}
