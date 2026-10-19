// Every conversation the viewer has had, newest update first, fetched a page
// at a time as they scroll.
//
// The split is the same as the tenants page: the parts know nothing and the
// page holds everything. <LoadMore/> only reports that the end of the list is
// near; useInfinitePages owns the page number, the request in flight and the
// rows so far; `fetchHistory` is the one seam to the server. Here it is a
// simulated endpoint, so the page does on a timer what a real one does over
// the network, and nothing below changes when it is swapped.
//
// Search and the date filter are part of the request, not a pass over the
// cards: the page only holds what has been scrolled to, so only the server can
// say what matches. Changing either starts the list again from page one.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LoadMore } from '../../components/load-more'
import { PageHeader } from '../../components/page-header'
import type { Sort } from '../../components/paging'
import { chatHistory, type ChatSummary } from '../../fixtures/platform/chatHistory'
import { Alert } from '../../primitives/alert'
import { Button, ButtonLink } from '../../primitives/button'
import type { DateRange } from '../../primitives/date-field'
import { PlusIcon } from '../../primitives/icons'
import { ThemeToggle } from '../../primitives/theme-toggle'
import { HistoryCard, HistoryCardPlaceholder } from './history-card'
import { HistoryFilters } from './history-filters'
import { createHistoryApi, type FetchHistory, type HistoryQuery } from './historyApi'
import { toIsoDay } from './historyDates'
import { NO_RANGE, describePeriod, periodRange, type Period } from './historyPeriod'
import { useInfinitePages, type FetchPage } from './useInfinitePages'

export type ChatHistoryPageProps = {
  /** Where pages come from, for a given search and date range. Must keep its identity between renders. */
  fetchHistory?: FetchHistory
  /** Conversations per request. */
  pageSize?: number
  /** Load the next page on scroll. Off leaves the "Load more" button as the only way. */
  loadOnScroll?: boolean
  /** Where a card goes. The host's router decides what that means. */
  chatHref?: (chat: ChatSummary) => string
  /** How long after the last keystroke a search is sent. Enter sends it at once. */
  searchDelayMs?: number
}

const demoApi = createHistoryApi(chatHistory)
const SORT: Sort[] = [{ field: 'updatedAt', direction: 'desc' }]
const chatId = (chat: ChatSummary) => chat.id
const defaultHref = (chat: ChatSummary) => `#/chat/${chat.id}`

