import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AssistantAvatar } from '../../chat/components/assistant-avatar'
import { Conversation } from '../../chat/components/conversation'
import { BrandingProvider } from '../../chat/engine/branding'
import { createCannedResponder, type Responder } from '../../chat/engine/chatEngine'
import { CitationsProvider } from '../../chat/engine/citations'
import { applyFeatureGate } from '../../chat/engine/featureGate'
import { useChat } from '../../chat/engine/useChat'
import { InSideMenu } from '../../components/side-menu'
import { PageBand } from '../../components/page-header'
import {
  CHAT_SUGGESTIONS,
  CONVERSATIONS,
  dayOf,
  whenLabel,
} from '../../fixtures/platform/conversations'
import { DEMO_USER } from '../../fixtures/platform/user'
import { Alert } from '../../primitives/alert'
import { Button } from '../../primitives/button'
import { PlusIcon } from '../../primitives/icons'
import { Link } from '../../primitives/link'
import type { MarkdownQuoteStyle } from '../../chat/components/markdown'
import { useDemoFeatures } from '../settings/settings-state'
import { ChatPanel } from './chat-panel'
import { CHAT_BRANDING, CHAT_TURNS, transcriptOf } from './chat-turns'

const cannedResponder = createCannedResponder(CHAT_TURNS)

/** The quote in an answer: the 2px rail, soft italic, 16px in. */
const QUOTE: MarkdownQuoteStyle = { quoteRail: 'subtle', quoteFont: 'italic', quoteSpacing: 'snug' }

/** The chats the landing page offers to pick back up. */
const PICK_UP = CONVERSATIONS.filter((c) => c.daysAgo <= 1).slice(0, 3)

const firstName = DEMO_USER.name.split(' ')[0]

const noop = () => {}

export type ChatPageProps = {
  /** `/t/<tenant>`, for the page's links. */
  base: string
  /** A past conversation to open, by id. Leave out for a new chat. */
  conversationId?: string
  /** Where answers come from. Must keep its identity between renders. */
  responder?: Responder
  /** Asked for by New chat on a past conversation: go to the empty chat. */
  onNewChat?: () => void
  /** Asked as soon as the page opens — a follow-up picked on the History page. */
  initialQuestion?: string
}

/**
 * The Finals 2.0 chat page. Before the first message, a navy greeting band
 * with the composer lifted over its edge, today's suggestions and the chats to
 * pick back up. Once a chat begins, a slim band with its title over the
 * thread, and the composer docked at the bottom under the AI notice.
 *
 * The chat's own panel — search, Pinned, Today, Yesterday, Previous 7 days and
 * New chat — goes into the shell's menu with `InSideMenu`.
 */
