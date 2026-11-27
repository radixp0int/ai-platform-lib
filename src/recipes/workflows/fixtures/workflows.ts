// Ten workflows and where each one's live run stands: the rows of the Finals 2.0
// runs list, as a list endpoint would return them. The same rows fill the
// Workflows panel beside the rail, so the panel and the page always agree.

/** Where a workflow's live run stands. `idle` means it has none. */
export type WorkflowStatus = 'needs' | 'failed' | 'running' | 'idle'

/** When the person a run waits on has to answer by. */
export type WorkflowDue = 'today' | 'week' | 'none'

/** Who set the live run going: the person viewing, someone else, or a schedule. */
export type WorkflowStarter = 'you' | 'others' | 'schedule'

export type WorkflowRow = {
  id: string
  name: string
  /** "5 stages · 5 agents · 3 tools" */
  shape: string
  status: WorkflowStatus
  /** What the live run is about: "Harbor Street Supply Co. · $450,000". */
  subject: string
  /** The stage the run is on, counted from 1. `0` when it has not started. */
  stageAt: number
  stageCount: number
  /** The current stage's name. Empty when idle. */
  stageName: string
  /** What is happening right now, and the line under it: who it waits on and by when. */
  now: string
  nowSub: string
  /** "You", a person's name, or "Schedule". */
  startedBy: string
  starter: WorkflowStarter
  due: WorkflowDue
  /** When the run last moved, in words. */
  updated: string
  /** Most recent first: the order the grid opens in. */
  recency: number
}

export const WORKFLOWS: WorkflowRow[] = [
  {
    id: 'vendor-contract-review',
    name: 'Vendor contract review',
    shape: '5 stages · 5 agents · 3 tools',
    status: 'needs',
    subject: 'Harbor Street Supply Co. · $450,000',
    stageAt: 4,
    stageCount: 5,
    stageName: 'Approve',
    now: 'Approve review memo',
    nowSub: 'Dana Whitfield · due in 3h 40m',
    startedBy: 'You',
    starter: 'you',
    due: 'today',
    updated: '12 min ago',
    recency: 4,
  },
  {
    id: 'supplier-onboarding',
    name: 'Supplier onboarding',
    shape: '10 stages · 7 agents · 7 tools',
    status: 'needs',
    subject: 'Copperleaf Farms · $780,000',
    stageAt: 7,
    stageCount: 10,
    stageName: 'Approve',
    now: 'Sourcing committee review',
    nowSub: 'Marcus Lee · due tomorrow',
    startedBy: 'Marcus Lee',
    starter: 'others',
    due: 'week',
    updated: '40 min ago',
    recency: 6,
  },
  {
    id: 'employee-onboarding',
    name: 'Employee onboarding',
    shape: '8 stages · 5 agents · 9 tools',
    status: 'needs',
    subject: 'New hire · Priya Raman',
    stageAt: 6,
    stageCount: 8,
    stageName: 'Approvals',
    now: '2 approvals open',
    nowSub: 'Rachel Okafor and Nia T.',
    startedBy: 'Rachel Okafor',
    starter: 'others',
    due: 'none',
    updated: '1 hour ago',
    recency: 7,
  },
  {
    id: 'incident-triage',
    name: 'Incident triage',
    shape: '9 stages · 6 agents · 8 tools',
    status: 'running',
    subject: 'SEV-2 · checkout p99 latency',
    stageAt: 4,
    stageCount: 9,
    stageName: 'Diagnose',
    now: '2 steps running',
    nowSub: 'No one needed yet',
    startedBy: 'You',
    starter: 'you',
    due: 'none',
    updated: '2 min ago',
    recency: 1,
  },
  {
    id: 'month-end-close',
    name: 'Month-end close',
    shape: '10 stages · 6 agents · 5 tools',
    status: 'running',
    subject: 'September close',
    stageAt: 3,
    stageCount: 10,
    stageName: 'Subledgers',
    now: '2 steps running',
    nowSub: 'No one needed yet',
    startedBy: 'Lena Fischer',
    starter: 'others',
    due: 'none',
    updated: '5 min ago',
    recency: 2,
  },
  {
    id: 'vendor-risk-review',
    name: 'Vendor risk review',
    shape: '9 stages · 6 agents · 5 tools',
    status: 'needs',
    subject: 'Kestrel Analytics · renewal',
    stageAt: 7,
    stageCount: 9,
    stageName: 'Sign-off',
    now: 'Sign off on the vendor',
    nowSub: 'Owen Blake · due in 2 days',
    startedBy: 'Owen Blake',
    starter: 'others',
    due: 'week',
    updated: '3 hours ago',
    recency: 8,
  },
  {
    id: 'invoice-processing',
    name: 'Invoice processing',
    shape: '8 stages · 4 agents · 6 tools',
    status: 'failed',
    subject: 'INV-20418 · Northwind Supply',
    stageAt: 5,
    stageCount: 8,
    stageName: 'Exceptions',
    now: 'Reading the invoice failed',
    nowSub: '2 pages timed out · retry or open the log',
    startedBy: 'Mei Tanaka',
    starter: 'others',
    due: 'none',
    updated: '8 min ago',
    recency: 3,
  },
  {
    id: 'support-escalation',
    name: 'Support escalation',
    shape: '8 stages · 5 agents · 5 tools',
    status: 'needs',
    subject: 'Case 88231 · failed refund',
    stageAt: 6,
    stageCount: 8,
    stageName: 'Decide',
    now: 'Approve the refund',
    nowSub: 'Tomás Rivera · due in 45m',
    startedBy: 'Tomás Rivera',
    starter: 'others',
    due: 'today',
    updated: '20 min ago',
    recency: 5,
  },
  {
    id: 'revenue-forecast',
    name: 'Revenue forecast',
    shape: '9 stages · 3 agents · 6 tools',
    status: 'running',
    subject: 'Daily forecast · Nov 25',
    stageAt: 6,
    stageCount: 9,
    stageName: 'Model',
    now: 'Building the 13-week forecast',
    nowSub: 'No one needed yet',
    startedBy: 'Schedule',
    starter: 'schedule',
    due: 'none',
    updated: '1 min ago',
    recency: 0,
  },
  {
    id: 'supplier-compliance-refresh',
    name: 'Supplier compliance refresh',
    shape: '9 stages · 3 agents · 6 tools',
    status: 'idle',
    subject: 'No live run',
    stageAt: 0,
    stageCount: 9,
    stageName: '',
    now: 'Starts on its trigger',
    nowSub: 'Next: Dec 1, 06:00',
    startedBy: 'Schedule',
    starter: 'schedule',
    due: 'none',
    updated: 'Nov 24',
    recency: 9,
  },
]

/** The words for each status, on the pill, the filters and the panel's headings. */
export const STATUS_LABEL: Record<WorkflowStatus, string> = {
  needs: 'Needs you',
  failed: 'Failed step',
  running: 'Running',
  idle: 'Idle',
}

/** A run that waits on a person, or has a failed step someone has to look at. */
export const needsSomeone = (row: WorkflowRow) => row.status === 'needs' || row.status === 'failed'

/** "Stage 4 of 5 · Approve", or "Not started · 9 stages". */
export function stageLine(row: WorkflowRow): string {
  return row.stageAt
    ? `Stage ${row.stageAt} of ${row.stageCount} · ${row.stageName}`
    : `Not started · ${row.stageCount} stages`
}

/** The one workflow with a detail page and a live run to open. */
export const DETAILED_WORKFLOW = 'vendor-contract-review'
/** That workflow's live run. */
export const LIVE_RUN_ID = '4821'
