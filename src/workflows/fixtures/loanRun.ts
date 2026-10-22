// The run this demo draws: a commercial loan review that stops on a human
// approval.
//
// This is the whole of the example. Everything else in ../components is generic, so
// swapping this file out is what it takes to draw a different workflow.
import {
  feeds,
  GATE_W,
  never,
  type EdgeSeed,
  type StageSeed,
  type StatusMap,
  type StepSeed,
} from '../components/index'
import type {
  RunDetail,
  RunInputSpec,
  RunOutputSpec,
  StepIO,
  StepOutput,
} from '../engine/wireProtocol'
import { io, PEOPLE } from './io-spec'

/**
 * What this example puts in the detail panel. The canvas only carries it.
 *
 * It is now the shape every run uses, wire included, so it lives with the
 * protocol — this alias is kept because "LoanDetail" is what reads right in a
 * file about a loan.
 */
export type LoanDetail = RunDetail

export const STAGES: StageSeed[] = [
  { id: 'intake', name: 'Intake', sub: '2 steps · 0:48', status: 'done' },
  { id: 'gather', name: 'Gather', sub: '3 steps · 1:12', status: 'done' },
  { id: 'analyze', name: 'Analyze', sub: '2 steps · 2:05', status: 'done' },
  { id: 'approve', name: 'Approve', sub: 'Waiting on Dana W.', status: 'current' },
  { id: 'decide', name: 'Decide & notify', sub: '2 steps', status: 'upcoming' },
]

/** Lane geometry behind the normal view, in flow coordinates. */
export const STAGE_LANES: Record<string, { x: number; w: number }> = {
  intake: { x: -80, w: 330 },
  gather: { x: 250, w: 300 },
  analyze: { x: 550, w: 300 },
  approve: { x: 850, w: 570 },
  decide: { x: 1420, w: 330 },
}

export const INITIAL_STATUS: StatusMap = {
  trigger: 'done',
  intake: 'done',
  bureau: 'done',
  spread: 'done',
  kyc: 'done',
  risk: 'done',
  memo: 'done',
  policy: 'done',
  approve: 'waiting',
  senior: 'skipped',
  letter: 'queued',
  notify: 'queued',
}

const APPROVAL_TRACE: [string, string, string][] = [
  ['0:00', 'Application received', ''],
  ['0:04', 'Intake agent', '44s'],
  ['0:48', 'credit_bureau.pull', '0.8s'],
  ['0:48', 'Spread financials', '1:12'],
  ['0:49', 'kyc.verify', '2.1s'],
  ['2:00', 'Risk scoring', '38s'],
  ['2:00', 'Draft credit memo', '1:27'],
  ['3:27', 'Policy check · 1 exception', ''],
]

