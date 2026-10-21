/** What the assistant is doing, which is all its mark needs to know. */
export type AssistantAvatarState = 'idle' | 'thinking' | 'talking'

/**
 * Which mark represents the assistant. `orb` is everyone's; `marble-bust` is
 * Aristotle, for super admins. More are planned, one per agent, so this is a
 * list of names rather than a flag.
 */
export type AssistantAvatarKind = 'orb' | 'marble-bust'

export type AssistantAvatarProps = {
  /** Width and height in pixels. */
  size: number
  state?: AssistantAvatarState
  /** This mark rather than the one the nearest `AssistantAvatarProvider`
   *  sets — for an agent that has its own. */
  kind?: AssistantAvatarKind
  className?: string
}

/** Who is looking: what the host knows about the viewer that picks the mark. */
export type AssistantAvatarViewer = { superAdmin?: boolean }
