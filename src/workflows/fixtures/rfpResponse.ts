// A ten-stage run whose steps carry structured content.
//
// The other three variants answer "does the canvas draw a run"; this one is here
// for the two things they are too small to ask:
//
//  1. Ten stages. At the detail tier that is three screens wide, which is what
//     folding exists for — the stages away from the gate fold to bars.
//  2. Steps with `content`: facts, a decision's branches, section progress, the
//     tools an agent called, and a step that runs another workflow.
//
// Like the others it needs no server. It is authored here rather than copied
// from the mock API, which does not have it yet.
import { io, PEOPLE } from './io-spec'
import { work, type RunScript, type ScriptStep } from './script-types'
import type {
  RunDetail,
  StepIO,
  WireEdge,
  WireStep,
  WireStepContent,
  WireStepKind,
} from '../engine/wireProtocol'

type Extra = Partial<Pick<WireStep, 'initials' | 'assignee' | 'statusLabel' | 'meta'>> & {
  content?: WireStepContent
  rows?: RunDetail['rows']
  /** The rest of the inspector: when it is due, the recommendation, the trail. */
  more?: Omit<RunDetail, 'summary' | 'rows'>
}

/** One step. Tool names take the mono face, the way the other variants set it. */
const step = (
  id: string,
  kind: WireStepKind,
  stageId: string,
  column: number,
  row: number,
  title: string,
  summary: string,
  { rows = [], more, ...rest }: Extra = {},
): WireStep => ({
  id,
  kind,
  stageId,
  title,
  meta: 'Queued',
  mono: kind === 'tool' || undefined,
  column,
  row,
  detail: { summary, rows, ...more },
  ...rest,
})

