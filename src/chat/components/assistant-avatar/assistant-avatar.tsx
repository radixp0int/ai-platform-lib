import { Orb } from '../../../primitives/orb'
import { useAssistantAvatarKind } from './context'
import { MarbleBust } from './marble-bust'
import type { AssistantAvatarProps, AssistantAvatarState } from './types'

const ORB_MOTION: Record<AssistantAvatarState, string> = {
  idle: '',
  thinking: 'animate-orb-drift',
  talking: 'animate-orb-talk',
}

/**
 * The assistant's mark wherever it speaks for itself — inside the composer
 * while it types a suggestion, beside an answer, in the widget. Which mark it
 * is comes from the nearest `AssistantAvatarProvider` (the Orb when there is
 * none), or from `kind` for an agent with its own.
 *
 * Decorative: what the assistant is doing is always said in words nearby.
 */
export function AssistantAvatar({
  size,
  state = 'idle',
  kind,
  className = '',
}: AssistantAvatarProps) {
  const fromContext = useAssistantAvatarKind()
  const mark = kind ?? fromContext
  if (mark === 'marble-bust') return <MarbleBust size={size} state={state} className={className} />
  return (
    <Orb
      data-state={state}
      data-avatar="orb"
      style={{ width: size, height: size }}
      className={`block shrink-0 ${ORB_MOTION[state]} ${className}`}
    />
  )
}
