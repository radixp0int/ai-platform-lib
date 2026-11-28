import type { HTMLAttributes, ReactNode } from 'react'
import type { BreadcrumbEntry } from '../../primitives/breadcrumbs'
export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  titleClassName?: string
  descriptionClassName?: string
}

/** One figure in the strip that PageBand's Details link opens. */
export type PageBandStat = {
  label: ReactNode
  value: ReactNode
  /** A line under the value: "Oldest sent 23 days ago". */
  note?: ReactNode
  /** Makes the figure a button, say to filter the list below to it. */
  onSelect?: () => void
}

export type PageBandDetails = {
  /**
   * Why someone might open the strip, drawn in the attention colour before
   * the link: "5 need a look". Leave it out when nothing needs anyone.
   */
  summary?: ReactNode
  /** The figures the strip shows, left to right. Four fit on one row. */
  stats: PageBandStat[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The link's words. Default "Show details" and "Hide details". */
  showLabel?: string
  hideLabel?: string
}

export type PageBandProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  /** The trail above the title. Drawn in the inverse tone, for the band. */
  breadcrumbs?: BreadcrumbEntry[]
  /**
   * The page's own actions, on the right of the band. Use Button's `inverse`
   * for secondary actions and `inverse-solid` for the one primary action.
   */
  actions?: ReactNode
  /** A "Show details" link at the end of the description, and the strip it opens. */
  details?: PageBandDetails
  /**
   * A row along the bottom of the band, under a hairline: the heading of the
   * first section and links that jump down the page, as on Insights. The page
   * body still lifts over the band below it.
   */
  footer?: ReactNode
  /**
   * The page body. Its top edge lifts over the bottom of the band, so the
   * first card overlaps it.
   */
  children?: ReactNode
}
