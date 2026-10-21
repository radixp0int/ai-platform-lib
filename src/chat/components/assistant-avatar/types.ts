/** What the assistant is doing, which is all its mark needs to know. */
export type AssistantAvatarState = 'idle' | 'thinking' | 'talking'

export type AssistantAvatarProps = {
  /** Width and height in pixels. */
  size: number
  state?: AssistantAvatarState
  className?: string
}
