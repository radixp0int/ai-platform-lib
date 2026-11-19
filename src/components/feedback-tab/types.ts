import type { NavigateHandler } from '../../primitives/link'

export type FeedbackTabProps = {
  /**
   * Opens the host's bug report, such as a dialog or a side panel. Ignored
   * when `href` is set.
   */
  onClick?: () => void
  /**
   * Where the report lives, such as a form's address. The tab renders as a
   * link instead of a button, so open-in-new-tab and copy-link work.
   */
  href?: string
  /** Host navigation for `href`. See **Docs / Contracts**, Links. */
  onNavigate?: NavigateHandler
  /** Opens `href` in a new tab, for a form hosted somewhere else. */
  newTab?: boolean
  /** The word written down the tab. It is also the accessible name. */
  label?: string
  /** The first line that slides out on hover or keyboard focus. */
  title?: string
  /** The second, quieter line under `title`. Pass an empty string for none. */
  description?: string
  /**
   * `viewport` pins the tab to the window's right edge, the usual place in an
   * app shell. `container` pins it to the nearest positioned ancestor, for a
   * story or a framed preview.
   */
  anchor?: 'viewport' | 'container'
  /** Holds the tab open, for documentation or a guided tour. */
  expanded?: boolean
  className?: string
}
