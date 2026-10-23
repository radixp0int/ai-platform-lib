import { createContext, useContext } from 'react'

export type Slots = {
  expanded: HTMLElement | null
  rail: HTMLElement | null
  setExpanded: (element: HTMLElement | null) => void
  setRail: (element: HTMLElement | null) => void
}

export const SlotsContext = createContext<Slots | null>(null)

/** For `SideMenu`: where to report its two containers. Null outside a provider. */
export function useSideMenuSlots() {
  return useContext(SlotsContext)
}
