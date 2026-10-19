import type { ChatSummary } from '../../fixtures/platform/chatHistory'
import { Card } from '../../primitives/card'
import { Skeleton } from '../../primitives/skeleton'
import { formatCreated, formatUpdated } from './historyDates'

const DATE_LABEL = 'text-[11px] font-semibold text-ink-soft'
const DATE_VALUE = 'truncate text-[12.5px] text-ink'

export type HistoryCardProps = {
  chat: ChatSummary
  href: string
  /** The moment "2 hours ago" is counted back from. */
  now: number
  /** The search that found this card, marked where the title matches it. */
  highlight?: string
}

/** One conversation: its title as the link, then when it was updated and when it was created. */
export function HistoryCard({ chat, href, now, highlight = '' }: HistoryCardProps) {
  return (
    <Card
      className="w-full"
      headingLevel={2}
      href={href}
      title={
        <span className="line-clamp-2">
          <Highlighted text={chat.title} term={highlight} />
        </span>
      }
      footer={
        // Two fixed columns, so the dates line up down the grid and a long
        // "Updated" never pushes "Created" to a new line.
        <dl className="grid w-full grid-cols-2 gap-x-4">
          <div className="min-w-0">
            <dt className={DATE_LABEL}>Updated</dt>
            <dd className={DATE_VALUE}>
              <time dateTime={chat.updatedAt}>{formatUpdated(chat.updatedAt, now)}</time>
            </dd>
          </div>
          <div className="min-w-0">
            <dt className={DATE_LABEL}>Created</dt>
            <dd className={DATE_VALUE}>
              <time dateTime={chat.createdAt}>{formatCreated(chat.createdAt)}</time>
            </dd>
          </div>
        </dl>
      }
    />
  )
}

/** The matched part of a title, marked. */
function Highlighted({ text, term }: { text: string; term: string }) {
  const at = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-brand-fg/15 text-inherit">
        {text.slice(at, at + term.length)}
      </mark>
      {text.slice(at + term.length)}
    </>
  )
}

/** The outline of a card on its way: a title line and a half, then the two dates. */
export function HistoryCardPlaceholder() {
  return (
    <div className="flex w-full flex-col gap-4 rounded-surface border border-line bg-panel-solid p-5.5">
      <div className="flex flex-col gap-2 py-0.5">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-x-4">
        {[0, 1].map((column) => (
          <div key={column} className="flex flex-col gap-1.5 py-0.5">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
