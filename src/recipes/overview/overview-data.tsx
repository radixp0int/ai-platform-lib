// What the landing page knows about each area of a tenant. Fictional, and
// written for any organisation: no area here assumes what the tenant does.

import type { ReactNode } from 'react'
import type { SpaceId, Tenant } from '../../fixtures/platform/tenants'
import type { PillTone } from '../../primitives/pill'
import {
  BuildingIcon,
  ChatIcon,
  CircleCheckIcon,
  FlagIcon,
  IngestionIcon,
  InsightsIcon,
  SlidersIcon,
  WorkflowIcon,
} from '../../primitives/icons'

export type AreaId =
  | 'chat'
  | 'ingestion'
  | 'chatconfig'
  | 'workflows'
  | 'insights'
  | 'evaluations'
  | 'audit'
  | 'tenant'

type Stat = { label: string; value: string; unit?: string; tone?: 'good' | 'bad' | 'warn' }

export type Area = {
  id: AreaId
  /** The tab's word. */
  short: string
  name: string
  /** The space a tenant needs for this area; none for the ones every tenant has. */
  space?: SpaceId
  icon: (size: number) => ReactNode
  /** The figure in the Sections list, and its unit. */
  value: string
  unit: string
  /** Something here needs a look: a dot beside the name. */
  alert?: boolean
  line: string
  headline: Stat
  stats: [Stat, Stat]
  /** The quick actions on this area's tab. The first is the primary one. */
  actions: { label: string; path: string }[]
  /** Where the area lives, from the tenant's base; `/` paths are outside any tenant. */
  path: string
}

export const GROUPS: { label: string; ids: AreaId[] }[] = [
  { label: 'Use', ids: ['chat'] },
  { label: 'Build', ids: ['ingestion', 'chatconfig'] },
  { label: 'Automate', ids: ['workflows'] },
  { label: 'Measure', ids: ['insights', 'evaluations'] },
  { label: 'Govern', ids: ['audit', 'tenant'] },
]

