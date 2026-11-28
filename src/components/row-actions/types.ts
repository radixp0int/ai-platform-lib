import type { ReactNode } from 'react'

/** An icon button in a row. Its label is also its tooltip. */
export type RowActionButton = {
  label: string
  icon: ReactNode
  /** Overrides the accessible name. Defaults to "{label} for {name}". */
  ariaLabel?: string
  /** A link, when the action goes somewhere. */
  href?: string
  onSelect?: () => void
  /** Greys the button out and says why in its tooltip: "No live run". */
  disabledReason?: string
}

/** An entry in the ⋯ menu, or `'separator'` for the rule before a destructive entry. */
export type RowMenuEntry =
  | {
      label: string
      icon?: ReactNode
      onSelect: () => void
      /** Disables the entry and says why under its label. */
      disabledReason?: string
      tone?: 'default' | 'danger'
    }
  | 'separator'

export type RowActionsProps = {
  /** The row's name, for the accessible names: "More actions for {name}". */
  name: string
  /** Before the icons: a row's one text button, such as Review. */
  children?: ReactNode
  buttons?: RowActionButton[]
  /** The ⋯ menu's entries. Omit for no menu. */
  menu?: RowMenuEntry[]
  /** Opens the menu upward, for the last rows of a page. */
  menuUp?: boolean
  /** The menu's width. Defaults to 232. */
  menuWidth?: number
}
