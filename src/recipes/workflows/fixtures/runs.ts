// The runs the run page shows (boards RunA1 to RunA3): one vendor contract
// review waiting on your approval with a failed step beside it, the same
// workflow's last finished run, and a twelve-stage supplier onboarding. Each is
// a `RunTrace`, the record the Details view reads, plus where each step sits on
// the canvas.
import type { RunTrace, TraceStep } from '../../../workflows/components/run-trace'

export type RunRecord = {
  trace: RunTrace
  workflowId: string
  /** What the run is about: "Harbor Street Supply Co." */
  subject: string
  /** The band's line of facts. */
  facts: string
  /** Who the waiting step waits on, when it isn't you: "Dana W." */
  waitingOn?: string
  /** The version the run started on. */
  version: string
  /** Each step's place on the canvas: column, then row within it. */
  layout: Record<string, [column: number, row: number]>
}

type Step = Omit<TraceStep, 'input' | 'output' | 'description'> &
  Partial<Pick<TraceStep, 'input' | 'output' | 'description'>>

const step = (s: Step): TraceStep => ({
  description: s.summary,
  input: '—',
  output: s.summary,
  ...s,
})

// ── Vendor contract review, run 4821 ─────────────────────────────────────────

const VENDOR_STAGES = [
  { id: 'intake', name: 'Intake' },
  { id: 'gather', name: 'Gather' },
  { id: 'analyze', name: 'Analyze' },
  { id: 'approve', name: 'Approve' },
  { id: 'decide', name: 'Decide & notify' },
]