export const AREAS: Record<AreaId, Area> = {
  chat: {
    id: 'chat',
    short: 'Chat',
    name: 'Chat',
    space: 'chat',
    icon: (s) => <ChatIcon width={s} height={s} />,
    value: '526',
    unit: 'today',
    line: 'Answers from every source this tenant has connected.',
    headline: { label: 'Conversations today', value: '214' },
    stats: [
      { label: 'Answers this week', value: '1,486' },
      { label: 'Rated down', value: '3%' },
    ],
    actions: [
      { label: 'New chat', path: '/chat' },
      { label: 'Summarise a document', path: '/chat' },
      { label: 'Draft a reply', path: '/chat' },
    ],
    path: '/chat',
  },
  ingestion: {
    id: 'ingestion',
    short: 'Ingestion',
    name: 'Ingestion',
    space: 'ingestion',
    icon: (s) => <IngestionIcon width={s} height={s} />,
    value: '1,171',
    unit: 'docs',
    alert: true,
    line: 'Documents and API sources the assistant can read.',
    headline: { label: 'Documents', value: '1,171', unit: 'docs' },
    stats: [
      { label: 'Sources syncing', value: '13 of 14', tone: 'bad' },
      { label: 'Added this week', value: '+42', tone: 'good' },
    ],
    actions: [
      { label: 'Upload documents', path: '/ingestion/new' },
      { label: 'Connect an API', path: '/ingestion/new' },
      { label: 'Schedule a sync', path: '/ingestion' },
    ],
    path: '/ingestion',
  },
  chatconfig: {
    id: 'chatconfig',
    short: 'Config',
    name: 'Chat Config',
    space: 'ingestion',
    icon: (s) => <SlidersIcon width={s} height={s} />,
    value: 'v14',
    unit: 'live',
    line: 'Instructions, agents and the tools each may use.',
    headline: { label: 'Live version', value: 'v14', unit: 'since 20 Nov' },
    stats: [
      { label: 'Agents', value: '3' },
      { label: 'Unpublished changes', value: '4', tone: 'warn' },
    ],
    actions: [
      { label: 'Edit instructions', path: '/chat-config' },
      { label: 'Add an agent', path: '/chat-config' },
      { label: 'Publish the draft', path: '/chat-config' },
    ],
    path: '/chat-config',
  },
  workflows: {
    id: 'workflows',
    short: 'Workflows',
    name: 'Workflows Studio',
    space: 'workflows',
    icon: (s) => <WorkflowIcon width={s} height={s} />,
    value: '4',
    unit: 'running',
    line: 'Multi-step flows that run on their own and stop for approvals.',
    headline: { label: 'Running now', value: '4', unit: 'runs' },
    stats: [
      { label: 'Waiting on you', value: '2', tone: 'warn' },
      { label: 'Workflows', value: '12' },
    ],
    actions: [
      { label: 'New workflow', path: '/workflows' },
      { label: 'Start from a template', path: '/workflows' },
      { label: 'All runs', path: '/workflows/live' },
    ],
    path: '/workflows',
  },
  insights: {
    id: 'insights',
    short: 'Insights',
    name: 'Insights',
    space: 'insights',
    icon: (s) => <InsightsIcon width={s} height={s} />,
    value: '2,997',
    unit: 'this week',
    line: 'Eval scores, user feedback and errors in answers.',
    headline: { label: 'Questions this week', value: '3,412' },
    stats: [
      { label: 'On last week', value: '+9%', tone: 'good' },
      { label: 'Rated down', value: '3%' },
    ],
    actions: [
      { label: 'Top questions', path: '/insights' },
      { label: 'Answers rated down', path: '/insights' },
      { label: 'Usage by team', path: '/insights' },
    ],
    path: '/insights',
  },
  evaluations: {
    id: 'evaluations',
    short: 'Evals',
    name: 'Evaluations Manager',
    space: 'insights',
    icon: (s) => <CircleCheckIcon width={s} height={s} />,
    value: '4 of 5',
    unit: 'passing',
    alert: true,
    line: 'Suites that score answers before and after each change.',
    headline: { label: 'Suites passing', value: '4', unit: 'of 5' },
    stats: [
      { label: 'Below the bar', value: '1', tone: 'bad' },
      { label: 'Last run', value: '06:00' },
    ],
    actions: [
      { label: 'Run a suite', path: '/evaluations' },
      { label: 'Compare two runs', path: '/evaluations' },
      { label: 'New suite from Chat', path: '/evaluations' },
    ],
    path: '/evaluations',
  },
  audit: {
    id: 'audit',
    short: 'Audit',
    name: 'Audit & Compliance',
    icon: (s) => <FlagIcon width={s} height={s} />,
    value: '12',
    unit: 'flagged',
    alert: true,
    line: 'Flagged answers, retention and the audit trail.',
    headline: { label: 'Answers flagged for review', value: '12', unit: 'flagged' },
    stats: [
      { label: 'Retention', value: '7 years' },
      { label: 'Last export', value: '1 Nov' },
    ],
    actions: [
      { label: 'Review flagged answers', path: '/audit' },
      { label: 'Export the audit log', path: '/audit' },
      { label: 'Retention settings', path: '/audit' },
    ],
    path: '/audit',
  },
  tenant: {
    id: 'tenant',
    short: 'Admin',
    name: 'Tenant Admin',
    icon: (s) => <BuildingIcon width={s} height={s} />,
    value: '24',
    unit: 'people',
    line: 'Members, roles, spaces, keys and policies.',
    headline: { label: 'Members', value: '24', unit: 'people' },
    stats: [
      { label: 'Invites pending', value: '3', tone: 'warn' },
      { label: 'API keys', value: '3' },
    ],
    actions: [
      { label: 'Invite people', path: '/tenants' },
      { label: 'Manage spaces', path: '/tenants' },
      { label: 'Create an API key', path: '/tenants' },
    ],
    path: '/tenants',
  },
}

