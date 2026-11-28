import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { FollowupChips } from '../../chat/components/followup-chips'
import { Markdown } from '../../chat/components/markdown'
import { InSideMenu } from '../../components/side-menu'
import { PageBand } from '../../components/page-header'
import {
  CHAT_SUGGESTIONS,
  CONVERSATIONS,
  dayOf,
  isoDay,
  updatedAt,
  whenLabel,
  type ConversationTag,
  type PastConversation,
} from '../../fixtures/platform/conversations'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { Button, ButtonLink } from '../../primitives/button'
import { DateField, type IsoDate } from '../../primitives/date-field'
import {
  ArrowRightIcon,
  ChatIcon,
  ChevronLeftIcon,
  PinIcon,
  PlusIcon,
  TriangleAlertIcon,
} from '../../primitives/icons'
import { Pill } from '../../primitives/pill'
import { Popover } from '../../primitives/popover'
import { SearchField } from '../../primitives/search-field'
import { SegmentedControl } from '../../primitives/segmented-control'
import { Skeleton } from '../../primitives/skeleton'
import { usePlatform } from '../app-shell/platform-context'
import { ChatPanel } from '../chat/chat-panel'

/** How the page's list came back. The stories show each one. */
export type HistoryLoad = 'ready' | 'loading' | 'error' | 'empty'

type When = 'any' | 'today' | 'week' | 'custom'
type Show = 'all' | 'pinned' | ConversationTag

const SHOWS: { id: Show; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'draft', label: 'Has a draft' },
  { id: 'flow', label: 'Started a workflow' },
  { id: 'shared', label: 'Shared with me' },
  { id: 'flag', label: 'Answer flagged' },
]

const TAG_LABEL: Record<ConversationTag, string> = {
  draft: 'Draft ready',
  flow: 'Started a workflow',
  shared: 'Shared',
  flag: 'Answer flagged',
}

const TAG_TONE = { draft: 'brand', flow: 'success', shared: 'neutral', flag: 'danger' } as const

const DAYS = ['Today', 'Yesterday', 'This week', 'Older'] as const

/** How far back the history goes, in days. */
const HISTORY_DAYS = 30

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export type ChatHistoryPageProps = {
  /** `/t/<tenant>`, for the page's links. */
  base: string
  /** How the list loads. Defaults to `ready`. */
  initialLoad?: HistoryLoad
}

/**
 * Chat history, Finals 2.0: the navy band with New chat, then one card with
 * search, when the chats were last updated, and the labels to show; under
 * them the chats grouped by day beside the one picked, with its last answer,
 * sources and the questions to pick up with. Pin, share, rename and delete act
 * on the picked chat; a delete can be undone for a few seconds. Below 900px
 * the list and the preview take turns.
 */