export function ChatPage({
  base,
  conversationId,
  responder = cannedResponder,
  onNewChat,
  initialQuestion,
}: ChatPageProps) {
  const demo = useDemoFeatures()
  const chat = useChat(responder)
  const [noticeOpen, setNoticeOpen] = useState(true)
  const past = CONVERSATIONS.find((c) => c.id === conversationId)
  const history = useMemo(() => (past ? transcriptOf(past) : []), [past])
  const shown = useMemo(
    () => applyFeatureGate([...history, ...chat.messages], demo.flags),
    [history, chat.messages, demo.flags],
  )
  const asked = useRef(false)
  const { send } = chat
  useEffect(() => {
    if (!initialQuestion || asked.current) return
    asked.current = true
    send(initialQuestion)
  }, [initialQuestion, send])
  const firstQuestion = chat.messages.find((m) => m.role === 'user')?.content

  const newChat = () => {
    chat.reset()
    setNoticeOpen(true)
    if (past || initialQuestion) onNewChat?.()
  }

  const title = past?.title ?? firstQuestion
  const meta = past
    ? `${dayOf(past) === 'Today' ? 'Today' : whenLabel(past)}, ${past.time} · Reading from ${past.sources.join(' and ')}`
    : 'Just now · Reading from all sources'

  return (
    <BrandingProvider value={CHAT_BRANDING}>
      <InSideMenu
        action={{ label: 'New chat', icon: <PlusIcon width={16} height={16} />, onSelect: newChat }}
      >
        <ChatPanel
          base={base}
          currentId={past?.id}
          fresh={
            !past && firstQuestion
              ? { title: firstQuestion, sub: chat.busy ? 'Answering…' : 'Just now' }
              : undefined
          }
        />
      </InSideMenu>
      <CitationsProvider value={noop}>
        <div className={`chat-highlight-${demo.highlight} flex h-full min-h-0 flex-col bg-canvas`}>
          {title && (
            <ThreadBand title={title} meta={meta}>
              <Button
                variant="inverse"
                size="sm"
                icon={<PlusIcon width={14} height={14} />}
                onClick={newChat}
              >
                New chat
              </Button>
              <Button variant="inverse" size="sm">
                Share
              </Button>
            </ThreadBand>
          )}
          <Conversation
            messages={shown}
            busy={chat.busy}
            queue={chat.queue}
            held={chat.held}
            onSubmit={chat.send}
            onStop={chat.stop}
            onSendNow={chat.sendNow}
            onSendQueuedNow={chat.sendQueuedNow}
            onEditQueued={chat.editQueued}
            onMoveQueued={chat.moveQueued}
            onRemoveQueued={chat.removeQueued}
            onHold={chat.hold}
            onResume={chat.resume}
            onClearQueue={chat.clearQueue}
            onRetry={chat.retry}
            chain={chat.chain}
            features={{ suggestions: demo.flags.suggestions, queue: demo.flags.queue }}
            suggestions={CHAT_SUGGESTIONS.map((text) => ({ text }))}
            showActions={demo.flags.actions}
            disclaimer={CHAT_BRANDING.disclaimer}
            quote={QUOTE}
            notice={
              noticeOpen ? (
                <Alert
                  variant="bar"
                  tone="warning"
                  title="Acme can make mistakes."
                  secondaryAction={{ label: 'How answers are checked', onClick: noop }}
                  onDismiss={() => setNoticeOpen(false)}
                  dismissLabel="Dismiss this notice"
                  layout="inline"
                >
                  Check the sources under each answer before you act on it.
                </Alert>
              ) : undefined
            }
            landing={(composer) => (
              <PageBand
                align="center"
                breadcrumbs={[{ label: 'Overview', href: `${base}/home` }, { label: 'Use' }]}
                title={`What should we work on, ${firstName}?`}
                description="It reads everything this tenant has connected: 14 sources, 1,171 documents."
              >
                <div className="mx-auto flex w-full max-w-[760px] flex-col gap-7">
                  {/* Lifted over the band, the glass would show the navy
                      through; here it is the solid panel. */}
                  <div className="[&_.glass]:bg-panel-solid">{composer}</div>
                  <div
                    role="group"
                    aria-label="Suggestions"
                    className="flex flex-wrap justify-center gap-1.5"
                  >
                    {CHAT_SUGGESTIONS.map((text) => (
                      <Button key={text} size="sm" onClick={() => chat.send(text)}>
                        {text}
                      </Button>
                    ))}
                  </div>
                  <PickUp base={base} />
                </div>
              </PageBand>
            )}
          />
        </div>
      </CitationsProvider>
    </BrandingProvider>
  )
}

/** The slim navy band over a thread: its title, a line about it, and its actions. */
function ThreadBand({
  title,
  meta,
  children,
}: {
  title: string
  meta: string
  children: ReactNode
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 bg-brand-900 py-2.5 pr-6 pl-7 text-white [--on-brand-solid:#ffffff] dark:border-b dark:border-line dark:bg-panel-solid max-md:px-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="truncate text-lg leading-snug font-semibold">{title}</h2>
        <span className="truncate text-[12.5px] text-brand-100">{meta}</span>
      </div>
      <div className="flex shrink-0 gap-2">{children}</div>
    </header>
  )
}

/** "Pick up where you left off": the latest chats, each a link to open it. */
function PickUp({ base }: { base: string }) {
  return (
    <section aria-labelledby="pick-up-heading">
      <h2
        id="pick-up-heading"
        className="mb-1 text-[10.5px] font-extrabold tracking-[0.08em] text-ink-soft uppercase"
      >
        Pick up where you left off
      </h2>
      <ul>
        {PICK_UP.map((c) => (
          <li key={c.id}>
            <Link
              variant="plain"
              href={`${base}/chat/c/${c.id}`}
              className="flex min-h-14 items-center gap-3.5 border-b border-line px-1 py-2.5 text-ink transition hover:bg-tint/5"
            >
              <AssistantAvatar size={28} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <b className="truncate text-sm font-bold text-ink-strong">{c.title}</b>
                <small className="truncate text-xs text-ink-soft">{c.note ?? c.area}</small>
              </span>
              <span className="text-xs whitespace-nowrap text-ink-soft">
                {c.daysAgo === 0 ? c.time : 'Yesterday'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
