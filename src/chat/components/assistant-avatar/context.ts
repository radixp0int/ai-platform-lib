import { createContext, useContext } from 'react'
import type { AssistantAvatarKind, AssistantAvatarOptions } from './types'

const AssistantAvatarContext = createContext<AssistantAvatarKind>('orb')

/**
 * Sets the assistant's mark for everything inside. The library has no idea
 * who is signed in, so the host decides — usually with `assistantAvatarFor`.
 * Without a provider every surface draws the Orb.
 */
export const AssistantAvatarProvider = AssistantAvatarContext.Provider

export function useAssistantAvatarKind(): AssistantAvatarKind {
  return useContext(AssistantAvatarContext)
}

/**
 * The mark for a humanized assistant or a plain one: humanized is Aristotle
 * as a marble bust, otherwise the Orb. Who is shown the humanized assistant
 * is the app's call — today, super admins.
 */
export function assistantAvatarFor({
  humanized = false,
}: AssistantAvatarOptions): AssistantAvatarKind {
  return humanized ? 'marble-bust' : 'orb'
}
