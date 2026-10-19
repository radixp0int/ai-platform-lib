import { useCallback, useEffect, useRef, useState } from 'react'
import type { Page, PageRequest, Sort } from '../../components/paging'

/** One page of rows. Reject to report a failure; honour `signal` to be cancellable. */
export type FetchPage<T> = (request: PageRequest, signal: AbortSignal) => Promise<Page<T>>

type Options<T> = {
  size: number
  /** Keep its identity between renders (a module constant), or the list restarts. */
  sort?: Sort[]
  /** What makes two rows the same row. See the note on duplicates below. */
  getId: (row: T) => string
}

type State<T> = {
  items: T[]
  /** Rows across every page, once the first page has said. */
  total: number | null
  hasMore: boolean
  status: 'loading' | 'idle' | 'error'
}

const empty = <T>(): State<T> => ({ items: [], total: null, hasMore: true, status: 'loading' })
const NO_SORT: Sort[] = []

/**
 * Pages of a `Page<T>` endpoint, appended into one growing list.
 *
 * The host half of `LoadMore`: it fetches the first page on mount and the next
 * each time `loadMore` is called, and keeps what the tail needs to know —
 * whether more exists, whether a page is in flight, whether the last one
 * failed.
 *
 * Three things it is careful about, because a scrolling list gets all three
 * wrong by default:
 *
 * - **One request at a time.** `loadMore` while a page is in flight does
 *   nothing, so a scroll that fires twice cannot fetch page 3 twice or skip
 *   to page 4.
 * - **A failure keeps its place.** The page number only advances when a page
 *   arrives, so `loadMore` after an error asks for the same page again.
 * - **Duplicates are dropped.** Page numbers are positions, and positions
 *   move: answer a week-old conversation while the list is open and it jumps
 *   to the top, pushing the last row of page 2 onto page 3. A row already
 *   shown is skipped rather than drawn twice (and given the same React key).
 *   A backend with cursors does not have the problem; this one is written for
 *   the `?page=` endpoints the paging model describes.
 */
export function useInfinitePages<T>(
  fetchPage: FetchPage<T>,
  { size, sort = NO_SORT, getId }: Options<T>,
) {
  const [state, setState] = useState<State<T>>(empty)
  // Read by `loadMore` before the state it mirrors has re-rendered.
  const inFlight = useRef<AbortController | null>(null)
  const loadedPages = useRef(0)
  const finished = useRef(false)
  const idOf = useRef(getId)
  useEffect(() => {
    idOf.current = getId
  })

  const loadMore = useCallback(() => {
    if (inFlight.current || finished.current) return
    const controller = new AbortController()
    inFlight.current = controller
    setState((current) => ({ ...current, status: 'loading' }))

    fetchPage({ page: loadedPages.current + 1, size, sort }, controller.signal).then(
      (page) => {
        if (controller.signal.aborted) return
        inFlight.current = null
        loadedPages.current = page.page
        finished.current = page.last
        setState((current) => {
          const shown = new Set(current.items.map(idOf.current))
          const fresh = page.content.filter((row) => !shown.has(idOf.current(row)))
          return {
            items: [...current.items, ...fresh],
            total: page.totalElements,
            hasMore: !page.last,
            status: 'idle',
          }
        })
      },
      () => {
        if (controller.signal.aborted) return
        inFlight.current = null
        setState((current) => ({ ...current, status: 'error' }))
      },
    )
  }, [fetchPage, size, sort])

  // The first page — and a clean restart when the source, size or sort changes.
  useEffect(() => {
    loadedPages.current = 0
    finished.current = false
    setState(empty())
    loadMore()
    return () => {
      inFlight.current?.abort()
      inFlight.current = null
    }
  }, [loadMore])

  return {
    items: state.items,
    total: state.total,
    hasMore: state.hasMore,
    loading: state.status === 'loading',
    failed: state.status === 'error',
    /** Nothing has arrived yet: the first page is in flight, or it failed. */
    pending: state.total === null,
    loadMore,
  }
}
