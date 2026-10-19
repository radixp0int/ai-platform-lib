import { djangoPageAdapter, type Page, type PageRequest } from '../../components/paging'
import type { ChatSummary } from '../../fixtures/platform/chatHistory'
import { dayEnd, dayStart } from './historyDates'

/**
 * What narrows the history. Every field is optional and they combine with AND.
 * The dates are local calendar days, `YYYY-MM-DD`, both inclusive — the form
 * the date fields speak — and they are about when a conversation was last
 * updated, which is what the list is ordered by.
 */
export type HistoryQuery = {
  /** Matched against the title, ignoring case. */
  search?: string
  updatedFrom?: string | null
  updatedTo?: string | null
}

/** One page of the conversations a query matches. */
export type FetchHistory = (
  query: HistoryQuery,
  request: PageRequest,
  signal: AbortSignal,
) => Promise<Page<ChatSummary>>

export type HistoryApiOptions = {
  /** How long each page takes to arrive. */
  latencyMs?: number
  /**
   * Which requests are refused. `attempt` counts requests for that page since
   * the list last started over, so `(page, attempt) => page === 3 && attempt === 1`
   * is a page that fails once and then loads.
   */
  fails?: (page: number, attempt: number) => boolean
}

/** What `?search=&updated_after=&updated_before=` would do, done over the array. */
function matching(rows: ChatSummary[], { search, updatedFrom, updatedTo }: HistoryQuery) {
  const term = search?.trim().toLowerCase()
  const from = updatedFrom ? dayStart(updatedFrom) : -Infinity
  const to = updatedTo ? dayEnd(updatedTo) : Infinity
  return rows.filter((row) => {
    const updated = Date.parse(row.updatedAt)
    return updated >= from && updated < to && (!term || row.title.toLowerCase().includes(term))
  })
}

/**
 * A history endpoint with no server behind it:
 * `GET /chats?search=&updated_after=&updated_before=&page=&size=` over an
 * array, on a timer. Filtering happens here, on the "server", because it has
 * to: the page only ever holds the rows it has scrolled to.
 *
 * It answers in the Django envelope and goes through `djangoPageAdapter`, so
 * the page reads the same `Page<T>` it would from the real service — an app
 * replaces this function with a `fetch` and that one adapter call, and nothing
 * on the page changes. Timers only and nothing random, so a browser test
 * installs `page.clock` and decides how much time passes.
 */
export function createHistoryApi(
  rows: ChatSummary[],
  { latencyMs = 600, fails }: HistoryApiOptions = {},
): FetchHistory {
  const attempts = new Map<number, number>()

  return (query, { page, size }, signal) =>
    new Promise((resolve, reject) => {
      if (page === 1) attempts.clear()
      const attempt = (attempts.get(page) ?? 0) + 1
      attempts.set(page, attempt)

      const timer = setTimeout(() => {
        if (fails?.(page, attempt)) return reject(new Error('The history service did not answer.'))
        const matches = matching(rows, query)
        const start = (page - 1) * size
        const content = matches.slice(start, start + size)
        const pages = Math.max(1, Math.ceil(matches.length / size))
        resolve(
          djangoPageAdapter<ChatSummary>({
            success: true,
            data: {
              content,
              first: page === 1,
              last: page >= pages,
              page: { elements: content.length, number: page - 1, offset: start + 1, size },
              total: { elements: matches.length, pages },
              sort: 'updatedAt,desc',
            },
          }),
        )
      }, latencyMs)
      signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
    })
}
