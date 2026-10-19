import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import type { NavigateHandler } from '../../primitives/link'

export type TopBarProps = {
  appName: string
  /** Where the logo goes. */
  homeHref: string
  /** Overrides the handler from `NavigateProvider`. */
  onNavigate?: NavigateHandler
  /** Far left: the side-menu toggle, or a focused flow's close button. */
  leading: ReactNode
  /** After the logo: the pinned pages, or a focused flow's title. */
  children?: ReactNode
  /** Right-hand cluster: tenant switcher, search, notifications, account. */
  trailing: ReactNode
}

export type TopBarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: every control in the bar is icon-only. */
  'aria-label': string
  /** Drawn pressed — the menu it opens is showing. */
  active?: boolean
  ref?: Ref<HTMLButtonElement>
}
