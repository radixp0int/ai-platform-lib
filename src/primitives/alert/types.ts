import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react'

export type AlertTone = 'info' | 'success' | 'warning' | 'error'

/**
 * `panel` (default) is a rounded card: the glyph sits in a tone-tinted tile
 * and the card lifts on a soft shadow. `bar` is a square live-status strip: a
 * 3px edge in the tone colour down the left side, the glyph plain and inline
 * in the tone colour, a hairline border and only a faint shadow. Use `bar`
 * for a notice docked to the frame of a page or a composer; keep `panel` for
 * a message that sits among content cards.
 */
export type AlertVariant = 'panel' | 'bar'

export type AlertAction = {
  label: ReactNode
  onClick: MouseEventHandler<HTMLButtonElement>
  ariaLabel?: string
  disabled?: boolean
}

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  tone?: AlertTone
  /** `panel` (default): rounded card with an icon tile. `bar`: square status strip with a tone edge. */
  variant?: AlertVariant
  title: ReactNode
  /** @deprecated No longer drawn: the tone lives in the icon tile and the action. */
  bordered?: boolean
  /**
   * `stack` (default) puts the actions under the copy. `inline` keeps title,
   * copy and actions on one line — a page-level banner — and wraps when it
   * runs out of room.
   */
  layout?: 'stack' | 'inline'
  /** Supporting copy beneath the title. */
  children?: ReactNode
  /** Highlighted facts or problems rendered as a semantic list. */
  items?: readonly ReactNode[]
  /** The one thing to do next, as a button in the tone's own colour: Retry in red, Review in amber. */
  action?: AlertAction
  /** A second, quieter way out, drawn as a tone-coloured text link: "Publish anyway". */
  secondaryAction?: AlertAction
  /** Present to add a dismiss button. */
  onDismiss?: MouseEventHandler<HTMLButtonElement>
  dismissLabel?: string
  /** Overrides the tone's default glyph; `false` removes it. */
  icon?: ReactNode | false
  /** Arbitrary content disclosed through a native, keyboard-accessible details element. */
  details?: ReactNode
  detailsLabel?: ReactNode
}