const steps: WireStep[] = [
  step(
    'received',
    'trigger',
    'intake',
    0,
    0,
    'RFP received',
    'A buyer sent a request for proposal.',
    {
      rows: [
        ['Buyer', 'Meridian Health'],
        ['Due', 'Fri 16 Oct'],
      ],
    },
  ),
  step(
    'read',
    'agent',
    'intake',
    0,
    1,
    'Read the RFP',
    'Reads the request and pulls out what it asks for.',
  ),
  step('fit', 'agent', 'qualify', 1, 0, 'Score fit', 'Decides whether this is worth answering.', {
    content: {
      facts: [
        ['Fit', 'Strong'],
        ['Risks', 'Hosting region'],
      ],
    },
  }),
  step(
    'split',
    'agent',
    'questions',
    2,
    0,
    'Split into questions',
    'Breaks the request into questions that can be answered one at a time.',
    {
      content: { progress: { done: 0, total: 6, label: '0 of 6 question groups' } },
    },
  ),
  step(
    'search',
    'tool',
    'library',
    3,
    0,
    'answers.search',
    'Looks for past answers to the same questions.',
    {
      content: {
        facts: [
          ['Request', 'POST /answers/search'],
          ['Result', 'Queued'],
        ],
      },
    },
  ),
  step(
    'answers',
    'agent',
    'draft',
    4,
    0,
    'Draft answers',
    'Drafts an answer to every question, reusing past ones where they fit.',
    {
      content: {
        progress: { done: 0, total: 6, label: '0 of 6 question groups' },
        tools: ['answers.search', 'docs.read'],
      },
    },
  ),
  step(
    'questionnaire',
    'agent',
    'security',
    5,
    0,
    'Fill security questionnaire',
    'Completes the buyer’s security questionnaire from the controls library.',
    {
      content: {
        progress: { done: 0, total: 5, label: '0 of 5 sections' },
        tools: ['answers.search'],
      },
    },
  ),
  step(
    'vendor',
    'flow',
    'security',
    5,
    1,
    'Vendor risk review',
    'Runs the vendor risk review workflow on the buyer and waits for it to finish.',
    {
      content: { progress: { done: 0, total: 9, label: '0 of 9 stages' } },
    },
  ),
  step(
    'price',
    'agent',
    'pricing',
    6,
    0,
    'Build price table',
    'Builds the price table from the standard price book.',
    {
      content: {
        facts: [
          ['Output', 'Queued'],
          ['Basis', 'Standard price book'],
        ],
        tools: ['cpq.quote', 'billing.usage'],
      },
    },
  ),
  step('quote', 'tool', 'pricing', 6, 1, 'cpq.quote', 'Creates the quote in the pricing system.', {
    content: {
      facts: [
        ['Request', 'POST /quotes'],
        ['Result', 'Queued'],
      ],
    },
  }),
  step(
    'margin',
    'agent',
    'pricing',
    6,
    2,
    'Check margin',
    'Checks the quote against the margin floor.',
    {
      content: { facts: [['Finding', 'Queued']] },
    },
  ),
  step(
    'size',
    'decision',
    'review',
    7,
    0,
    'Deal size',
    'Routes the response by how large the deal is.',
    {
      content: {
        branches: [
          { when: 'Over $250k', to: 'Review response' },
          { when: 'Over $1M', to: 'Legal sign-off' },
          { when: 'Otherwise', to: 'Skip review' },
        ],
      },
    },
  ),
  step(
    'review',
    'human',
    'review',
    8,
    0,
    'Review response',
    'Review what the agents prepared. Nothing after this step runs until you decide.',
    {
      initials: 'KA',
      assignee: 'Kofi A.',
      rows: [
        ['Routed by', 'Deal size'],
        ['If approved', 'Assemble document'],
      ],
      content: { note: 'Agent recommends submitting at standard pricing.' },
      meta: 'Routed by Deal size',
      // What the inspector and the full-page view lay out for a decision: the
      // same four blocks the loan review's approval has.
      more: {
        due: 'Tomorrow 5:00 PM · 1 day left',
        recommendation: {
          from: 'Check margin',
          verdict: 'Submit at standard pricing',
          figures: [
            ['Deal', '$412,000'],
            ['Term', '3 years'],
            ['Margin', 'Above floor'],
          ],
        },
        exception: {
          label: 'Open risk',
          text: 'The buyer asks for hosting in a region we do not serve yet.',
          mitigant: 'Answered in the draft: available from Q2, with a contractual commitment.',
        },
        trace: [
          ['0:00', 'RFP received', ''],
          ['0:00', 'Read the RFP', '4s'],
          ['0:04', 'Score fit', '2s'],
          ['0:06', 'Split into questions', '3s'],
          ['0:09', 'answers.search', '1.2s'],
          ['0:10', 'Draft answers', '9s'],
          ['0:19', 'Fill security questionnaire', '5s'],
          ['0:19', 'Vendor risk review', '7s'],
          ['0:26', 'Build price table', '4s'],
          ['0:26', 'cpq.quote · retried once', '1.5s'],
          ['0:26', 'Check margin', '2.5s'],
          ['0:30', 'Deal size · over $250k', ''],
        ],
      },
    },
  ),
  step(
    'legal',
    'human',
    'review',
    8,
    1,
    'Legal sign-off',
    'A second approval that only runs on the largest deals.',
    {
      rows: [['Runs when', 'The deal is over $1M']],
      meta: 'Only if the deal is over $1M',
    },
  ),
  step(
    'assemble',
    'agent',
    'assemble',
    9,
    0,
    'Assemble document',
    'Puts the answers, the price table and the security pack into one document.',
    {
      content: {
        progress: { done: 0, total: 4, label: '0 of 4 sections' },
        tools: ['docs.merge'],
      },
      meta: 'Starts after your approval',
    },
  ),
  step('pdf', 'tool', 'assemble', 10, 0, 'pdf.render', 'Renders the assembled document to PDF.', {
    meta: 'Renders the document',
  }),
  step(
    'submit',
    'tool',
    'submit',
    11,
    0,
    'portal.submit',
    'Uploads the response to the buyer’s portal.',
  ),
]

/** What each step reads and produces. Output values appear as each step finishes. */
const IO: Record<string, StepIO> = {
  received: io(
    'rfp_document:file<run; buyer:text<run; due_date:date<run',
    'rfp_document:file=Meridian_RFP_2026.pdf; buyer:text=Meridian Health; due_date:date=Fri 16 Oct',
  ),
  read: io('rfp_document:file<received', 'requirements:list=142 questions; scope:text=64 pages'),
  fit: io(
    'requirements:list<read; scope:text<read',
    'fit_score:choice=Strong; risks:list=Hosting region',
  ),
  split: io('requirements:list<read', 'questions:list=142 in 6 groups'),
  search: io('questions:list<split', 'matches:list=118 past answers'),
  answers: io('questions:list<split; matches:list<search', 'answers:list=142 drafts'),
  questionnaire: io(
    'rfp_document:file<received; matches:list<search',
    'security_pack:file=Security pack, 5 sections',
  ),
  vendor: io('buyer:text<received', 'risk_tier:choice=Low; findings:list=2 findings'),
  price: io(
    'scope:text<read; deal_estimate:money<run',
    'price_table:object=3-year table; quote_total:money=$412,000',
  ),
  quote: io('scope:text<read; risk_tier:choice<vendor', 'quote_id:text=Q-88412'),
  margin: io('deal_estimate:money<run; risk_tier:choice<vendor', 'margin:choice=Above the floor'),
  size: io(
    'quote_total:money<price; quote_id:text<quote; margin:choice<margin',
    'route:choice=Review response',
  ),
  review: io(
    'answers:list<answers; security_pack:file<questionnaire; price_table:object<price; findings:list<vendor',
    'decision:choice=Approved',
  ),
  legal: io('price_table:object<price; contract_terms:file<run', 'decision:choice'),
  assemble: io(
    'answers:list<answers; price_table:object<price; security_pack:file<questionnaire',
    'response_doc:file=38 pages',
  ),
  pdf: io('response_doc:file<assemble', 'response_pdf:file=Meridian_Response.pdf'),
  submit: io('response_pdf:file<pdf', 'submission_receipt:object=Receipt MH-5521'),
}