export function ChatHistoryPage({ base, initialLoad = 'ready' }: ChatHistoryPageProps) {
  const [load, setLoad] = useState<HistoryLoad>(initialLoad)
  const [query, setQuery] = useState('')
  const [when, setWhen] = useState<When>('any')
  const [show, setShow] = useState<Show>('all')
  const today = isoDay(new Date())
  const earliest = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - HISTORY_DAYS)
    return isoDay(date)
  }, [])
  const [range, setRange] = useState(() => {
    const from = new Date()
    from.setDate(from.getDate() - 14)
    const to = new Date()
    to.setDate(to.getDate() - 5)
    return { from: isoDay(from), to: isoDay(to) }
  })
  const [pins, setPins] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONVERSATIONS.map((c) => [c.id, !!c.pinned])),
  )
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [deleted, setDeleted] = useState<Record<string, boolean>>({})
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id)
  const [paneOpen, setPaneOpen] = useState(false)
  const [toast, setToast] = useState<{ text: string; undo?: string } | null>(null)
  const narrow = useMediaQuery('(max-width: 899px)')

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  const live = CONVERSATIONS.filter((c) => !deleted[c.id])
  const titleOf = (c: PastConversation) => titles[c.id] ?? c.title
  const needle = query.trim().toLowerCase()
  const inWhen = (c: PastConversation) => {
    if (when === 'today') return dayOf(c) === 'Today'
    if (when === 'week') return dayOf(c) !== 'Older'
    if (when === 'custom') {
      const day = isoDay(updatedAt(c))
      return day >= range.from && day <= range.to
    }
    return true
  }
  const inQuery = (c: PastConversation) =>
    !needle || `${titleOf(c)} ${c.lastAnswer} ${c.area}`.toLowerCase().includes(needle)
  const hasShow = (c: PastConversation, id: Show) =>
    id === 'all' || (id === 'pinned' ? pins[c.id] : c.tags.includes(id))
  const shown = live.filter((c) => inWhen(c) && inQuery(c) && hasShow(c, show))
  const groups = [
    { name: 'Pinned', items: shown.filter((c) => pins[c.id]) },
    ...DAYS.map((day) => ({
      name: day,
      items: shown.filter((c) => !pins[c.id] && dayOf(c) === day),
    })),
  ].filter((group) => group.items.length > 0)
  const current = shown.find((c) => c.id === selectedId) ?? shown[0]
  const pinnedCount = live.filter((c) => pins[c.id]).length

  const countLine =
    load === 'loading'
      ? 'Loading your chats…'
      : load === 'error'
        ? 'Couldn’t load your chats'
        : load === 'empty'
          ? 'No conversations yet'
          : `${when === 'custom' ? `${shown.length} of ` : ''}${live.length} conversations · ${pinnedCount} pinned · most recent first`

  const retry = () => {
    setLoad('loading')
    setTimeout(() => setLoad('ready'), 1500)
  }
  const clearFilters = () => {
    setQuery('')
    setWhen('any')
    setShow('all')
  }

  const showList = !narrow || !paneOpen
  const showPane = !narrow || paneOpen

  return (
    <>
      <InSideMenu
        action={{
          label: 'New chat',
          icon: <PlusIcon width={16} height={16} />,
          href: `${base}/chat`,
        }}
      >
        <ChatPanel base={base} onHistory />
      </InSideMenu>
      <PageBand
        title="Chat history"
        description={countLine}
        breadcrumbs={[
          { label: 'Overview', href: `${base}/home` },
          { label: 'Use' },
          { label: 'Chat', href: `${base}/chat` },
        ]}
        actions={
          <ButtonLink
            variant="inverse-solid"
            href={`${base}/chat`}
            icon={<PlusIcon width={15} height={15} />}
          >
            New chat
          </ButtonLink>
        }
        className="min-h-full bg-canvas"
      >
        <div className="relative rounded-surface bg-panel-solid shadow-[0_0_0_1px_var(--line),0_18px_40px_-22px_rgb(0_25_50/0.35)]">
          {load !== 'empty' && (
            <div
              aria-disabled={load !== 'ready' || undefined}
              className={load === 'ready' ? '' : 'pointer-events-none opacity-45'}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-b border-line px-4 py-3.5">
                <SearchField
                  label="Search conversations"
                  type="search"
                  placeholder="Search titles and answers"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  containerClassName="min-w-0 flex-[1_1_260px]"
                />
                <WhenControl
                  when={when}
                  range={range}
                  min={earliest}
                  max={today}
                  onWhen={setWhen}
                  onRange={(next) => {
                    setRange(next)
                    setWhen('custom')
                  }}
                />
              </div>
              <div
                role="group"
                aria-label="Show"
                className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2.5"
              >
                {SHOWS.map((item) => {
                  const count = live.filter(
                    (c) => hasShow(c, item.id) && inWhen(c) && inQuery(c),
                  ).length
                  const on = show === item.id
                  return (
                    <Pill
                      key={item.id}
                      tone={on ? 'brand' : 'neutral'}
                      variant={on ? 'soft' : 'outline'}
                      aria-pressed={on}
                      onClick={() => setShow(item.id)}
                    >
                      {item.label}
                      <span className="ml-1 opacity-70 tabular-nums">
                        {load === 'ready' ? count : ''}
                      </span>
                    </Pill>
                  )
                })}
              </div>
            </div>
          )}

          {load === 'loading' && <LoadingState />}
          {load === 'error' && <ErrorState onRetry={retry} />}
          {load === 'empty' && <EmptyHistory base={base} />}
          {load === 'ready' && (
            <div className="grid min-h-[620px] grid-cols-[400px_minmax(0,1fr)] max-[1200px]:grid-cols-[330px_minmax(0,1fr)] max-[1000px]:grid-cols-[270px_minmax(0,1fr)] max-[899px]:grid-cols-1">
              {showList && (
                <div
                  role="region"
                  aria-label="Chat list"
                  className="min-w-0 border-r border-line max-[899px]:border-r-0"
                >
                  {groups.map((group) => (
                    <section key={group.name} aria-label={group.name}>
                      <h3 className="flex items-center gap-2 px-4 pt-3.5 pb-1.5 text-[10.5px] font-extrabold tracking-[0.08em] text-ink-soft uppercase">
                        {group.name}
                        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-chip px-1.5 tracking-normal text-chip-fg">
                          {group.items.length}
                        </span>
                      </h3>
                      {group.items.map((c) => {
                        const selected = c.id === current?.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              setSelectedId(c.id)
                              setPaneOpen(true)
                            }}
                            className={`block w-full border-t border-line px-4 py-2.5 text-left transition focus-visible:-outline-offset-2 ${
                              selected
                                ? 'bg-chip shadow-[inset_3px_0_0_var(--accent)]'
                                : 'hover:bg-tint/5'
                            }`}
                          >
                            <span className="flex items-baseline gap-2.5">
                              <b className="min-w-0 flex-1 truncate text-[13.5px] font-extrabold text-ink-strong">
                                {titleOf(c)}
                              </b>
                              <span className="text-[11.5px] whitespace-nowrap text-ink-soft">
                                {whenLabel(c)}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate text-[12.5px] text-ink-soft max-[1000px]:hidden max-[899px]:block">
                              {c.lastAnswer}
                            </span>
                            {c.tags.length > 0 && (
                              <span className="mt-1.5 flex flex-wrap gap-1.5">
                                {c.tags.map((tag) => (
                                  <Pill key={tag} size="sm" tone={TAG_TONE[tag]}>
                                    {tag === 'shared' && c.sharedBy
                                      ? `Shared by ${c.sharedBy}`
                                      : TAG_LABEL[tag]}
                                  </Pill>
                                ))}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </section>
                  ))}
                  {shown.length === 0 && (
                    <p className="px-4 py-10 text-center text-[13.5px] text-ink-soft">
                      No conversations match.{' '}
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="font-extrabold text-accent-fg hover:underline"
                      >
                        Clear the filters
                      </button>
                    </p>
                  )}
                </div>
              )}
              {showPane && current && (
                <Preview
                  key={current.id}
                  base={base}
                  conversation={current}
                  title={titleOf(current)}
                  pinned={!!pins[current.id]}
                  narrow={narrow}
                  onBack={() => setPaneOpen(false)}
                  onTogglePin={() => {
                    const next = !pins[current.id]
                    setPins((all) => ({ ...all, [current.id]: next }))
                    setToast({ text: next ? 'Pinned to the top' : 'Unpinned' })
                  }}
                  onRename={(title) => {
                    setTitles((all) => ({ ...all, [current.id]: title }))
                    setToast({ text: 'Renamed' })
                  }}
                  onDelete={() => {
                    setDeleted((all) => ({ ...all, [current.id]: true }))
                    setPaneOpen(false)
                    setToast({ text: 'Chat deleted', undo: current.id })
                  }}
                />
              )}
            </div>
          )}

          <div
            role="status"
            className={`absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3.5 rounded-xl bg-ink-strong py-2.5 pr-3 pl-4 text-[13px] font-bold text-canvas shadow-lg transition ${
              toast ? 'opacity-100' : 'pointer-events-none invisible opacity-0'
            }`}
          >
            <span>{toast?.text}</span>
            {toast?.undo && (
              <button
                type="button"
                onClick={() => {
                  const id = toast.undo!
                  setDeleted((all) => ({ ...all, [id]: false }))
                  setToast(null)
                }}
                className="rounded-md bg-white/15 px-2 py-1 text-[12.5px] font-extrabold dark:bg-black/10"
              >
                Undo
              </button>
            )}
          </div>
        </div>
      </PageBand>
    </>
  )
}

type Range = { from: string; to: string }

/** Any time, Today, This week, or a custom range picked in a popover under the control. */
function WhenControl({
  when,
  range,
  min,
  max,
  onWhen,
  onRange,
}: {
  when: When
  range: Range
  min: string
  max: string
  onWhen: (when: When) => void
  onRange: (range: Range) => void
}) {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState<IsoDate>(range.from)
  const [to, setTo] = useState<IsoDate>(range.to)
  const [error, setError] = useState('')

  const apply = () => {
    if (!from || !to) return setError('Pick both dates.')
    if (from > to) return setError('The first date has to come before the second.')
    if (from < min || to > max)
      return setError(`History goes back to ${shortDate(min)} and up to today.`)
    onRange({ from, to })
    setOpen(false)
  }

  return (
    <div ref={setAnchor}>
      <SegmentedControl
        label="When"
        value={when}
        className="[&>button]:px-3"
        options={[
          { value: 'any', label: 'Any time' },
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This week' },
          {
            value: 'custom',
            label:
              when === 'custom'
                ? `${shortDate(range.from)} – ${shortDate(range.to)}`
                : 'Custom range',
          },
        ]}
        onValueChange={(value) => {
          if (value === 'custom') {
            setFrom(range.from)
            setTo(range.to)
            setError('')
            setOpen(true)
          } else {
            setOpen(false)
            onWhen(value as When)
          }
        }}
      />
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label="Custom date range"
        width={320}
        align="end"
      >
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between">
            <b className="text-sm font-extrabold text-ink-strong">Custom range</b>
            <span className="text-[11.5px] text-ink-soft">Back to {shortDate(min)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <DateField
              label="From"
              showLabel
              value={from}
              min={min}
              max={max}
              onChange={(value) => {
                setFrom(value)
                setError('')
              }}
            />
            <DateField
              label="To"
              showLabel
              value={to}
              min={min}
              max={max}
              onChange={(value) => {
                setTo(value)
                setError('')
              }}
            />
          </div>
          {error && (
            <p role="alert" className="text-xs font-bold text-danger-fg">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  )
}

const label = 'text-[10.5px] font-extrabold tracking-[0.08em] text-ink-soft uppercase'

/** The picked chat: what it was about, its last answer, sources, and what to ask next. */
function Preview({
  base,
  conversation: c,
  title,
  pinned,
  narrow,
  onBack,
  onTogglePin,
  onRename,
  onDelete,
}: {
  base: string
  conversation: PastConversation
  title: string
  pinned: boolean
  narrow: boolean
  onBack: () => void
  onTogglePin: () => void
  onRename: (title: string) => void
  onDelete: () => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(title)
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      role="region"
      aria-label="Conversation preview"
      className="flex min-w-0 animate-fade-up flex-col gap-[18px] px-8 pt-[26px] pb-8 max-[1200px]:px-6"
    >
      {narrow && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-8 items-center gap-1.5 self-start rounded-control pr-2.5 pl-1.5 text-[13px] font-extrabold text-accent-fg hover:bg-chip"
        >
          <ChevronLeftIcon width={15} height={15} />
          All chats
        </button>
      )}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs text-ink-soft">
        <Pill size="sm" tone="neutral">
          {c.area}
        </Pill>
        <span>{c.messages} messages</span>
        <span>
          {c.sources.length} {c.sources.length === 1 ? 'source' : 'sources'}
        </span>
        <span>Updated {whenLabel(c)}</span>
      </div>
      {renaming ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const next = draft.trim()
            if (!next) return
            onRename(next)
            setRenaming(false)
          }}
        >
          <label className="sr-only" htmlFor="history-rename">
            Chat title
          </label>
          <input
            id="history-rename"
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-10 flex-[1_1_320px] rounded-control border border-accent bg-panel-solid px-3 text-[17px] font-extrabold text-ink-strong outline-none focus:ring-2 focus:ring-accent/30"
          />
          <Button type="submit" size="sm" variant="primary">
            Save
          </Button>
          <Button size="sm" onClick={() => setRenaming(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <h2 className="text-[22px] leading-tight font-extrabold tracking-tight text-ink-strong max-[1000px]:text-[19px]">
          {title}
        </h2>
      )}
      <div className="flex flex-wrap gap-2">
        <ButtonLink variant="primary" size="sm" href={`${base}/chat/c/${c.id}`}>
          Continue the chat
        </ButtonLink>
        <Button
          size="sm"
          aria-pressed={pinned}
          icon={<PinIcon width={15} height={15} />}
          onClick={onTogglePin}
        >
          {pinned ? 'Unpin' : 'Pin'}
        </Button>
        <Button size="sm">Share</Button>
        <Button
          size="sm"
          onClick={() => {
            setDraft(title)
            setConfirming(false)
            setRenaming(true)
          }}
        >
          Rename
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            setRenaming(false)
            setConfirming(true)
          }}
        >
          Delete
        </Button>
      </div>
      {confirming && (
        <div
          role="alertdialog"
          aria-label="Confirm delete"
          className="flex animate-fade-up flex-wrap items-center gap-2 bg-danger-fg/5 px-3 py-2.5 shadow-[inset_3px_0_0_var(--danger-fg),0_0_0_1px_color-mix(in_srgb,var(--danger-fg)_20%,transparent)]"
        >
          <p className="flex-[1_1_240px] text-[13px] text-ink">
            Delete “{title}”? You can undo for a few seconds.
          </p>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Delete chat
          </Button>
          <Button size="sm" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <p className={label}>Last answer</p>
        <Markdown text={`> ${c.lastAnswer}`} quoteRail="subtle" quoteFont="italic" />
      </div>
      <div className="flex flex-col gap-2">
        <p className={label}>Sources</p>
        <ul className="flex flex-wrap gap-1.5">
          {c.sources.map((source) => (
            <li key={source}>
              <Pill variant="outline" tone="neutral">
                {source}
              </Pill>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2 pl-7">
        <p className={`${label} -ml-7`}>Pick up with</p>
        <PickUpWith base={base} items={c.followups} />
      </div>
    </div>
  )
}

/** A follow-up starts a new chat with that question. */
function PickUpWith({ base, items }: { base: string; items: string[] }) {
  const { go } = usePlatform()
  return (
    <FollowupChips
      items={items}
      onPick={(text) => go(`${base}/chat/new?q=${encodeURIComponent(text)}`)}
    />
  )
}

function LoadingState() {
  const widths = [70, 55, 80, 60, 75, 50, 66, 58]
  return (
    <div
      aria-busy="true"
      aria-label="Loading your chats"
      role="status"
      className="grid min-h-[620px] grid-cols-[400px_minmax(0,1fr)] max-[1200px]:grid-cols-[330px_minmax(0,1fr)] max-[899px]:grid-cols-1"
    >
      <div className="border-r border-line max-[899px]:border-r-0">
        {widths.map((w, i) => (
          <div key={i} className="flex flex-col gap-2 border-t border-line px-4 py-3.5">
            <Skeleton className="h-[13px]" style={{ width: `${w}%` }} />
            <Skeleton className="h-[11px]" style={{ width: `${w + 15}%` }} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3.5 px-8 py-[26px] max-[899px]:hidden">
        {[
          [30, 14],
          [70, 22],
          [55, 34],
          [90, 60],
          [40, 26],
          [60, 30],
        ].map(([w, h], i) => (
          <Skeleton key={i} style={{ width: `${w}%`, height: h }} />
        ))}
      </div>
    </div>
  )
}

function StateBox({ children, alert }: { children: ReactNode; alert?: boolean }) {
  return (
    <div
      role={alert ? 'alert' : undefined}
      className="flex min-h-[520px] animate-fade-up flex-col items-center justify-center gap-3 p-8 text-center"
    >
      {children}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateBox alert>
      <span className="grid size-12 place-items-center rounded-xl bg-danger-fg/10 text-danger-fg">
        <TriangleAlertIcon width={22} height={22} />
      </span>
      <h3 className="text-lg font-extrabold text-ink-strong">Couldn’t load your history</h3>
      <p className="max-w-[420px] text-[13.5px] leading-normal text-ink-soft">
        The connection dropped before your chats came back. Nothing is lost; try again in a moment.
      </p>
      <Button variant="primary" onClick={onRetry}>
        Retry
      </Button>
      <span className="text-xs text-ink-soft">Tried at 14:02 · error 503</span>
    </StateBox>
  )
}

function EmptyHistory({ base }: { base: string }) {
  return (
    <StateBox>
      <span className="grid size-12 place-items-center rounded-xl bg-chip text-chip-fg">
        <ChatIcon width={22} height={22} />
      </span>
      <h3 className="text-lg font-extrabold text-ink-strong">No chats yet</h3>
      <p className="max-w-[420px] text-[13.5px] leading-normal text-ink-soft">
        Questions you ask the assistant show up here, grouped by day, so you can pick any of them
        back up.
      </p>
      <ButtonLink
        variant="primary"
        href={`${base}/chat`}
        icon={<PlusIcon width={15} height={15} />}
      >
        Start a chat
      </ButtonLink>
      <ul aria-label="Suggestions" className="mt-1.5 flex flex-wrap justify-center gap-1.5">
        {CHAT_SUGGESTIONS.slice(0, 3).map((text) => (
          <li key={text}>
            <ButtonLink
              size="sm"
              href={`${base}/chat/new?q=${encodeURIComponent(text)}`}
              trailingIcon={<ArrowRightIcon width={13} height={13} />}
            >
              {text}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </StateBox>
  )
}
