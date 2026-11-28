import type { Branding } from '../../chat/engine/branding'
import type { CannedTurn } from '../../chat/engine/chatEngine'
import type { Message, Source } from '../../chat/engine/types'
import {
  OWNER_ANSWER,
  OWNER_QUESTION,
  SYNC_ANSWER,
  type PastConversation,
} from '../../fixtures/platform/conversations'

export const CHAT_BRANDING: Branding = {
  appName: 'Acme',
  modelName: 'Acme',
  disclaimer: 'Acme can make mistakes. Check sources before you act on an answer.',
}

const SYNC_SOURCES: Source[] = [
  {
    id: 1,
    title: 'Ingestion · sync log',
    fileType: 'Log',
    updatedLabel: 'Nov 24',
    markdown: `## Sync log, this week

| Source | Run | Result |
| :--- | :--- | :--- |
| Pricing sheets API | Nov 23, 04:10 | Failed: 401 authentication error |
| Pricing sheets API | Nov 24, 04:10 | Failed: 401 authentication error |
| Vendor contracts | Nov 24, 08:30 | Running: 412 of 530 documents |
| Product catalogue feed | Nov 24, 08:45 | Running: 157 of 203 documents |`,
  },
  {
    id: 2,
    title: 'Pricing sheets API',
    fileType: 'API source',
    updatedLabel: 'Nov 23',
    markdown: `## Pricing sheets API

Owner: Dana Whitfield. Key renewed every 90 days in Ingestion.

86 documents indexed. The last good sync was Nov 23 at 04:10; documents already indexed stay searchable while the source is failing.`,
  },
]

/** What the chat page's assistant says. The two in the design play on cue; the rest cycle. */
export const CHAT_TURNS: CannedTurn[] = [
  {
    match: /fail|sync/i,
    thinking:
      'I need this week’s sync runs from the Ingestion log, then the state of each source that did not finish.',
    content: SYNC_ANSWER,
    sources: SYNC_SOURCES,
    followups: [
      OWNER_QUESTION,
      'Which answers cite the pricing sheets?',
      'When is the next sync due?',
    ],
  },
  {
    match: /who owns|draft a short note|reconnect/i,
    thinking:
      'The source record names its owner. A short, specific note will get the key renewed fastest.',
    content: OWNER_ANSWER,
    followups: [
      'Check the sync log tomorrow at 09:00 and tell me if it’s still failing',
      'Which answers used the old pricing figures?',
      'Who else can renew API keys in Ingestion?',
    ],
  },
  {
    match: /travel/i,
    thinking:
      'The travel policy sets the class of travel by flight length, and hotel caps by city.',
    content:
      'Economy for flights under six hours, business above. Hotel caps follow the city tier table on page 12 of the travel policy.',
    followups: ['What counts as a six-hour flight?', 'Who approves exceptions?'],
  },
  {
    thinking: 'I will answer from the connected sources and say which ones I read.',
    content:
      'Here is what the connected sources say. I read the policy manual and the procurement FAQ; neither covers this directly, so check with the owner before you act on it.',
    followups: ['Which sources did you read?', 'Who owns the policy manual?'],
  },
]

/** A past conversation as the transcript the chat page shows when it is opened. */
export function transcriptOf(conversation: PastConversation): Message[] {
  const turns = conversation.turns ?? [
    { question: conversation.title, answer: conversation.lastAnswer },
  ]
  const last = turns.length - 1
  return turns.flatMap((turn, i): Message[] => [
    { id: -(i * 2 + 2), role: 'user', content: turn.question },
    {
      id: -(i * 2 + 1),
      role: 'assistant',
      content: turn.answer,
      sources: conversation.turns && i === 0 ? SYNC_SOURCES : undefined,
      followups: i === last ? conversation.followups : undefined,
    },
  ])
}
