/**
 * The viewer's past conversations, as the Finals 2.0 chat pages show them: the
 * Chat panel's Pinned / Today / Yesterday / Previous 7 days, the chat page's
 * "Pick up where you left off", and the Chat history page's list and preview.
 * One list, so the three never disagree.
 *
 * Ages are stored as days and a clock time, not dates, so the list never goes
 * stale: "Yesterday" is always yesterday.
 */

/** A label a conversation can carry; the history page filters on them. */
export type ConversationTag = 'draft' | 'flow' | 'shared' | 'flag'

/** The part of the platform a conversation was about. */
export type ConversationArea = 'Chat' | 'Ingestion' | 'Workflows' | 'Insights' | 'Audit'

export type ConversationTurn = {
  question: string
  /** Markdown. */
  answer: string
}

export type PastConversation = {
  id: string
  title: string
  area: ConversationArea
  /** A line about it for the Chat panel: "Draft for Dana is ready". Defaults to the area. */
  note?: string
  /** The newest answer, in a sentence or two. */
  lastAnswer: string
  /** The sources the answers read. */
  sources: string[]
  /** Questions to pick up with, in the viewer's voice. */
  followups: string[]
  messages: number
  /** 0 is today. */
  daysAgo: number
  /** The clock time of the last message, `HH:MM`. */
  time: string
  /** For today's: how long ago, as the list says it. */
  ago?: string
  pinned?: boolean
  tags: ConversationTag[]
  /** Who shared it, for one tagged `shared`. */
  sharedBy?: string
  /** The exchange, when the fixture has more than the last answer. */
  turns?: ConversationTurn[]
}

/** The first answer of the chat page's demo, with the table the design shows. */
export const SYNC_ANSWER = `One source failed this week, and two are still catching up.

| Source | Status | Documents | Last good sync |
| :--- | :--- | ---: | :--- |
| **Pricing sheets API** | Failing | 86 | Nov 23, 04:10 |
| **Vendor contracts** | Syncing | 412 | Nov 24, 08:30 |
| **Product catalogue feed** | Syncing | 157 | Nov 24, 08:45 |

The pricing sheets API has returned an authentication error since 04:10 on Nov 23 [1]. Its 86 documents still answer questions, but they won't pick up changes until it reconnects [2].`

/** The second answer: a draft note, as a quote. */
export const OWNER_ANSWER = `Dana Whitfield owns the pricing sheets API. Here's a draft you can send her:

> Hi Dana, the pricing sheets API has failed to sync since 04:10 on Nov 23 with an authentication error. Its 86 documents are still searchable but won't update until it reconnects. Could you renew the key in Ingestion when you have a moment? Thanks, John

Once Dana renews the key, the next sync picks up every change made since Nov 23, and answers that cite pricing sheets switch to the new figures.`

export const SYNC_QUESTION = 'Which sources failed to sync this week?'
export const OWNER_QUESTION = 'Who owns it? Draft a short note asking them to reconnect it.'

