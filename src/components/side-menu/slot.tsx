import { useContext, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PanelAction } from './side-menu'
import { SlotsContext } from './slot-context'
import type { SideMenuAction } from './types'

// A page that owns state its panel needs — a chat's filters and history — says
// so inside the platform's one menu instead of building a menu of its own. The
// menu keeps an empty container under its panel's content; the page portals
// into it. A portal keeps the page's own state and context, so the content
// stays a live part of the page even though it is drawn in the menu.

/** Wraps the menu and the page beside it, so they can find each other. */
export function SideMenuSlotProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<HTMLElement | null>(null)
  const [action, setAction] = useState<HTMLElement | null>(null)
  const value = useMemo(() => ({ panel, setPanel, action, setAction }), [panel, action])
  return <SlotsContext.Provider value={value}>{children}</SlotsContext.Provider>
}

export type InSideMenuProps = {
  /** Drawn in the panel, under whatever the panel's own content is. */
  children?: ReactNode
  /**
   * A button at the end of the panel's heading, for an action only the page
   * can carry out — a chat's "New chat" clears the chat the page holds.
   * Drawn beside the panel's own `action`, if it has one.
   */
  action?: SideMenuAction
}

/**
 * Adds to the platform menu's panel. Renders nothing where there is no panel to
 * add to — a page on its own, or a panel folded away.
 */
export function InSideMenu({ children, action }: InSideMenuProps) {
  const slots = useContext(SlotsContext)
  return (
    <>
      {slots?.panel && children ? createPortal(children, slots.panel) : null}
      {slots?.action && action ? createPortal(<PanelAction action={action} />, slots.action) : null}
    </>
  )
}