export const STEPS: StepSeed<LoanDetail>[] = [
  {
    id: 'trigger',
    kind: 'trigger',
    stageId: 'intake',
    title: 'Application received',
    meta: 'Loan portal · 9:02 AM',
    x: 0,
    y: 64,
    detail: {
      summary: 'The run starts when the loan portal posts a completed application.',
      rows: [
        ['Source', 'Loan portal'],
        ['Received', '9:02 AM'],
        ['Documents', '6 files'],
      ],
    },
  },
  {
    id: 'intake',
    kind: 'agent',
    stageId: 'intake',
    title: 'Intake agent',
    meta: '14 fields from 6 docs',
    x: 0,
    y: 200,
    detail: {
      summary: 'Classifies the application and extracts fields from uploaded documents.',
      rows: [
        ['Extracted', '14 fields'],
        ['Documents', '6 of 6 read'],
        ['Took', '44s'],
      ],
    },
  },
  {
    id: 'bureau',
    kind: 'tool',
    stageId: 'gather',
    title: 'credit_bureau.pull',
    mono: true,
    meta: 'Score 742 · no derogatories',
    x: 300,
    y: 20,
    detail: {
      summary: 'Pulls the business credit file.',
      rows: [
        ['Business score', '742'],
        ['Derogatories', 'None'],
        ['Took', '0.8s'],
      ],
    },
  },
  {
    id: 'spread',
    kind: 'agent',
    stageId: 'gather',
    title: 'Spread financials',
    meta: '3 years · DSCR 1.38×',
    x: 300,
    y: 200,
    detail: {
      summary: 'Spreads three years of tax returns into the bank’s standard template.',
      rows: [
        ['DSCR', '1.38×'],
        ['Revenue, 2025', '−18%'],
        ['Took', '1:12'],
      ],
    },
  },
  {
    id: 'kyc',
    kind: 'tool',
    stageId: 'gather',
    title: 'kyc.verify',
    mono: true,
    meta: '2 of 2 owners verified',
    x: 300,
    y: 380,
    detail: {
      summary: 'Verifies the identity of every listed beneficial owner.',
      rows: [
        ['Owners', '2 of 2 verified'],
        ['Took', '2.1s'],
      ],
    },
  },
  {
    id: 'risk',
    kind: 'agent',
    stageId: 'analyze',
    title: 'Risk scoring',
    meta: 'Grade 4 of 10 · CRM v3.2',
    x: 600,
    y: 110,
    detail: {
      summary: 'Scores the borrower against the commercial risk model.',
      rows: [
        ['Risk grade', '4 of 10'],
        ['Model', 'CRM v3.2'],
        ['Took', '38s'],
      ],
    },
  },
  {
    id: 'memo',
    kind: 'agent',
    stageId: 'analyze',
    title: 'Draft credit memo',
    meta: 'Approve with conditions',
    x: 600,
    y: 290,
    detail: {
      summary: 'Writes the credit memo and a recommendation for the analyst.',
      rows: [
        ['Recommends', 'Approve with conditions'],
        ['Memo', '7 pages'],
        ['Took', '1:27'],
      ],
    },
  },
  {
    id: 'policy',
    kind: 'decision',
    stageId: 'approve',
    title: 'Policy check',
    meta: '1 exception',
    x: 900,
    y: 200,
    w: GATE_W,
    detail: {
      summary: 'Routes the run by loan size and policy exceptions.',
      rows: [
        ['Exceptions', '1'],
        ['Routed to', 'Analyst approval'],
        ['Senior officer', 'Not required under $500,000'],
      ],
    },
  },
  {
    id: 'approve',
    kind: 'human',
    stageId: 'approve',
    initials: 'DW',
    title: 'Approve credit memo',
    meta: 'Due in 3h 40m',
    // The countdown and the name are this run's, not the canvas's.
    statusLabel: '3h 40m',
    assignee: 'Dana Whitfield',
    x: 1174,
    y: 183,
    detail: {
      summary:
        'Review the drafted memo and the policy exception. Nothing after this step runs until you decide.',
      due: 'Today 2:00 PM · 3h 40m left',
      rows: [
        ['Routed by', 'Policy check'],
        ['If approved', 'Draft decision letter'],
      ],
      recommendation: {
        from: 'Draft credit memo',
        verdict: 'Approve with conditions',
        figures: [
          ['Loan', '$450,000'],
          ['Risk grade', '4 of 10'],
          ['DSCR', '1.38×'],
        ],
      },
      exception: {
        text: 'Guarantor credit score is 672. Policy asks for 680.',
        mitigant: 'Mitigant in memo: 24 months of cash reserves.',
      },
      trace: APPROVAL_TRACE,
    },
  },
  {
    id: 'senior',
    kind: 'human',
    stageId: 'approve',
    title: 'Senior officer review',
    meta: 'Only if loan ≥ $500,000',
    x: 1174,
    y: 380,
    detail: {
      summary: 'A second approval that only runs on larger loans.',
      rows: [
        ['Role', 'Senior credit officer'],
        ['Threshold', '$500,000'],
        ['This run', 'Skipped — $450,000'],
      ],
    },
  },
  {
    id: 'letter',
    kind: 'agent',
    stageId: 'decide',
    title: 'Draft decision letter',
    meta: 'Starts after your approval',
    x: 1474,
    y: 200,
    detail: {
      summary: 'Prepares the approval letter with the analyst’s conditions.',
      rows: [
        ['Starts after', 'Your approval'],
        ['Typical time', '~40s'],
      ],
    },
  },
  {
    id: 'notify',
    kind: 'tool',
    stageId: 'decide',
    title: 'portal.notify',
    mono: true,
    meta: 'Emails the applicant',
    x: 1474,
    y: 380,
    detail: {
      summary: 'Sends the decision letter to the applicant through the portal.',
      rows: [['Sends', 'Decision letter to applicant']],
    },
  },
]

export const STEP_BY_ID = new Map(STEPS.map((s) => [s.id, s]))

