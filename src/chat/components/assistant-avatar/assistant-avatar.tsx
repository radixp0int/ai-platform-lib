import { Orb } from '../../../primitives/orb'
import type { AssistantAvatarProps, AssistantAvatarState } from './types'

const MOTION: Record<AssistantAvatarState, string> = {
  idle: '',
  thinking: 'animate-orb-drift',
  talking: 'animate-orb-talk',
}

/**
 * The assistant's mark wherever it speaks for itself — inside the composer
 * while it types a suggestion, beside an answer. Today it is the Orb; the
 * chosen avatar replaces it here and nowhere else.
 *
 * Decorative: what the assistant is doing is always said in words nearby.
 */
export function AssistantAvatar({ size, state = 'idle', className = '' }: AssistantAvatarProps) {
  return (
    <Orb
      data-state={state}
      style={{ width: size, height: size }}
      className={`block shrink-0 ${MOTION[state]} ${className}`}
    />
  )
}