const edges: WireEdge[] = (
  [
    ['received', 'read'],
    ['read', 'fit'],
    ['fit', 'split'],
    ['split', 'search'],
    ['search', 'answers'],
    ['answers', 'questionnaire'],
    ['answers', 'vendor'],
    ['questionnaire', 'price'],
    ['vendor', 'quote'],
    ['vendor', 'margin'],
    ['price', 'size'],
    ['quote', 'size'],
    ['margin', 'size'],
    ['size', 'review'],
    ['review', 'assemble'],
    ['assemble', 'pdf'],
    ['pdf', 'submit'],
  ] as [string, string][]
).map(([from, to]) => ({ from, to, rule: 'feeds' }))

// The road not taken: this deal is under $1M, so legal never opens.
edges.push(
  { from: 'size', to: 'legal', rule: 'never' },
  { from: 'legal', to: 'assemble', rule: 'never' },
)

const approved = (): ScriptStep[] => [
  { kind: 'stage', stageId: 'review', status: 'done', sub: 'Approved' },
  { kind: 'stage', stageId: 'assemble', status: 'current', sub: '2 steps running' },
  work('assemble', 6_000, '4 sections · 38 pages', {
    startLog: 'Assembling the response',
    content: { progress: { done: 4, total: 4, label: '4 of 4 sections' }, tools: ['docs.merge'] },
  }),
  work('pdf', 2_000, 'Rendered · 38 pages'),
  { kind: 'stage', stageId: 'assemble', status: 'done', sub: '2 steps · 0:08' },
  { kind: 'stage', stageId: 'submit', status: 'current', sub: 'Submitting' },
  work('submit', 1_500, 'Submitted to the buyer portal'),
  { kind: 'stage', stageId: 'submit', status: 'done', sub: '1 step · 0:02' },
]

const sentBack = (): ScriptStep[] => [
  {
    kind: 'skip',
    stepIds: ['assemble', 'pdf', 'submit'],
    log: 'Response held — the review did not approve it',
  },
  { kind: 'stage', stageId: 'review', status: 'done', sub: 'Not approved' },
]