export const EDGE_SEEDS: EdgeSeed[] = [
  { from: 'trigger', to: 'intake', state: feeds('intake') },
  { from: 'intake', to: 'bureau', state: feeds('bureau') },
  { from: 'intake', to: 'spread', state: feeds('spread') },
  { from: 'intake', to: 'kyc', state: feeds('kyc') },
  { from: 'bureau', to: 'risk', state: feeds('risk') },
  { from: 'spread', to: 'risk', state: feeds('risk') },
  { from: 'spread', to: 'memo', state: feeds('memo') },
  { from: 'kyc', to: 'memo', state: feeds('memo') },
  { from: 'risk', to: 'policy', state: feeds('policy') },
  { from: 'memo', to: 'policy', state: feeds('policy') },
  { from: 'policy', to: 'approve', state: feeds('approve') },
  { from: 'policy', to: 'senior', state: never },
  { from: 'letter', to: 'notify', state: feeds('notify') },
  { from: 'senior', to: 'letter', state: never },
  { from: 'approve', to: 'letter', state: feeds('letter') },
]

/** What the run was started with. */
export const RUN_INPUT_SPECS: RunInputSpec[] = [
  {
    name: 'application',
    type: 'file',
    required: true,
    description: 'The completed application and its documents.',
  },
  { name: 'applicant', type: 'text', required: true, description: 'The business applying.' },
  { name: 'amount', type: 'money', required: true, description: 'How much they are asking for.' },
  {
    name: 'term_months',
    type: 'number',
    required: true,
    description: 'The length of the loan, in months.',
  },
  {
    name: 'guarantors',
    type: 'list',
    required: false,
    description: 'Anyone guaranteeing the loan, one per line.',
  },
  {
    name: 'analyst',
    type: 'person',
    required: true,
    description: 'Who approves the credit memo.',
    options: PEOPLE,
  },
]

export const RUN_OUTPUT_SPECS: RunOutputSpec[] = [
  {
    name: 'credit_memo',
    type: 'file',
    description: 'The memo and its recommendation.',
    goesTo: 'Loan file',
  },
  {
    name: 'risk_grade',
    type: 'number',
    description: 'The grade from the risk model, 1 to 10.',
    goesTo: 'Loan file',
  },
  {
    name: 'decision',
    type: 'choice',
    description: 'Approved, sent back or declined.',
    goesTo: 'Loan portal',
  },
  {
    name: 'decision_letter',
    type: 'file',
    description: 'The letter sent to the applicant.',
    goesTo: 'Applicant',
  },
]

export const RUN_INPUTS: Record<string, string> = {
  application: 'Harbor_Street_application.pdf',
  applicant: 'Harbor Street Bakery LLC',
  amount: '$450,000',
  term_months: '84',
  guarantors: 'Maria Okonjo\nDavid Okonjo',
  analyst: 'Dana Whitfield',
}

/**
 * Each step's inputs and outputs. Outputs carry values only where this run has
 * produced them: everything up to the policy check.
 */
export const STEP_IO: Record<string, StepIO> = {
  trigger: io(
    'application:file<run; applicant:text<run; amount:money<run',
    'application:file=6 documents; applicant:text=Harbor Street Bakery LLC; amount:money=$450,000',
  ),
  intake: io('application:file<trigger', 'fields:object=14 fields; owners:list=2 owners'),
  bureau: io('fields:object<intake', 'credit_score:number=742; derogatories:list=None'),
  spread: io('application:file<trigger', 'spread:object=3 years; dscr:number=1.38×'),
  kyc: io('owners:list<intake', 'verified:boolean=2 of 2 owners'),
  risk: io('credit_score:number<bureau; spread:object<spread', 'risk_grade:number=4 of 10'),
  memo: io(
    'spread:object<spread; dscr:number<spread; verified:boolean<kyc',
    'credit_memo:file=7 pages; recommendation:choice=Approve with conditions',
  ),
  policy: io(
    'amount:money<trigger; risk_grade:number<risk; credit_memo:file<memo',
    'route:choice=Analyst approval; exceptions:list=1 exception',
  ),
  approve: io(
    'credit_memo:file<memo; risk_grade:number<risk; exceptions:list<policy',
    'decision:choice; conditions:text',
  ),
  senior: io('credit_memo:file<memo; exceptions:list<policy', 'decision:choice'),
  letter: io('decision:choice<approve; conditions:text<approve', 'decision_letter:file'),
  notify: io('decision_letter:file<letter', 'delivery_receipt:object'),
}

/** What the approval produces once it is given. */
export const APPROVAL_OUTPUTS: StepOutput[] = [
  { name: 'decision', type: 'choice', value: 'Approved' },
  { name: 'conditions', type: 'text', value: 'Personal guarantee from both owners' },
]

/** What the analyst's decision does to the rest of the run. */
export function applyDecision(statuses: StatusMap, decision: 'approved' | 'changes'): StatusMap {
  if (decision === 'changes') {
    return { ...statuses, approve: 'changes', memo: 'running' }
  }
  return { ...statuses, approve: 'approved', letter: 'running', notify: 'queued' }
}
