import { useEffect, useRef } from 'react'
import { withDefaults } from '../../lib/withDefaults'
import { Button } from '../../primitives/button'
import type { LoadMoreLabels, LoadMoreProps } from './types'

const DEFAULT_LABELS: LoadMoreLabels = {
  loadMore: 'Load more',
  loading: 'Loading more…',
  failed: 'Could not load more.',
  retry: 'Try again',
  end: 'You have reached the end.',
}

/**
 * The tail of a list that grows: put it after the last row and it asks for the
 * next page as the reader gets near it.
 *
 * It fetches nothing and holds no rows. The host owns the list, the page it is
 * on and the request; this reports "more is wanted" through `onLoadMore` and
 * draws the four things the end of such a list can be: more to come, a page in
 * flight, a failure, the end.
 *
 * The button is always there while more exists. Loading on scroll is the
 * shortcut, not the only way: a reader on a keyboard, or in a browser where
 * the observer never fires, still has a control that does the same thing.
 */
export function LoadMore({
  hasMore,
  loading = false,
  error,
  onLoadMore,
  auto = true,
  lead = 400,
  showEnd = true,
  labels: overrides,
  className = '',
  ...rest
}: LoadMoreProps) {
  const labels = withDefaults(DEFAULT_LABELS, overrides)
  const sentinel = useRef<HTMLSpanElement>(null)
  const failed = error != null && error !== false
  const watching = auto && hasMore && !loading && !failed

  // No dependency list, deliberately. An observer only reports a *change*, so
  // one left running would say nothing when a page lands and the tail is still
  // in view — a short page, a tall screen — and the list would stall there. A
  // fresh observer reports where the tail is now, which is the question after
  // every render.
  useEffect(() => {
    const node = sentinel.current
    if (!watching || !node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore()
    })
    observer.observe(node)
    return () => observer.disconnect()
  })

  if (!hasMore && !failed && !showEnd) return null

  return (
    <div
      {...rest}
      className={`relative flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 text-[13px] text-ink-soft ${className}`}
    >
      {/* Reaches `lead` pixels back up the list, so "near the end" is simply
          "this is on screen" — true in the page and in any panel that scrolls. */}
      {watching && (
        <span
          ref={sentinel}
          aria-hidden
          data-load-more-sentinel=""
          className="pointer-events-none absolute bottom-0 left-0 w-px"
          style={{ height: `calc(100% + ${lead}px)` }}
        />
      )}

      {failed ? (
        <>
          <span role="alert" className="text-danger-fg">
            {error === true ? labels.failed : error}
          </span>
          <Button size="sm" onClick={onLoadMore}>
            {labels.retry}
          </Button>
        </>
      ) : hasMore ? (
        <>
          {/* Dimmed, not disabled, while a page is in flight: a disabled
              button drops focus, and the reader who pressed it is still there. */}
          <Button
            size="sm"
            aria-disabled={loading || undefined}
            className={loading ? 'cursor-default opacity-70' : ''}
            icon={
              loading ? (
                <span
                  aria-hidden
                  className="size-3 animate-spin rounded-full border-2 border-line border-t-brand-fg motion-reduce:animate-none"
                />
              ) : undefined
            }
            onClick={() => {
              if (!loading) onLoadMore()
            }}
          >
            {loading ? labels.loading : labels.loadMore}
          </Button>
          <span role="status" className="sr-only">
            {loading ? labels.loading : ''}
          </span>
        </>
      ) : (
        <span>{labels.end}</span>
      )}
    </div>
  )
}