export const CONVERSATIONS: PastConversation[] = [
  {
    id: 'failed-syncs',
    title: 'Failed syncs this week and who owns them',
    area: 'Ingestion',
    note: 'Draft for Dana is ready',
    lastAnswer:
      'The pricing sheets API has failed since 04:10 on Nov 23. Dana owns the key and has a draft note asking her to renew it.',
    sources: ['Sync log', 'Pricing sheets API'],
    followups: [
      'Check the sync log tomorrow at 09:00 and tell me if it is still failing',
      'Which answers used the old pricing figures?',
      'Who else can renew API keys in Ingestion?',
    ],
    messages: 6,
    daysAgo: 0,
    time: '09:12',
    ago: '12 min ago',
    pinned: true,
    tags: ['draft'],
    turns: [
      { question: SYNC_QUESTION, answer: SYNC_ANSWER },
      { question: OWNER_QUESTION, answer: OWNER_ANSWER },
    ],
  },
  {
    id: 'travel-limits',
    title: 'Expense policy: travel limits',
    area: 'Chat',
    note: 'Answered from 2 documents',
    lastAnswer:
      'Economy for flights under six hours, business above. Hotel caps follow the city tier table on page 12.',
    sources: ['Travel policy v4', 'City tier table'],
    followups: ['What counts as a six-hour flight?', 'Who approves exceptions?'],
    messages: 4,
    daysAgo: 0,
    time: '08:40',
    ago: '59 min ago',
    tags: [],
  },
  {
    id: 'vendor-renewals',
    title: 'Vendor contracts renewing in Q1',
    area: 'Workflows',
    note: '14 contracts found',
    lastAnswer:
      '14 contracts renew in Q1. Three have price-increase clauses above 5%, and one needs 90 days of notice.',
    sources: ['Vendor contracts', 'Standard terms', 'Renewal calendar'],
    followups: ['Start a review for the three increases', 'Draft the 90-day notice'],
    messages: 8,
    daysAgo: 0,
    time: '08:15',
    ago: '1 hour ago',
    tags: ['flow'],
  },
  {
    id: 'onboarding',
    title: 'Onboarding guide for new analysts',
    area: 'Chat',
    note: 'Shared with Ops',
    lastAnswer:
      'A two-week plan with the five core playbooks, who to meet, and the tools to request on day one.',
    sources: ['Support playbook', 'Policy manual v7'],
    followups: ['Turn this into a checklist', 'Share it with the Ops team'],
    messages: 5,
    daysAgo: 0,
    time: '07:20',
    ago: '2 hours ago',
    tags: ['draft', 'shared'],
    sharedBy: 'Priya',
  },
  {
    id: 'runbook',
    title: 'Incident runbook for API outages',
    area: 'Ingestion',
    note: 'Summarized',
    lastAnswer:
      'Six steps, starting with who to page. Status page updates go out every 30 minutes until resolved.',
    sources: ['Incident runbook'],
    followups: ['Who is on call this week?'],
    messages: 3,
    daysAgo: 0,
    time: '06:30',
    ago: '3 hours ago',
    tags: [],
  },
  {
    id: 'retention',
    title: 'Data retention rules by region',
    area: 'Audit',
    note: '3 follow-ups',
    lastAnswer:
      'EU records are kept for six years and US records for seven. Deletion runs on the first of each month.',
    sources: ['Retention policy', 'Regional addendum'],
    followups: ['List what deletes next month', 'Are backups covered too?'],
    messages: 7,
    daysAgo: 0,
    time: '05:45',
    ago: '4 hours ago',
    tags: ['flag'],
  },
  {
    id: 'usage-report',
    title: 'Reading the quarterly usage report',
    area: 'Insights',
    lastAnswer:
      'Questions were up 11% and answer quality held at 93.5%. Errors were mostly out-of-date pricing sources.',
    sources: ['Insights export', 'Quarterly report'],
    followups: ['Compare with last quarter'],
    messages: 4,
    daysAgo: 1,
    time: '16:20',
    tags: ['shared'],
    sharedBy: 'Dana',
  },
  {
    id: 'faq-gaps',
    title: 'Procurement FAQ gaps',
    area: 'Chat',
    note: 'Flagged to Priya',
    lastAnswer:
      'Nine common questions have no answer in the FAQ. They are flagged to Priya with suggested wording.',
    sources: ['Procurement FAQ', 'Search logs'],
    followups: ['Draft answers for the top three', 'Who reviews FAQ changes?'],
    messages: 9,
    daysAgo: 1,
    time: '14:05',
    pinned: true,
    tags: ['draft'],
  },
  {
    id: 'approval-limits',
    title: 'Approval limits by team and role',
    area: 'Chat',
    lastAnswer:
      'Team leads approve up to 10k, directors up to 100k, and anything above goes to the leadership team.',
    sources: ['Approval matrix'],
    followups: ['What about urgent purchases?'],
    messages: 3,
    daysAgo: 1,
    time: '11:40',
    tags: [],
  },
  {
    id: 'supplier-duplicates',
    title: 'Merging duplicate supplier records',
    area: 'Workflows',
    lastAnswer: '38 suppliers appear twice under different names. A merge run is ready for review.',
    sources: ['Supplier registry', 'Merge rules'],
    followups: ['Start the merge run', 'Show the riskiest pairs'],
    messages: 6,
    daysAgo: 1,
    time: '10:12',
    tags: ['flow'],
  },
  {
    id: 'pricing-compare',
    title: 'Comparing two pricing sheets side by side',
    area: 'Ingestion',
    lastAnswer:
      'Nine prices changed between the October and November sheets, most of them on the Pro plan.',
    sources: ['Pricing sheets API'],
    followups: ['Which customers does this affect?'],
    messages: 5,
    daysAgo: 1,
    time: '09:30',
    tags: ['flag'],
  },
  {
    id: 'service-levels',
    title: 'Monthly service levels against the thirty-day support target, all regions',
    area: 'Insights',
    lastAnswer:
      'Every region met the target except APAC, which missed by 1.4 points in the last week of the month.',
    sources: ['Support dashboard', 'Regional reports'],
    followups: ['Why did APAC miss?', 'Send this to the leads'],
    messages: 6,
    daysAgo: 1,
    time: '08:02',
    tags: ['draft', 'shared'],
    sharedBy: 'Marcus',
  },
  {
    id: 'security-handbook',
    title: 'Summarising the security handbook changes',
    area: 'Audit',
    lastAnswer:
      'Three changes: shorter key rotation, new device rules, and a stricter guest access policy.',
    sources: ['Security handbook'],
    followups: ['What do I need to change on my laptop?'],
    messages: 2,
    daysAgo: 2,
    time: '15:44',
    tags: [],
  },
  {
    id: 'invoice-dispute',
    title: 'Disputing a supplier invoice',
    area: 'Chat',
    lastAnswer:
      'The invoice bills 120 hours against a 100-hour cap. A dispute template is filled in and ready to send.',
    sources: ['Vendor contracts', 'Invoice 4471'],
    followups: ['Send the dispute', 'Who signs it off?'],
    messages: 4,
    daysAgo: 2,
    time: '13:10',
    tags: ['draft'],
  },
  {
    id: 'dual-approval',
    title: 'Setting up two-step approval for purchase orders',
    area: 'Workflows',
    lastAnswer:
      "A two-step approval flow is drafted: the requester's lead, then the budget owner for anything over 25k.",
    sources: ['Approval matrix', 'Flow template'],
    followups: ['Publish the flow', 'Test it with a dry run'],
    messages: 7,
    daysAgo: 2,
    time: '10:25',
    tags: ['flow'],
  },
  {
    id: 'pricing-changes',
    title: 'Pricing sheet changes this quarter',
    area: 'Ingestion',
    lastAnswer:
      'Two sheet updates this quarter. The November one did not sync because of the expired key.',
    sources: ['Pricing sheets API'],
    followups: ['When will it sync again?'],
    messages: 3,
    daysAgo: 3,
    time: '18:02',
    tags: ['flag'],
  },
  {
    id: 'upload-limits',
    title: 'Upload limits for scanned documents',
    area: 'Ingestion',
    lastAnswer: 'Scans up to 50 MB and 300 pages each. Larger files are split automatically.',
    sources: ['Upload guide'],
    followups: ['Can it read handwriting?'],
    messages: 2,
    daysAgo: 3,
    time: '12:40',
    tags: [],
  },
  {
    id: 'partner-tiers',
    title: 'Partner discount tiers',
    area: 'Chat',
    lastAnswer:
      'Three tiers at 10, 15 and 20%, based on yearly volume. Tier reviews happen every January.',
    sources: ['Partner programme'],
    followups: ['Which partners move tier this year?'],
    messages: 3,
    daysAgo: 4,
    time: '09:14',
    tags: ['shared'],
    sharedBy: 'Priya',
  },
  {
    id: 'renewal-gap',
    title: 'Why the renewal plan shows a gap',
    area: 'Insights',
    lastAnswer:
      "Four large renewals moved from Q4 into Q1, which leaves an 8% gap in this quarter's plan.",
    sources: ['Renewal calendar', 'Planning model'],
    followups: ['Show the four renewals'],
    messages: 5,
    daysAgo: 9,
    time: '11:00',
    tags: [],
  },
  {
    id: 'contractors',
    title: 'Contractors versus staff: what the policy covers',
    area: 'Chat',
    lastAnswer:
      'Contractors get equipment and access, but not the home-office allowance or training budget.',
    sources: ['Policy manual v7', 'Contractor terms'],
    followups: ['What about long-term contractors?'],
    messages: 4,
    daysAgo: 10,
    time: '14:30',
    tags: ['flag'],
  },
  {
    id: 'cancel-po',
    title: 'Cancelling a purchase order',
    area: 'Chat',
    lastAnswer:
      'Orders can be cancelled until the supplier confirms them. After that, it needs a change request.',
    sources: ['Procurement FAQ'],
    followups: ['How do I raise a change request?'],
    messages: 2,
    daysAgo: 12,
    time: '10:10',
    tags: [],
  },
  {
    id: 'drive-alerts',
    title: 'Access alerts on the shared drive',
    area: 'Audit',
    lastAnswer:
      'Two folders were shared outside the company last week. Both links are now restricted.',
    sources: ['Access log', 'Drive policy'],
    followups: ['Who shared them?', 'Set up an alert for this'],
    messages: 5,
    daysAgo: 13,
    time: '16:45',
    tags: ['flow'],
  },
  {
    id: 'portal-notes',
    title: 'Release notes for the vendor portal',
    area: 'Chat',
    lastAnswer: 'Version 3.2 adds bulk invoice upload and a new status page for vendors.',
    sources: ['Vendor portal notes'],
    followups: ['Tell the vendors about it'],
    messages: 2,
    daysAgo: 15,
    time: '09:50',
    tags: ['draft'],
  },
  {
    id: 'escalations',
    title: 'Support escalation rates by product',
    area: 'Insights',
    lastAnswer:
      'Escalations fell to 1.8% overall. The integrations product is still the highest at 3.1%.',
    sources: ['Support dashboard'],
    followups: ['Why is integrations higher?'],
    messages: 4,
    daysAgo: 17,
    time: '13:20',
    tags: ['shared'],
    sharedBy: 'Dana',
  },
]

