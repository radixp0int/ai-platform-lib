import type { Responder } from '../../chat/engine/chatEngine'
import { usePlatform } from '../app-shell/platform-context'
import { ChatHistoryPage, type HistoryLoad } from '../chat-history/history-page'
import { ChatPage } from './chat-page'

export type ChatSpaceProps = {
  /** The path inside the tenant: `/chat`, `/chat/history`, `/chat/c/<id>`, `/chat/new?q=…`. */
  path: string
  base: string
  responder?: Responder
  /** How the History page's list loads, for the stories of its states. */
  historyLoad?: HistoryLoad
}

/**
 * The Chat app's pages, by path: the chat (new, opened on a past
 * conversation, or asked a question on arrival) and its history.
 */
export function ChatSpace({ path, base, responder, historyLoad }: ChatSpaceProps) {
  const { go } = usePlatform()
  const [route, search = ''] = path.split('?')
  if (route === '/chat/history') {
    return <ChatHistoryPage base={base} initialLoad={historyLoad} />
  }
  const conversationId = /^\/chat\/c\/([^/]+)/.exec(route)?.[1]
  const question = route === '/chat/new' ? new URLSearchParams(search).get('q') : null
  return (
    <ChatPage
      // A new key per chat, so opening another one starts from its own transcript.
      key={conversationId ?? question ?? 'new'}
      base={base}
      conversationId={conversationId}
      initialQuestion={question ?? undefined}
      responder={responder}
      onNewChat={() => go(`${base}/chat`)}
    />
  )
}