/** The quick actions on the Overview tab. */
export const OVERVIEW_ACTIONS: { label: string; area: AreaId; path: string }[] = [
  { label: 'New chat', area: 'chat', path: '/chat' },
  { label: 'Upload', area: 'ingestion', path: '/ingestion/new' },
  { label: 'Automate', area: 'workflows', path: '/workflows' },
  { label: 'Evaluate', area: 'evaluations', path: '/evaluations' },
  { label: 'Review flags', area: 'audit', path: '/audit' },
  { label: 'Invite', area: 'tenant', path: '/tenants' },
]

export type Need = {
  area: AreaId
  pill: string
  tone: PillTone
  title: string
  meta: string
  action: string
  /** Shown on its area's tab, not on the Overview. */
  minor?: boolean
}
export const NEEDS: Need[] = [
  {
    area: 'ingestion',
    pill: 'Failing',
    tone: 'danger',
    title: 'Pricing sheets API stopped syncing',
    meta: 'Ingestion · since 04:10',
    action: 'Fix',
  },
  {
    area: 'evaluations',
    pill: 'Below bar',
    tone: 'danger',
    title: 'Policy answers scored 82%',
    meta: 'Evaluations Manager · 06:00',
    action: 'View',
  },
  {
    area: 'audit',
    pill: 'Review',
    tone: 'warning',
    title: '12 answers flagged for review',
    meta: 'Audit & Compliance · since Friday',
    action: 'Review',
  },
  {
    area: 'tenant',
    pill: 'Pending',
    tone: 'brand',
    title: 'Three invites have waited over a week',
    meta: 'Tenant Admin',
    action: 'Resend',
    minor: true,
  },
  {
    area: 'chatconfig',
    pill: 'Draft',
    tone: 'brand',
    title: 'Support desk instructions are unpublished',
    meta: 'Chat Config · since Friday',
    action: 'Review',
    minor: true,
  },
]

export type Kind = 'chat' | 'runs' | 'drafts'
export type Recent = {
  area: AreaId
  kind: Kind
  when: string
  name: string
  status: string
  tone: PillTone
}
export const RECENT: Recent[] = [
  {
    area: 'chat',
    kind: 'chat',
    when: 'Yesterday',
    name: 'Holiday schedule for the Lisbon office',
    status: 'Conversation',
    tone: 'neutral',
  },
  {
    area: 'audit',
    kind: 'drafts',
    when: 'Friday',
    name: 'Flagged: refund policy wording',
    status: 'In review',
    tone: 'warning',
  },
  {
    area: 'chatconfig',
    kind: 'drafts',
    when: 'Friday',
    name: 'Support desk instructions',
    status: 'Draft',
    tone: 'brand',
  },
  {
    area: 'workflows',
    kind: 'runs',
    when: 'Friday',
    name: 'Vendor onboarding checks',
    status: 'Completed',
    tone: 'neutral',
  },
  {
    area: 'evaluations',
    kind: 'runs',
    when: 'Today',
    name: 'Policy answers suite',
    status: 'Below bar',
    tone: 'danger',
  },
  {
    area: 'ingestion',
    kind: 'drafts',
    when: 'Thursday',
    name: 'Policy manual v7',
    status: 'Indexed',
    tone: 'neutral',
  },
  {
    area: 'insights',
    kind: 'runs',
    when: 'Monday',
    name: 'Weekly usage, 10–16 Nov',
    status: 'Report',
    tone: 'neutral',
  },
  {
    area: 'tenant',
    kind: 'drafts',
    when: '9 days ago',
    name: 'Invites to the Ops team',
    status: 'Pending',
    tone: 'brand',
  },
  {
    area: 'chat',
    kind: 'chat',
    when: 'Friday',
    name: 'Q3 vendor review summary',
    status: 'Conversation',
    tone: 'neutral',
  },
]

/** The areas this tenant has, in the order of the tabs. */
export function areasFor(tenant: Tenant): Area[] {
  return GROUPS.flatMap((g) => g.ids)
    .map((id) => AREAS[id])
    .filter((area) => !area.space || tenant.spaces.includes(area.space))
}

/** Where an area or action path goes for this tenant. */
export const hrefFor = (base: string, path: string) =>
  path.startsWith('/tenants') ? path : `${base}${path}`
