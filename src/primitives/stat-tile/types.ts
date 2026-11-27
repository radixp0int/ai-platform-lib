import type { ReactNode } from 'react'

/**
 * How the figure moved since the period it is compared with. The colour comes
 * from the direction and whether a rise is good news, never from the sign: an
 * error count that went up 14% is red.
 */
export type StatTileChange = {
  /** The amount, without an arrow: "0.3 pts", "14%", "No change", "24 people". */
  text: ReactNode
  /**
   * Which way the figure moved; the tile draws the arrow. Leave it out for a
   * line in muted ink with no arrow: "No change", or a note such as "24 people".
   */
  direction?: 'up' | 'down'
  /** Whether a rise is good news. Default true; false for errors, wait times, cost. */
  upIsGood?: boolean
}

export type StatTileProps = {
  value: ReactNode
  label: ReactNode
  /** Set after the value, smaller and in soft ink: "%", "s", "of 500". */
  unit?: ReactNode
  /** The change line under the value: "↑ 0.3 pts", green when good, red when bad. */
  change?: StatTileChange
  /**
   * The recent trend, oldest first (say the last 14 days): a thin line with a
   * soft fill, no axes. Decorative; the change line says what it shows. Fewer
   * than two numbers draw nothing.
   */
  sparkline?: readonly number[]
  /** The last line of the tile, usually a link to the section behind the figure. */
  footer?: ReactNode
  /**
   * Draws the tile as a card, label above value: `large` for the headline row
   * of a page, `small` for the denser row under it. Leave it out for a bare
   * figure (value above label) styled with the class props.
   */
  size?: 'large' | 'small'
  className?: string
  valueClassName?: string
  labelClassName?: string
}
