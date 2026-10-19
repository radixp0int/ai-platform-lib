import type { HTMLAttributes, ReactNode } from 'react'

export type LoadMoreLabels = {
  /** The button, which is there whether or not the list also loads on scroll. */
  loadMore: string
  /** On the button while a page is in flight, and announced to a screen reader. */
  loading: string
  /** Shown beside Retry when `error` is `true` rather than a message. */
  failed: string
  retry: string
  /** Shown once `hasMore` is false. */
  end: string
}

export type LoadMoreProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Whether anything is left to fetch. At `false` the tail says so and stops. */
  hasMore: boolean
  /**
   * A page is in flight. Must be true for as long as the fetch runs: it is
   * what stops the tail asking again, and its return to false is what lets a
   * viewport taller than one page ask for the next.
   */
  loading?: boolean
  /**
   * The last fetch failed. Shown beside a Retry button, and it stops loading
   * on scroll — a failing endpoint is not retried by a scroll wheel. Pass
   * `true` for the default message.
   */
  error?: ReactNode
  /**
   * Fetch the next page. Called by the button, by Retry, and — unless `auto`
   * is off — when the tail nears the visible area. It can be called again
   * before `loading` turns true, so ignore a call while a page is in flight.
   */
  onLoadMore: () => void
  /** Load when the tail scrolls near the visible area. Defaults to true; `false` leaves the button. */
  auto?: boolean
  /**
   * How many pixels before the end of the list loading starts, so the next
   * page is usually there before the reader is. Works inside any scroll
   * container, with no `root` to pass.
   */
  lead?: number
  /** Draw the `end` label when nothing is left. Defaults to true. */
  showEnd?: boolean
  labels?: Partial<LoadMoreLabels>
}