const VENDOR_STEPS: TraceStep[] = [
  step({
    id: 'request-received',
    stageId: 'intake',
    kind: 'trigger',
    title: 'Request received',
    status: 'done',
    startedAt: 0,
    duration: 0.2,
    summary: 'Vendor portal · 6 documents',
    description: 'Starts the run when a completed request is posted from the vendor portal.',
    output: '6 documents: the contract, three years of statements, the owners list, a reference.',
    history: [{ at: '9:02', text: 'Posted from the vendor portal' }],
  }),
  step({
    id: 'intake-agent',
    stageId: 'intake',
    kind: 'agent',
    title: 'Intake agent',
    status: 'done',
    startedAt: 4,
    duration: 44,
    summary: '14 fields from 6 documents',
    description: 'Classifies the request and pulls out the fields the later steps need.',
    input: 'request: 6 documents',
    output: 'vendor: Harbor Street Supply Co.\nterm_months: 36\nfields: 14 extracted',
    reasoning:
      'All six documents were readable. The contract is a standard three-year supply agreement, so the request goes through the usual checks.',
    calls: [
      { id: 'c1', kind: 'model', label: 'Classify the request', startedAt: 0, duration: 6.2 },
      { id: 'c2', kind: 'tool', label: 'docs.read(6)', startedAt: 6.4, duration: 21.5 },
      { id: 'c3', kind: 'model', label: 'Extract the fields', startedAt: 28.1, duration: 15.6 },
    ],
    usage: { model: 'acme-large', inputTokens: 9800, outputTokens: 1200 },
  }),
  step({
    id: 'vendor-registry-pull',
    stageId: 'gather',
    kind: 'tool',
    title: 'vendor_registry.pull',
    mono: true,
    status: 'done',
    startedAt: 48.5,
    duration: 0.8,
    summary: 'Rating 742 · no flags',
    description: 'Pulls the supplier rating and any flags from the vendor registry.',
    input: 'vendor: Harbor Street Supply Co.',
    output: '{ "rating": 742, "flags": [] }',
    retries: '0 of 2',
  }),
  step({
    id: 'review-financials',
    stageId: 'gather',
    kind: 'agent',
    title: 'Review financials',
    status: 'done',
    startedAt: 49,
    duration: 72,
    summary: '3 years · margin cover 1.38×',
    description: 'Reads three years of statements and works out the margin cover.',
    input: 'request: 3 statements',
    output: 'margin_cover: 1.38\nrevenue_change: -18%',
    reasoning:
      'Revenue fell 18% last year, but margins held. Cover stays above the 1.25× the policy asks for.',
    calls: [
      { id: 'c1', kind: 'tool', label: 'docs.read(3)', startedAt: 0, duration: 18.2 },
      { id: 'c2', kind: 'model', label: 'Spread the statements', startedAt: 18.4, duration: 41.3 },
      { id: 'c3', kind: 'model', label: 'Work out the cover', startedAt: 60, duration: 11.8 },
    ],
    usage: { model: 'acme-large', inputTokens: 6200, outputTokens: 900 },
  }),
  step({
    id: 'owners-verify',
    stageId: 'gather',
    kind: 'tool',
    title: 'owners.verify',
    mono: true,
    status: 'done',
    startedAt: 49.2,
    duration: 2.1,
    summary: '2 of 2 owners verified',
    description: 'Checks the vendor’s owners against the registry.',
    input: 'vendor: Harbor Street Supply Co.',
    output: '{ "owners": 2, "verified": 2 }',
    retries: '0 of 2',
  }),
  step({
    id: 'risk-scoring',
    stageId: 'analyze',
    kind: 'agent',
    title: 'Risk scoring',
    status: 'done',
    startedAt: 121,
    duration: 38,
    summary: 'Grade 4 of 10 · model v3.2',
    description: 'Grades the contract from 1 to 10 with the risk model.',
    input: 'rating: 742\nmargin_cover: 1.38',
    output: 'risk_grade: 4',
    calls: [
      { id: 'c1', kind: 'tool', label: 'risk_model.score()', startedAt: 0, duration: 29.6 },
      { id: 'c2', kind: 'model', label: 'Explain the grade', startedAt: 29.8, duration: 8.1 },
    ],
    usage: { model: 'acme-large', inputTokens: 2100, outputTokens: 400 },
  }),
  step({
    id: 'draft-review-memo',
    stageId: 'analyze',
    kind: 'agent',
    title: 'Draft review memo',
    status: 'done',
    startedAt: 159,
    duration: 87,
    summary: 'Recommends approve with conditions',
    description: 'Writes the review memo and its recommendation.',
    input: 'risk_grade: 4',
    output: 'review_memo: memo-4821.pdf (4 pages)',
    calls: [
      { id: 'c1', kind: 'model', label: 'Plan the memo', startedAt: 0, duration: 9.4 },
      { id: 'c2', kind: 'tool', label: 'docs.merge(template)', startedAt: 9.6, duration: 3.1 },
      { id: 'c3', kind: 'model', label: 'Write the memo', startedAt: 12.9, duration: 61.2 },
      { id: 'c4', kind: 'model', label: 'Check the memo', startedAt: 74.3, duration: 12.5 },
    ],
    usage: { model: 'acme-large', inputTokens: 21100, outputTokens: 3300 },
  }),
  step({
    id: 'policy-check',
    stageId: 'approve',
    kind: 'decision',
    title: 'Policy check',
    status: 'done',
    startedAt: 207.5,
    duration: 0.4,
    summary: 'Routed to approval',
    description: 'Routes the run by contract size and any policy exceptions.',
    output: 'route: buyer only\nexceptions: 1',
    route: 'Buyer only · under $500k',
    history: [{ at: '3:28', text: 'Found 1 exception: parent rating 672 under 680' }],
  }),
  step({
    id: 'approve-review-memo',
    stageId: 'approve',
    kind: 'human',
    title: 'Approve review memo',
    status: 'waiting',
    startedAt: 209,
    duration: 7800,
    summary: 'Waiting on you',
    description:
      'The buyer reviews the memo and any policy exception, then approves, asks for changes or declines.',
    input: 'review_memo: memo-4821.pdf\nrisk_grade: 4\nexceptions: 1',
    output: 'Not answered yet',
    assignee: 'You',
    waited: '2h 10m',
    due: 'Today 2:00 PM',
    notes: [
      {
        heading: 'Agent recommendation',
        body: 'Approve with conditions · grade 4 of 10. Terms are standard apart from a 60-day payment window.',
      },
      {
        heading: 'Policy exception',
        body: 'The vendor’s parent rating is 672; policy asks for 680 or above on contracts this size.',
      },
    ],
    reasoning:
      'The supplier has three clean years and verified owners. The only gap is the parent company’s rating, eight points short. A 60-day payment window and a quarterly review cover that risk.',
    history: [
      { at: '3:28', text: 'Routed here by Policy check' },
      { at: '3:29', text: 'Waiting on you' },
      { at: '4:10', text: 'Reminder sent' },
    ],
  }),
  step({
    id: 'senior-buyer-review',
    stageId: 'approve',
    kind: 'human',
    title: 'Senior buyer review',
    status: 'skipped',
    summary: 'Skipped: under $500k',
    description: 'A second approval on larger contracts.',
    output: 'Skipped: the contract is under $500,000',
  }),
  step({
    id: 'draft-decision-letter',
    stageId: 'decide',
    kind: 'agent',
    title: 'Draft decision letter',
    status: 'queued',
    summary: 'Queued after approval',
    description: 'Writes the letter that tells the vendor the decision.',
    output: 'Not started',
  }),
  step({
    id: 'portal-notify',
    stageId: 'decide',
    kind: 'tool',
    title: 'portal.notify',
    mono: true,
    status: 'failed',
    startedAt: 302,
    duration: 3.1,
    summary: 'Pre-check returned 401',
    description: 'Posts the decision to the vendor portal so the supplier sees it.',
    input: 'decision_letter: (waiting on approval)',
    output: '{ "status": 401, "error": "token_expired", "hint": "refresh the portal key" }',
    retries: '2 of 2',
    failure:
      'The portal returned 401 Unauthorized three times. The run carries on; the letter waits for this step.',
    calls: [
      { id: 'c1', kind: 'tool', label: 'auth.refresh()', startedAt: 0, duration: 0.3 },
      {
        id: 'c2',
        kind: 'tool',
        label: 'portal.precheck → 401',
        startedAt: 0.3,
        duration: 0.6,
        failed: true,
      },
      { id: 'c3', kind: 'tool', label: 'retry 1: auth.refresh()', startedAt: 0.9, duration: 0.3 },
      {
        id: 'c4',
        kind: 'tool',
        label: 'portal.precheck → 401',
        startedAt: 1.2,
        duration: 0.6,
        failed: true,
      },
      {
        id: 'c5',
        kind: 'tool',
        label: 'retry 2: portal.precheck → 401',
        startedAt: 1.8,
        duration: 1.3,
        failed: true,
      },
    ],
    history: [
      { at: '5:02', text: 'Pre-check returned 401' },
      { at: '5:03', text: 'Retry 1 of 2 failed' },
      { at: '5:05', text: 'Retry 2 of 2 failed' },
    ],
  }),
]

