import { createContext, useContext } from 'react'

export type Slots = {
  panel: HTMLElement | null
  setPanel: (element: HTMLElement | null) => void
  /** Where a page's own button goes at the end of the panel's heading. */
  action: HTMLElement | null
  setAction: (element: HTMLElement | null) => void
}

export const SlotsContext = createContext<Slots | null>(null)

/** For `SideMenu`: where to report the container under its panel's content. Null outside a provider. */
export function useSideMenuSlots() {
  return useContext(SlotsContext)
}
