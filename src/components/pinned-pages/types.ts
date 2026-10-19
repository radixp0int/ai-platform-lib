import type { ReactNode } from 'react'
import type { NavigateHandler } from '../../primitives/link'

export type PinnedPage = {
  /** Stable key — the destination's id. */
  id: string
  label: string
  href: string
  icon?: ReactNode
  /** The space the page sits in, shown after the label: "Runs · Workflows". */
  context?: string
}

export type PinnedPagesLabels = {
  title: string
  empty: string
  note: string
  manage: (count: number, max: number, currentPinned: boolean) => string
  count: (count: number, max: number) => string
  pin: (name: string) => string
  unpin: (name: string) => string
  full: (max: number, name: string) => string
}

export type PinnedPagesProps = {
  labels?: Partial<PinnedPagesLabels>
  popoverWidth?: number
  /** The user's pinned pages, in order. Anything past `max` is ignored. */
  pages: PinnedPage[]
  /** The page being viewed, when it is one of `pages`. */
  activeId?: string
  /** The page being viewed, when it could be pinned. Omit on pages that cannot. */
  current?: PinnedPage
  /** Reports the complete next list. The host owns persistence. */
  onPagesChange: (pages: PinnedPage[]) => void
  /** Overrides the handler from `NavigateProvider`. */
  onNavigate?: NavigateHandler
  /** How many tabs the bar has room for. */
  max?: number
}
