/** What the assistant is doing, which is all its mark needs to know. */
export type AssistantAvatarState = 'idle' | 'thinking' | 'talking'

/**
 * Which mark represents the assistant. `orb` is the default; `marble-bust` is
 * the humanized assistant, Aristotle. More are planned, one per agent, so this
 * is a list of names rather than a flag.
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

/** What picks the mark. `humanized` asks for the assistant with a face — the
 *  host decides who gets it (today, super admins). */
export type AssistantAvatarOptions = { humanized?: boolean }