export const rfpResponse: RunScript = {
  id: 'rfp-response',
  label: 'RFP response',
  blurb: 'Ten stages, and steps that show their own facts, branches and progress.',
  title: 'RFP response · Meridian Health',
  header: {
    primary: 'Meridian Health',
    secondary: 'Request for proposal · due Fri 16 Oct',
    tertiary: 'RFP-2207 · opened 09:14',
  },
  actor: { initials: 'KA', name: 'Kofi Adeyemi', role: 'Solutions lead' },
  stages: [
    { id: 'intake', name: 'Intake', sub: '2 steps', status: 'current' },
    { id: 'qualify', name: 'Qualify', sub: '1 step', status: 'upcoming' },
    { id: 'questions', name: 'Questions', sub: '1 step', status: 'upcoming' },
    { id: 'library', name: 'Library', sub: '1 step', status: 'upcoming' },
    { id: 'draft', name: 'Draft', sub: '1 step', status: 'upcoming' },
    { id: 'security', name: 'Security', sub: '2 steps', status: 'upcoming' },
    { id: 'pricing', name: 'Pricing', sub: '3 steps', status: 'upcoming' },
    { id: 'review', name: 'Review', sub: 'Not reached', status: 'upcoming' },
    { id: 'assemble', name: 'Assemble', sub: '2 steps', status: 'upcoming' },
    { id: 'submit', name: 'Submit', sub: '1 step', status: 'upcoming' },
  ],
  steps: steps.map((s) => ({ ...s, io: IO[s.id] })),
  edges,
  inputs: [
    {
      name: 'rfp_document',
      type: 'file',
      required: true,
      description: 'The RFP as the buyer sent it.',
    },
    { name: 'buyer', type: 'text', required: true, description: 'Who the response is for.' },
    {
      name: 'due_date',
      type: 'date',
      required: true,
      description: 'When the buyer needs the response.',
    },
    {
      name: 'deal_estimate',
      type: 'money',
      required: false,
      description: 'A rough deal size, so pricing can start before review.',
    },
    {
      name: 'contract_terms',
      type: 'file',
      required: false,
      description: 'Only needed for deals over $1M, for Legal sign-off.',
    },
    {
      name: 'reviewer',
      type: 'person',
      required: true,
      description: 'Who reviews the response before it is sent.',
      options: PEOPLE,
    },
  ],
  outputs: [
    {
      name: 'response_pdf',
      type: 'file',
      description: 'The response exactly as submitted.',
      goesTo: 'Buyer portal',
    },
    {
      name: 'submission_receipt',
      type: 'object',
      description: 'Proof of when it was sent.',
      goesTo: 'Run history',
    },
    {
      name: 'price_table',
      type: 'object',
      description: 'The prices that were quoted.',
      goesTo: 'CPQ',
    },
    {
      name: 'decision',
      type: 'choice',
      description: 'Approved, sent back or declined at review.',
      goesTo: 'Run history',
    },
  ],
  defaultInputs: {
    rfp_document: 'Meridian_RFP_2026.pdf',
    buyer: 'Meridian Health',
    due_date: '2026-10-16',
    deal_estimate: '$400,000',
    reviewer: 'Kofi Adeyemi',
  },
  initialStatuses: {
    ...Object.fromEntries(steps.map((s) => [s.id, 'queued' as const])),
    received: 'done',
    legal: 'skipped',
  },
  focusStepId: 'received',
  play: [
    { kind: 'log', level: 'info', text: 'RFP received from Meridian Health', stepId: 'received' },
    work('read', 4_000, '64 pages · 142 questions'),
    { kind: 'stage', stageId: 'intake', status: 'done', sub: '2 steps · 0:04' },
    work('fit', 2_000, 'Worth answering', {
      content: {
        facts: [
          ['Fit', 'Strong'],
          ['Risks', 'Hosting region'],
        ],
      },
    }),
    { kind: 'stage', stageId: 'qualify', status: 'done', sub: '1 step · 0:02' },
    work('split', 3_000, '142 questions in 6 groups', {
      content: { progress: { done: 6, total: 6, label: '6 of 6 question groups' } },
    }),
    { kind: 'stage', stageId: 'questions', status: 'done', sub: '1 step · 0:03' },
    work('search', 1_200, '118 past answers matched', {
      content: {
        facts: [
          ['Request', 'POST /answers/search'],
          ['Result', '118 matches'],
        ],
      },
    }),
    { kind: 'stage', stageId: 'library', status: 'done', sub: '1 step · 0:01' },
    work('answers', 9_000, '142 answers drafted', {
      content: {
        progress: { done: 6, total: 6, label: '6 of 6 question groups' },
        tools: ['answers.search', 'docs.read'],
      },
    }),
    { kind: 'stage', stageId: 'draft', status: 'done', sub: '1 step · 0:09' },
    {
      kind: 'parallel',
      steps: [
        work('questionnaire', 5_000, '5 sections complete', {
          content: {
            progress: { done: 5, total: 5, label: '5 of 5 sections' },
            tools: ['answers.search'],
          },
        }),
        work('vendor', 7_000, 'Review finished · low risk', {
          content: { progress: { done: 9, total: 9, label: '9 of 9 stages' } },
        }),
      ],
    },
    { kind: 'stage', stageId: 'security', status: 'done', sub: '2 steps · 0:07' },
    {
      kind: 'parallel',
      steps: [
        work('price', 4_000, '3-year table · standard pricing', {
          content: {
            facts: [
              ['Output', '3-year price table'],
              ['Basis', 'Standard price book'],
            ],
            tools: ['cpq.quote', 'billing.usage'],
          },
        }),
        work('quote', 1_500, 'Quote created · retried once', {
          content: {
            facts: [
              ['Request', 'POST /quotes'],
              ['Result', '201 Created'],
            ],
          },
        }),
        work('margin', 2_500, 'Above the margin floor', {
          content: { facts: [['Finding', 'Above the floor']] },
        }),
      ],
    },
    { kind: 'stage', stageId: 'pricing', status: 'done', sub: '3 steps · 0:04' },
    { kind: 'stage', stageId: 'review', status: 'current', sub: 'Waiting on Kofi A.' },
    work('size', 500, 'Over $250k · routed to review', {
      content: {
        branches: [
          { when: 'Over $250k', to: 'Review response', taken: true },
          { when: 'Over $1M', to: 'Legal sign-off' },
          { when: 'Otherwise', to: 'Skip review' },
        ],
      },
    }),
    {
      kind: 'gate',
      stepId: 'review',
      decisions: ['approved', 'changes', 'declined'],
      dueLabel: '1 day',
      branches: { approved: approved(), changes: sentBack(), declined: sentBack() },
    },
  ],
}
