import { createContext, useContext } from 'react'
import type { AssistantAvatarKind, AssistantAvatarViewer } from './types'

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
 * The rule, written once so every app applies it the same way: super admins
 * see Aristotle as a marble bust, everyone else sees the Orb.
 */
export function assistantAvatarFor(viewer: AssistantAvatarViewer): AssistantAvatarKind {
  return viewer.superAdmin ? 'marble-bust' : 'orb'
}