/** The current time, refreshed each minute, so "5 minutes ago" does not sit there for an hour. */
function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export function ChatHistoryPage({
  fetchHistory = demoApi,
  pageSize = 12,
  loadOnScroll = true,
  chatHref = defaultHref,
  searchDelayMs = 300,
}: ChatHistoryPageProps) {
  // `draft` is what is in the box; `search` is what has been asked for. They
  // differ for a moment after each keystroke, so a word costs one request.
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<Period>('any')
  const [custom, setCustom] = useState<DateRange>(NO_RANGE)
  const top = useRef<HTMLDivElement>(null)

  // New results start at the top; a reader three pages down should not have
  // to find their way back to see them.
  const toTop = () => top.current?.scrollIntoView({ block: 'nearest' })

  useEffect(() => {
    const term = draft.trim()
    if (term === search) return
    const timer = setTimeout(() => {
      setSearch(term)
      toTop()
    }, searchDelayMs)
    return () => clearTimeout(timer)
  }, [draft, search, searchDelayMs])

  const range = useMemo(() => periodRange(period, custom), [period, custom])
  const query = useMemo<HistoryQuery>(
    () => ({ search, updatedFrom: range.from, updatedTo: range.to }),
    [search, range],
  )
  // A new function whenever the query changes — which is what restarts the
  // list, and what cancels the request the old query still had in flight.
  const fetchPage = useCallback<FetchPage<ChatSummary>>(
    (request, signal) => fetchHistory(query, request, signal),
    [fetchHistory, query],
  )

  const { items, total, hasMore, loading, failed, pending, loadMore } = useInfinitePages(
    fetchPage,
    { size: pageSize, sort: SORT, getId: chatId },
  )
  const now = useNow()

  const when = describePeriod(period, range)
  const filtered = search !== '' || when !== ''
  // A history with nothing in it has nothing to search.
  const bare = total === 0 && !filtered && draft === '' && period === 'any'
  const clearFilters = () => {
    setDraft('')
    setSearch('')
    setPeriod('any')
    setCustom(NO_RANGE)
  }

  // Placeholders for exactly the cards on their way, so the page grows once —
  // when they are drawn — and not again when the real ones replace them.
  const arriving = !loading
    ? 0
    : total === null
      ? pageSize
      : Math.min(pageSize, total - items.length)

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Where "back to the top" goes: a point, so `nearest` has somewhere to scroll to. */}
      <div ref={top} aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 max-sm:px-3">
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="Chat history"
            // Polite, so a screen reader hears the count change as pages land
            // without the list itself being read out again.
            aria-live="polite"
            descriptionClassName="text-sm text-ink-soft tabular-nums"
            description={summarise({ total, shown: items.length, hasMore, failed, filtered })}
          />
          <div className="flex shrink-0 items-center gap-2">
            <ButtonLink
              href="#/chat/new"
              variant="primary"
              icon={<PlusIcon width={15} height={15} />}
            >
              New chat
            </ButtonLink>
            <ThemeToggle />
          </div>
        </div>

        {!bare && (
          // Stays in reach while the list scrolls under it. The negative margins
          // give it a canvas-coloured border to hide the cards behind.
          <div className="sticky top-0 z-10 -m-2 flex flex-col gap-3 bg-canvas p-2">
            <HistoryFilters
              draft={draft}
              onDraftChange={setDraft}
              onSubmit={() => {
                setSearch(draft.trim())
                toTop()
              }}
              period={period}
              onPeriodChange={(next) => {
                setPeriod(next)
                toTop()
              }}
              custom={custom}
              onCustomChange={(next) => {
                setCustom(next)
                toTop()
              }}
              today={toIsoDay(new Date(now))}
            />
          </div>
        )}

        {pending && failed ? (
          <Alert
            tone="error"
            title="Your conversations could not be loaded"
            action={{ label: 'Try again', onClick: loadMore }}
          >
            The history service did not answer. Nothing has been lost.
          </Alert>
        ) : total === 0 && filtered ? (
          <EmptyPanel title="No conversations match">
            <p className="max-w-sm text-sm text-ink-soft">
              {search ? (
                <>
                  Nothing with <strong className="font-bold text-ink">“{search}”</strong> in its
                  title{when ? ` was updated ${when}` : ' was found'}.
                </>
              ) : (
                <>Nothing was updated {when}.</>
              )}
            </p>
            <Button onClick={clearFilters} className="mt-1">
              Clear search and filters
            </Button>
          </EmptyPanel>
        ) : total === 0 ? (
          <EmptyPanel title="Nothing here yet">
            <p className="max-w-sm text-sm text-ink-soft">
              Conversations are kept here once you start one, with the most recently updated first.
            </p>
            <ButtonLink href="#/chat/new" variant="primary" className="mt-1">
              Start a conversation
            </ButtonLink>
          </EmptyPanel>
        ) : (
          <>
            <ul
              className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
              aria-label="Conversations"
              aria-busy={loading}
            >
              {items.map((chat) => (
                <li key={chat.id} className="flex min-w-0">
                  <HistoryCard chat={chat} href={chatHref(chat)} now={now} highlight={search} />
                </li>
              ))}
              {Array.from({ length: arriving }, (_, index) => (
                <li key={`arriving-${index}`} aria-hidden className="flex min-w-0">
                  <HistoryCardPlaceholder />
                </li>
              ))}
            </ul>

            {!pending && (
              <LoadMore
                hasMore={hasMore}
                loading={loading}
                error={failed ? 'The next conversations could not be loaded.' : undefined}
                onLoadMore={loadMore}
                auto={loadOnScroll}
                labels={{
                  loadMore: 'Load more conversations',
                  loading: 'Loading more conversations…',
                  end: filtered ? 'That is every match.' : 'That is every conversation.',
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** The line under the title: what is loaded, out of how many, and whether that is everything or a match. */
function summarise({
  total,
  shown,
  hasMore,
  failed,
  filtered,
}: {
  total: number | null
  shown: number
  hasMore: boolean
  failed: boolean
  filtered: boolean
}) {
  const order = 'most recently updated first'
  if (total === null) {
    if (failed) return `Your conversations, ${order}.`
    return filtered ? 'Searching your conversations…' : 'Loading your conversations…'
  }
  if (total === 0) return filtered ? 'No conversations match.' : 'No conversations yet.'
  const count = total.toLocaleString()
  const noun = `${filtered ? 'matching ' : ''}${total === 1 ? 'conversation' : 'conversations'}`
  return hasMore ? `Showing ${shown} of ${count} ${noun}, ${order}.` : `${count} ${noun}, ${order}.`
}

/** What stands where the list would be when there is nothing to list. */
function EmptyPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-surface border border-dashed border-line px-6 py-14 text-center">
      <h2 className="text-[17px] font-extrabold text-ink-strong">{title}</h2>
      {children}
    </div>
  )
}
