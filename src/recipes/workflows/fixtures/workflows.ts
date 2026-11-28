// Ten workflows and where each one's live run stands: the rows of the Finals 2.0
// runs list (boards RunsD1 to RunsD4), as a list endpoint would return them.
// The same rows fill the Workflows panel beside the rail, so the panel and the
// page always agree.
import type {
  GlanceEvent,
  GlanceStage,
  GlanceState,
  GlanceStep,
} from '../../../workflows/components/run-glance'

/**
 * Where a workflow's live run stands. `needs` waits on you, `waiting` on someone
 * else, and `idle` means there is no live run.
 */
export type WorkflowStatus = 'needs' | 'waiting' | 'failed' | 'running' | 'idle'

/** When the person a run waits on has to answer by. */
export type WorkflowDue = 'today' | 'week' | 'none'

/** Who set the live run going: the person viewing, someone else, or a schedule. */
export type WorkflowStarter = 'you' | 'others' | 'schedule'

export type WorkflowRow = {
  id: string
  name: string
  status: WorkflowStatus
  /** Who a `waiting` run waits on: "Tomás R." on the pill, "Tomás Rivera" in the bar. */
  waitingOn?: { short: string; full: string }
  /** What the live run is about: "Harbor Street Supply Co." */
  subject: string
  /** The live run's number. Absent when idle. */
  runId?: string
  /** Live runs besides the one shown. */
  moreLive?: number
  stepCount: number
  /** Every stage, with where the live run stands in each. */
  stages: GlanceStage[]
  /** The current stage's steps. */
  steps: GlanceStep[]
  /** What is happening right now, and the line under it: who it waits on and by when. */
  now: string
  nowSub: string
  /** The status bar in the opened row: what the run waits on, in a sentence or two. */
  bar: { title: string; body: string }
  /** The last three run log events. */
  latest: GlanceEvent[]
  /** "You", a person's name, or "Schedule". */
  startedBy: string
  starter: WorkflowStarter
  due: WorkflowDue
  /** The version the live run started on. */
  version: string
  /** When the run last moved, in words. */
  updated: string
  /** Most recent first: 0 is the latest. */
  recency: number
  /** An idle workflow's last run, and when it next starts. */
  lastRun?: { id: string; line: string }
  nextStart?: string
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Stages from their names: those before `at` done, `at` in `state`, the rest queued. */
function stagesOf(names: string[], at: number, state: GlanceState): GlanceStage[] {
  return names.map((name, i) => ({
    id: slug(name),
    name,
    state: i < at ? 'done' : i === at ? state : 'queued',
  }))
}

const stepsOf = (steps: [string, GlanceState, string?][]): GlanceStep[] =>
  steps.map(([name, state, took]) => ({ id: slug(name), name, state, took }))

export const WORKFLOWS: WorkflowRow[] = [
  {
    id: 'vendor-contract-review',
    name: 'Vendor contract review',
    status: 'needs',
    subject: 'Harbor Street Supply Co.',
    runId: '4821',
    stepCount: 12,
    stages: stagesOf(['Intake', 'Gather', 'Analyze', 'Approve', 'Decide & notify'], 3, 'needs'),
    steps: stepsOf([
      ['Policy check', 'done', '0.4s'],
      ['Approve review memo', 'needs'],
      ['Senior buyer review', 'skipped'],
    ]),
    now: 'Approve review memo',
    nowSub: 'You · due in 3h 40m',
    bar: { title: 'Waiting on you', body: 'Due today 2:00 PM · 3h 40m left' },
    latest: [
      { at: '3:29', step: 'Approve review memo', text: 'Waiting on approval' },
      { at: '3:28', step: 'Policy check', text: '1 exception: parent rating under policy' },
      { at: '3:27', step: 'Draft review memo', text: 'Recommends approve with conditions' },
    ],
    startedBy: 'You',
    starter: 'you',
    due: 'today',
    version: 'v12',
    updated: '12 min ago',
    recency: 4,
  },
  {
    id: 'incident-triage',
    name: 'Incident triage',
    status: 'running',
    subject: 'SEV-2 · checkout p99 latency',
    runId: '7730',
    moreLive: 1,
    stepCount: 21,
    stages: stagesOf(
      [
        'Detect',
        'Page',
        'Triage',
        'Diagnose',
        'Decide',
        'Mitigate',
        'Verify',
        'Communicate',
        'Review',
      ],
      3,
      'running',
    ),
    steps: stepsOf([
      ['Correlate signals', 'done', '24.5s'],
      ['Trace analysis', 'running'],
      ['Check deploy history', 'running'],
    ]),
    now: '2 steps running',
    nowSub: 'No one needed yet',
    bar: { title: '2 steps running', body: 'No one needed yet' },
    latest: [
      { at: '14:09', step: 'Trace analysis', text: 'Started' },
      { at: '14:09', step: 'Check deploy history', text: 'Started' },
      { at: '14:08', step: 'Correlate signals', text: 'Leading cause is the v413 deploy' },
    ],
    startedBy: 'You',
    starter: 'you',
    due: 'none',
    version: 'v6',
    updated: '2 min ago',
    recency: 1,
  },
  {
    id: 'invoice-processing',
    name: 'Invoice processing',
    status: 'failed',
    subject: 'INV-20418 · Northwind Supply',
    runId: '5512',
    stepCount: 26,
    stages: stagesOf(
      ['Receive', 'Classify', 'Extract', 'Validate', 'Exceptions', 'Route', 'Post', 'Archive'],
      4,
      'failed',
    ),
    steps: stepsOf([
      ['Check totals', 'done', '0.6s'],
      ['Check tax lines', 'done', '0.5s'],
      ['Classify exception', 'done', '0.9s'],
      ['Read the invoice', 'failed', '30.0s'],
      ['Match lines', 'queued'],
      ['Flag for review', 'queued'],
      ['Summarize', 'queued'],
      ['Notify the owner', 'queued'],
      ['Close the exception', 'queued'],
    ]),
    now: 'Read the invoice failed',
    nowSub: '2 pages timed out',
    bar: {
      title: 'Read the invoice failed',
      body: '2 pages timed out after 30.0s. The run is halted. Retries 1 of 3.',
    },
    latest: [
      { at: '10:41', step: 'Read the invoice', text: 'Timed out after 30.0s on pages 3–4' },
      { at: '10:40', step: 'Read the invoice', text: 'Retry 1 of 3' },
      { at: '10:39', step: 'Match PO', text: 'Matched the purchase order' },
    ],
    startedBy: 'Mei Tanaka',
    starter: 'others',
    due: 'none',
    version: 'v7',
    updated: '8 min ago',
    recency: 3,
  },
  {
    id: 'supplier-onboarding',
    name: 'Supplier onboarding',
    status: 'needs',
    subject: 'Copperleaf Farms',
    runId: '4817',
    stepCount: 21,
    stages: stagesOf(
      [
        'Request',
        'Screening',
        'Due diligence',
        'Documents',
        'Risk check',
        'Pricing',
        'Contract draft',
        'Contract sign-off',
        'Budget approval',
        'Setup',
        'Training',
        'Go live',
      ],
      7,
      'needs',
    ),
    steps: stepsOf([
      ['Route to legal', 'done', '0.4s'],
      ['Contract sign-off', 'needs'],
      ['Senior legal review', 'skipped'],
    ]),
    now: 'Contract sign-off',
    nowSub: 'You · due tomorrow',
    bar: { title: 'Waiting on you', body: 'Due tomorrow 10:00 AM · 21h left' },
    latest: [
      { at: 'Nov 28', step: 'Contract sign-off', text: 'Reminder sent' },
      { at: 'Nov 27', step: 'Contract sign-off', text: 'Waiting on approval' },
      { at: 'Nov 27', step: 'Route to legal', text: 'Routed to sign-off: under the limit' },
    ],
    startedBy: 'Rachel Okafor',
    starter: 'others',
    due: 'week',
    version: 'v8',
    updated: '40 min ago',
    recency: 6,
  },
  {
    id: 'docs-link-check',
    name: 'Docs link check',
    status: 'running',
    subject: 'Help center · weekly',
    runId: '9120',
    stepCount: 58,
    stages: stagesOf(
      [
        'Schedule',
        'Crawl index',
        'List sections',
        'Fetch sitemap',
        'Parse pages',
        'Extract links',
        'Dedupe',
        'Classify links',
        'Prioritize',
        'Fetch pages',
        'Verify links',
        'Rewrite titles',
        'Check images',
        'Check code samples',
        'Check translations',
        'Group results',
        'Draft fixes',
        'Open pull request',
        'Notify owners',
        'Report',
      ],
      10,
      'running',
    ),
    steps: stepsOf([
      ['Load batch', 'done', '1.2s'],
      ['Normalize URLs', 'done', '0.8s'],
      ['Collect links', 'done', '4.1s'],
      ['Check status codes', 'running'],
      ['Check redirects', 'running'],
      ['Check anchors', 'running'],
      ['Group by page', 'queued'],
      ['Flag broken links', 'queued'],
      ['Save results', 'queued'],
    ]),
    now: '3 steps running',
    nowSub: 'No one needed yet',
    bar: { title: '3 steps running', body: 'No one needed yet' },
    latest: [
      { at: '09:14', step: 'Check anchors', text: 'Started' },
      { at: '09:14', step: 'Check redirects', text: 'Started' },
      { at: '09:14', step: 'Check status codes', text: 'Started' },
    ],
    startedBy: 'Schedule',
    starter: 'schedule',
    due: 'none',
    version: 'v5',
    updated: '1 min ago',
    recency: 0,
  },
  {
    id: 'support-escalation',
    name: 'Support escalation',
    status: 'waiting',
    waitingOn: { short: 'Tomás R.', full: 'Tomás Rivera' },
    subject: 'Case 88231 · failed refund',
    runId: '6604',
    stepCount: 19,
    stages: stagesOf(
      [
        'Intake',
        'Classify',
        'Gather history',
        'Check policy',
        'Research',
        'Decide',
        'Notify',
        'Close',
      ],
      5,
      'waiting',
    ),
    steps: stepsOf([
      ['Approve the refund', 'waiting'],
      ['Pick the channel', 'queued'],
    ]),
    now: 'Approve the refund',
    nowSub: 'Tomás Rivera · due in 45m',
    bar: { title: 'Waiting on Tomás Rivera', body: 'Due in 45m' },
    latest: [
      { at: '14:32', step: 'Approve the refund', text: 'Waiting on approval' },
      { at: '14:31', step: 'Research the case', text: 'Refund failed twice in 7 days' },
      { at: '14:30', step: 'Check policy', text: 'Within the refund policy' },
    ],
    startedBy: 'Tomás Rivera',
    starter: 'others',
    due: 'today',
    version: 'v4',
    updated: '20 min ago',
    recency: 5,
  },
  {
    id: 'release-readiness',
    name: 'Release readiness',
    status: 'running',
    subject: 'Mobile app 4.12',
    runId: '3381',
    stepCount: 24,
    stages: stagesOf(
      [
        'Plan',
        'Freeze',
        'Test',
        'Security scan',
        'Docs',
        'Stage',
        'Approve',
        'Ship',
        'Announce',
        'Retro',
      ],
      2,
      'running',
    ),
    steps: stepsOf([
      ['Run unit tests', 'done', '3.2s'],
      ['Run UI tests', 'running'],
      ['Run load tests', 'running'],
      ['Collect results', 'queued'],
    ]),
    now: '2 steps running',
    nowSub: 'No one needed yet',
    bar: { title: '2 steps running', body: 'No one needed yet' },
    latest: [
      { at: '09:42', step: 'Run load tests', text: 'Started' },
      { at: '09:42', step: 'Run UI tests', text: 'Started' },
      { at: '09:41', step: 'Run unit tests', text: '1,204 tests passed' },
    ],
    startedBy: 'Lena Fischer',
    starter: 'others',
    due: 'none',
    version: 'v9',
    updated: '5 min ago',
    recency: 2,
  },
  {
    id: 'supplier-compliance-refresh',
    name: 'Supplier compliance refresh',
    status: 'idle',
    subject: 'No live run',
    stepCount: 17,
    stages: stagesOf(
      [
        'Schedule',
        'Pull suppliers',
        'Check certificates',
        'Check insurance',
        'Check safety audits',
        'Request updates',
        'Review answers',
        'Update records',
        'Report',
      ],
      -1,
      'queued',
    ),
    steps: [],
    now: 'Starts on its trigger',
    nowSub: 'Next: Dec 1, 06:00',
    bar: { title: 'No live run', body: 'Next: Dec 1, 06:00' },
    latest: [],
    startedBy: 'Schedule',
    starter: 'schedule',
    due: 'none',
    version: 'v3',
    updated: 'Nov 24',
    recency: 9,
    lastRun: { id: '4799', line: 'Run 4799 · Done · Nov 24 · took 2h 55m' },
    nextStart: 'Dec 1, 06:00, on its trigger',
  },
  {
    id: 'employee-onboarding',
    name: 'Employee onboarding',
    status: 'needs',
    subject: 'New hire · Priya Raman',
    runId: '2290',
    stepCount: 23,
    stages: stagesOf(
      ['Offer', 'Accounts', 'Equipment', 'Benefits', 'Checks', 'Approvals', 'Welcome', 'Day one'],
      5,
      'needs',
    ),
    steps: stepsOf([
      ['Access tier', 'done', '0.3s'],
      ['Approve elevated access', 'needs'],
      ['Confirm background check', 'queued'],
    ]),
    now: 'Approve elevated access',
    nowSub: 'You · due today',
    bar: { title: 'Waiting on you', body: 'Due today 5:00 PM · 6h left' },
    latest: [
      { at: '11:05', step: 'Approve elevated access', text: 'Waiting on approval' },
      { at: '11:04', step: 'Access tier', text: 'Needs admin access to the build servers' },
      { at: '10:58', step: 'Summarise check', text: 'Background check clear' },
    ],
    startedBy: 'Rachel Okafor',
    starter: 'others',
    due: 'today',
    version: 'v11',
    updated: '1 hour ago',
    recency: 7,
  },
  {
    id: 'vendor-risk-review',
    name: 'Vendor risk review',
    status: 'waiting',
    waitingOn: { short: 'Owen B.', full: 'Owen Blake' },
    subject: 'Kestrel Analytics · renewal',
    runId: '4402',
    stepCount: 20,
    stages: stagesOf(
      [
        'Intake',
        'Questionnaire',
        'Evidence',
        'Security review',
        'Privacy review',
        'Score',
        'Sign-off',
        'Notify',
        'Archive',
      ],
      6,
      'waiting',
    ),
    steps: stepsOf([
      ['Summarize findings', 'done', '6.2s'],
      ['Sign off on the vendor', 'waiting'],
      ['Send the outcome', 'queued'],
    ]),
    now: 'Sign off on the vendor',
    nowSub: 'Owen Blake · due in 2 days',
    bar: { title: 'Waiting on Owen Blake', body: 'Due Monday 9:00 AM · 2 days left' },
    latest: [
      { at: 'Nov 27', step: 'Sign off on the vendor', text: 'Waiting on approval' },
      { at: 'Nov 27', step: 'Summarize findings', text: '2 low findings, none open' },
      { at: 'Nov 26', step: 'Score', text: 'Risk score 3 of 10' },
    ],
    startedBy: 'Owen Blake',
    starter: 'others',
    due: 'week',
    version: 'v5',
    updated: '3 hours ago',
    recency: 8,
  },
]

/** The words on each status's pill. A `waiting` run names who it waits on instead. */
export const STATUS_LABEL: Record<WorkflowStatus, string> = {
  needs: 'Needs you',
  waiting: 'Waiting on someone',
  failed: 'Failed',
  running: 'Running',
  idle: 'Idle',
}

/** The pill's words for one row: "Waiting on Tomás R." where it names a person. */
export const pillLabel = (row: WorkflowRow) =>
  row.status === 'waiting' && row.waitingOn
    ? `Waiting on ${row.waitingOn.short}`
    : STATUS_LABEL[row.status]

/** A run that waits on you, or has a failed step for someone to look at: these get Review. */
export const needsReview = (row: WorkflowRow) => row.status === 'needs' || row.status === 'failed'

/** The stage the live run is on, counted from 0, or -1 when there is no live run. */
export const stageIndex = (row: WorkflowRow) =>
  row.stages.findIndex((stage) => stage.state !== 'done' && stage.state !== 'queued')

/** "Stage 4 of 5 · Approve", or "Not started · 9 stages". */
export function stageLine(row: WorkflowRow): string {
  const at = stageIndex(row)
  return at >= 0
    ? `Stage ${at + 1} of ${row.stages.length} · ${row.stages[at].name}`
    : `Not started · ${row.stages.length} stages`
}

/** The step a Review opens on: the one waiting on you, or the one that failed. */
export const reviewStep = (row: WorkflowRow) =>
  row.steps.find((step) => step.state === 'needs' || step.state === 'failed')

/** The one workflow with a detail page and a run page in this demo. */
export const DETAILED_WORKFLOW = 'vendor-contract-review'