const VENDOR_LAYOUT: RunRecord['layout'] = {
  'request-received': [0, 0],
  'intake-agent': [0, 1],
  'vendor-registry-pull': [1, 0],
  'review-financials': [1, 1],
  'owners-verify': [1, 2],
  'risk-scoring': [2, 0],
  'draft-review-memo': [2, 1],
  'policy-check': [3, 0],
  'approve-review-memo': [4, 0],
  'senior-buyer-review': [4, 1],
  'draft-decision-letter': [5, 0],
  'portal-notify': [5, 1],
}

export const VENDOR_RUN: RunRecord = {
  workflowId: 'vendor-contract-review',
  subject: 'Harbor Street Supply Co.',
  facts: 'Started 9:02 AM by you · 3m 29s working · 2h 10m waiting · 21.4k tokens · v12',
  version: 'v12',
  layout: VENDOR_LAYOUT,
  trace: {
    id: '4821',
    workflow: 'Vendor contract review',
    title: 'Harbor Street Supply Co.',
    state: 'waiting',
    startedBy: 'You',
    startedLabel: '9:02 AM',
    elapsed: 8009,
    stages: VENDOR_STAGES,
    steps: VENDOR_STEPS,
  },
}

/** The same workflow's last run, finished: approved, the letter sent. */
export const VENDOR_RUN_DONE: RunRecord = {
  ...VENDOR_RUN,
  subject: 'Copperleaf Farms',
  facts: 'Started Nov 24 by Marcus Lee · took 3h 12m · 19.8k tokens · v12',
  trace: {
    ...VENDOR_RUN.trace,
    id: '4819',
    title: 'Copperleaf Farms',
    state: 'done',
    startedBy: 'Marcus Lee',
    startedLabel: 'Nov 24',
    steps: VENDOR_STEPS.map((s) =>
      s.id === 'approve-review-memo'
        ? {
            ...s,
            status: 'approved',
            duration: 10800,
            summary: 'Approved by Dana Whitfield',
            output: 'decision: approved\nconditions: none',
            waited: '3h 00m',
            history: [
              { at: '3:28', text: 'Routed here by Policy check' },
              { at: '6:28', text: 'Approved by Dana Whitfield' },
            ],
          }
        : s.id === 'draft-decision-letter'
          ? {
              ...s,
              status: 'done',
              startedAt: 11010,
              duration: 31,
              summary: 'Approval letter drafted',
            }
          : s.id === 'portal-notify'
            ? {
                ...s,
                status: 'done',
                startedAt: 11042,
                duration: 0.9,
                summary: 'Posted to the vendor portal',
                failure: undefined,
                retries: '0 of 2',
                calls: [
                  { id: 'c1', kind: 'tool', label: 'portal.precheck', startedAt: 0, duration: 0.3 },
                  { id: 'c2', kind: 'tool', label: 'portal.post', startedAt: 0.3, duration: 0.6 },
                ],
                history: undefined,
                output: '{ "status": 201 }',
              }
            : s,
    ),
  },
}

// ── Supplier onboarding, run 6107: twelve stages ─────────────────────────────

