import { useContext, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { SlotsContext } from './slot-context'

// A page that has more to say than a destination — a run's stages, a chat's
// history — says it inside the platform's one menu instead of building a menu
// of its own. The menu owns two empty containers, one per mode; the page
// portals into them. A portal keeps the page's own state and context, so the
// content stays a live part of the page even though it is drawn in the menu.

/** Wraps the menu and the page beside it, so they can find each other. */
export function SideMenuSlotProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState<HTMLElement | null>(null)
  const [rail, setRail] = useState<HTMLElement | null>(null)
  const value = useMemo(() => ({ expanded, rail, setExpanded, setRail }), [expanded, rail])
  return <SlotsContext.Provider value={value}>{children}</SlotsContext.Provider>
}

export type InSideMenuProps = {
  /** Drawn under the destinations while the menu is expanded. */
  children: ReactNode
  /** Drawn under the icons while it is a rail. Leave it out to add nothing there. */
  rail?: ReactNode
}

/**
 * Adds a section to the platform menu. Renders nothing where there is no menu
 * to add to — a page on its own, or a menu folded away.
 */
export function InSideMenu({ children, rail }: InSideMenuProps) {
  const slots = useContext(SlotsContext)
  return (
    <>
      {slots?.expanded && createPortal(children, slots.expanded)}
      {slots?.rail && rail && createPortal(rail, slots.rail)}
    </>
  )
}