/** The questions the chat page suggests before the first message. */
export const CHAT_SUGGESTIONS = [
  SYNC_QUESTION,
  'What are the travel limits?',
  'Draft a reply to a vendor',
  'Compare two documents',
]

/** The day a conversation falls in, as the lists group them. */
export type ConversationDay = 'Today' | 'Yesterday' | 'This week' | 'Older'

export function dayOf(conversation: Pick<PastConversation, 'daysAgo'>): ConversationDay {
  if (conversation.daysAgo === 0) return 'Today'
  if (conversation.daysAgo === 1) return 'Yesterday'
  if (conversation.daysAgo < 7) return 'This week'
  return 'Older'
}

/** The conversation's last update as a date, from `now`. */
export function updatedAt(conversation: PastConversation, now = new Date()): Date {
  const date = new Date(now)
  date.setDate(date.getDate() - conversation.daysAgo)
  const [hours, minutes] = conversation.time.split(':').map(Number)
  date.setHours(hours, minutes, 0, 0)
  return date
}

/** `YYYY-MM-DD` in local time. */
export function isoDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * When it was last updated, as a list says it: "12 min ago" today, "16:20"
 * yesterday (under its heading), "Mon, 15:44" this week, "Nov 18" before.
 */
export function whenLabel(conversation: PastConversation, now = new Date()): string {
  const date = updatedAt(conversation, now)
  if (conversation.daysAgo === 0) return conversation.ago ?? conversation.time
  if (conversation.daysAgo === 1) return conversation.time
  if (conversation.daysAgo < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${conversation.time}`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