const SUPPLIER_STAGE_NAMES: [string, string[]][] = [
  ['Intake', ['Request received', 'Intake agent']],
  ['Identity', ['company_registry.lookup', 'Verify the signatory']],
  ['Documents', ['Collect documents', 'Check the documents', 'docs.archive']],
  ['Tax forms', ['Check the tax form']],
  ['Security review', ['security_scan.run', 'Grade the security answers']],
  ['Insurance', ['Check the certificate']],
  ['Contract draft', ['Draft the contract', 'docs.merge']],
  ['Contract sign-off', ['Route to legal', 'Contract sign-off', 'Senior legal review']],
  ['Budget approval', ['Budget approval']],
  ['Account setup', ['erp.create_supplier', 'Send the welcome pack']],
  ['Training invite', ['calendar.invite']],
  ['Go live', ['Go live']],
]

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function supplierSteps(): TraceStep[] {
  const out: TraceStep[] = []
  let clock = 0
  SUPPLIER_STAGE_NAMES.forEach(([stage, names], s) => {
    names.forEach((title) => {
      const id = slug(title)
      const mono = title.includes('.') || title.includes('_')
      const kind =
        title === 'Request received'
          ? 'trigger'
          : mono
            ? 'tool'
            : title === 'Route to legal'
              ? 'decision'
              : ['Contract sign-off', 'Senior legal review', 'Budget approval', 'Go live'].includes(
                    title,
                  )
                ? 'human'
                : 'agent'
      if (s < 7) {
        const duration = kind === 'tool' ? 1.2 : kind === 'trigger' ? 0.2 : 40
        out.push(
          step({
            id,
            stageId: slug(stage),
            kind,
            title,
            mono,
            status: 'done',
            startedAt: clock,
            duration,
            summary: 'Done',
          }),
        )
        clock += duration + 60
        return
      }
      if (title === 'Route to legal') {
        out.push(
          step({
            id,
            stageId: slug(stage),
            kind,
            title,
            status: 'done',
            startedAt: clock,
            duration: 0.4,
            summary: 'Routed to sign-off',
            route: 'Legal sign-off · under the limit',
          }),
        )
        return
      }
      if (title === 'Contract sign-off') {
        out.push(
          step({
            id,
            stageId: slug(stage),
            kind,
            title,
            status: 'waiting',
            startedAt: clock + 1,
            duration: 75900,
            summary: 'Waiting on you',
            description:
              'Legal checks the redlines and signs off the supplier contract before the budget owner sees it.',
            assignee: 'You',
            waited: '21h 5m',
            due: 'Tomorrow 10:00 AM',
            notes: [
              {
                heading: 'Agent recommendation',
                body: 'Sign off with one change. The liability cap in clause 9 sits below the template’s floor.',
              },
              {
                heading: 'Redlines',
                body: 'Two edits to the standard terms: a 45-day payment window, and a longer notice period for price changes.',
              },
            ],
            reasoning:
              'The supplier passed every earlier check and its security grade is low. The only open point is clause 9. A one-line fix brings it back to the template, so this does not need senior legal review.',
            history: [
              { at: 'Nov 27', text: 'Routed here by Route to legal' },
              { at: 'Nov 27', text: 'Waiting on you' },
              { at: 'Nov 28', text: 'Reminder sent' },
            ],
          }),
        )
        return
      }
      out.push(
        step({
          id,
          stageId: slug(stage),
          kind,
          title,
          mono,
          status: title === 'Senior legal review' ? 'skipped' : 'queued',
          summary: title === 'Senior legal review' ? 'Skipped: under the limit' : 'Queued',
        }),
      )
    })
  })
  return out
}

const SUPPLIER_STEPS = supplierSteps()

export const SUPPLIER_RUN: RunRecord = {
  workflowId: 'supplier-onboarding',
  subject: 'Copperleaf Farms',
  facts: 'Started Nov 24 by Rachel Okafor · 3d 4h elapsed · 21h waiting · 64.1k tokens · v8',
  version: 'v8',
  layout: Object.fromEntries(
    SUPPLIER_STAGE_NAMES.flatMap(([, names], s) => names.map((title, i) => [slug(title), [s, i]])),
  ),
  trace: {
    id: '6107',
    workflow: 'Supplier onboarding',
    title: 'Copperleaf Farms',
    state: 'waiting',
    startedBy: 'Rachel Okafor',
    startedLabel: 'Nov 24',
    elapsed: 274000,
    stages: SUPPLIER_STAGE_NAMES.map(([name]) => ({ id: slug(name), name })),
    steps: SUPPLIER_STEPS,
  },
}

/** Every run the demo has, by workflow and run number. */
export const RUNS: RunRecord[] = [VENDOR_RUN, VENDOR_RUN_DONE, SUPPLIER_RUN]

export const findRun = (workflowId: string, runId: string) =>
  RUNS.find((run) => run.workflowId === workflowId && run.trace.id === runId)
