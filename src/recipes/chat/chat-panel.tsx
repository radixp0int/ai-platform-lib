import { useState } from 'react'
import { MenuPanelLabel, MenuPanelRow, MenuPanelSearch } from '../../components/side-menu'
import { CONVERSATIONS, dayOf, type PastConversation } from '../../fixtures/platform/conversations'

/** The panel's headings, in order. Older chats are on the History page. */
const GROUPS = [
  { label: 'Today', of: (c: PastConversation) => dayOf(c) === 'Today' },
  { label: 'Yesterday', of: (c: PastConversation) => dayOf(c) === 'Yesterday' },
  { label: 'Previous 7 days', of: (c: PastConversation) => dayOf(c) === 'This week' },
]

export type ChatPanelProps = {
  base: string
  /** The conversation open on the page, marked in the list. */
  currentId?: string
  /** On the History page: its row is marked. */
  onHistory?: boolean
  /** A chat started on this page, not saved yet: listed first under Today. */
  fresh?: { title: string; sub: string }
}

/**
 * The Chat app's panel: find a chat, the History page, then the chats by day
 * with the pinned ones first. Built from the menu's own pieces, and added to
 * the shell's panel by the page with `InSideMenu`.
 */
export function ChatPanel({ base, currentId, onHistory = false, fresh }: ChatPanelProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const matching = CONVERSATIONS.filter((c) => c.title.toLowerCase().includes(needle))
  const row = (c: PastConversation) => (
    <MenuPanelRow
      key={c.id}
      href={`${base}/chat/c/${c.id}`}
      name={c.title}
      sub={c.note ?? c.area}
      current={c.id === currentId}
    />
  )

  return (
    <div className="flex flex-col gap-0.5">
      <MenuPanelSearch label="Search chats" value={query} onChange={setQuery} />
      {needle ? (
        <>
          <MenuPanelLabel>Chats</MenuPanelLabel>
          {matching.length > 0 ? (
            matching.map(row)
          ) : (
            <p className="px-2 py-1.5 text-sm text-ink-soft">No chats match.</p>
          )}
        </>
      ) : (
        <>
          <div className="pt-2">
            <MenuPanelRow
              href={`${base}/chat/history`}
              name="History"
              sub={`${CONVERSATIONS.length} conversations`}
              current={onHistory}
            />
          </div>
          <MenuPanelLabel>Pinned</MenuPanelLabel>
          {CONVERSATIONS.filter((c) => c.pinned).map(row)}
          {GROUPS.map((group) => (
            <section key={group.label} aria-label={group.label} className="flex flex-col gap-0.5">
              <MenuPanelLabel>{group.label}</MenuPanelLabel>
              {group.label === 'Today' && fresh && (
                <MenuPanelRow name={fresh.title} sub={fresh.sub} current />
              )}
              {CONVERSATIONS.filter((c) => !c.pinned && group.of(c)).map(row)}
            </section>
          ))}
        </>
      )}
    </div>
  )
}
