import type { ReactNode } from 'react'
import type { AlertTone } from '../../primitives/alert'
import type { NavigateHandler } from '../../primitives/link'

/**
 * The state of a destination, as a small dot before its label in a panel: the
 * tone names `Alert` takes, and `idle` for a hollow ring. `warning` is the
 * orange that says something needs a person; `info` the blue of work running.
 */
export type MenuStatus = AlertTone | 'idle'

export type MenuDestination = {
  /** Stable key, unique across the whole menu. Pinned pages store these. */
  id: string
  label: string
  href: string
  icon?: ReactNode
  /** A count that needs someone — runs awaiting approval, say. */
  badge?: number
  /** Sub-sections: pages that live under this one. */
  children?: MenuDestination[]
  /** The short name under its icon in the rail ("Flows"). Defaults to `label`. */
  shortLabel?: string
  /** A second line under the label where a panel lists it: "13 of 14 sources syncing". */
  description?: string
  /**
   * A dot before the label where a panel lists it. Decoration: the label or
   * the description says what the state is.
   */
  status?: MenuStatus
}

export type MenuSection = {
  id: string
  /** Small heading above the group. The first group has none. */
  label?: string
  items: MenuDestination[]
}

/** The button at the end of a panel's heading: "New chat", "Start a workflow". */
export type SideMenuAction = {
  label: string
  icon?: ReactNode
  href?: string
  onSelect?: () => void
}

/** What the panel beside the rail holds while one app is the one you are in. */
export type SideMenuPanel = {
  /** The panel's heading. Defaults to the destination's label. */
  title?: string
  action?: SideMenuAction
  /**
   * Destinations the panel lists, grouped under small headings like `sections`.
   * Each is a row with its description and status, and its children indented
   * under it; the one being viewed is marked. Drawn above `content`. A
   * destination listed only here still makes this the app you are in.
   */
  sections?: MenuSection[]
  /** Under the heading. Built from the `MenuPanel…` pieces so panels read alike. */
  content?: ReactNode
  /**
   * A shorter version for the card that opens beside the rail while the panel
   * is shut and the pointer rests on the app's icon.
   */
  flyout?: ReactNode
}

/** A page visited lately, listed under All apps. */
export type SideMenuPlace = { label: string; href: string; icon?: ReactNode }

/** Pinned to the foot of the rail: Help, Settings. A page, or something that opens over this one. */
export type SideMenuFootLink = {
  id: string
  label: string
  icon: ReactNode
  href?: string
  onSelect?: () => void
}

export type SideMenuProps = {
  /** Every destination, grouped. All of them are reachable from All apps. */
  sections: MenuSection[]
  /** The top-level destinations that get a place in the rail, in order, by id. */
  rail: string[]
  /** The destination being viewed — a top-level item or one of its children. */
  activeId?: string
  /** A panel for each app that has one, by destination id. */
  panels?: Record<string, SideMenuPanel>
  /** Over the tiles in All apps: whose apps these are. */
  appsHeading?: string
  places?: SideMenuPlace[]
  footLinks?: SideMenuFootLink[]
  /** Whether the panel is showing. Leave out to let the menu keep it. */
  panelOpen?: boolean
  /**
   * Whether the panel starts open on a wide screen. Below 1200px the panel
   * slides over the page instead of beside it, and starts closed whatever this
   * says.
   */
  defaultPanelOpen?: boolean
  onPanelOpenChange?: (open: boolean) => void
  /** Where to remember the width the panel was dragged to. */
  widthStorageKey?: string
  /** Overrides the handler from `NavigateProvider`. */
  onNavigate?: NavigateHandler
  /** Names the rail for assistive technology. */
  label?: string
  className?: string
}
