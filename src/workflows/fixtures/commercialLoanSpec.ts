// The commercial loan review as a workflow: how it is built, what each stage is
// for, who decides, and how its runs have gone. The definition behind the
// scripted run in `loanRun`, and the page the table's "Workflow details" opens.
//
// Step ids, stage ids and each step's typed inputs and outputs are the run's own,
// so the shape drawn here, the run on the canvas, and the trace agree.
import type { WorkflowSpec, WorkflowStageSpec, WorkflowStepSpec } from '../components/workflow-spec'
import { RUN_INPUT_SPECS, RUN_OUTPUT_SPECS, STEP_IO } from './loanRun'

const step = (
  spec: Omit<WorkflowStepSpec, 'io'> & { id: keyof typeof STEP_IO },
): WorkflowStepSpec => ({ ...spec, io: STEP_IO[spec.id] })

const STAGES: WorkflowStageSpec[] = [
  {
    id: 'intake',
    name: 'Intake',
    typicalTime: '0:48',
    purpose: 'Takes the application in and reads every document attached to it.',
    columns: [
      [
        step({
          id: 'trigger',
          kind: 'trigger',
          title: 'Application received',
          does: 'Starts a run when the loan portal posts a completed application.',
          reads: 'The loan portal',
          handsOn: 'The application and 6 documents',
          facts: [['Ignores', 'Drafts the applicant has not submitted']],
        }),
        step({
          id: 'intake',
          kind: 'agent',
          title: 'Intake agent',
          does: 'Classifies the application and extracts the fields the rest of the run needs.',
          reads: 'The application documents',
          handsOn: 'Extracted fields: amount, term, owners, collateral',
          facts: [['Can call', 'docs.read']],
        }),
      ],
    ],
  },
  {
    id: 'gather',
    name: 'Gather',
    typicalTime: '1:12',
    purpose:
      'Collects what the bank needs to know about the borrower, from outside and from their own numbers.',
    columns: [
      [
        step({
          id: 'bureau',
          kind: 'tool',
          title: 'credit_bureau.pull',
          does: 'Pulls the business credit file.',
          reads: 'The business’s legal name and tax ID',
          handsOn: 'A credit score and any derogatories',
          facts: [
            ['System', 'Credit bureau'],
            ['If it fails', 'Retries twice, then waits for the analyst'],
          ],
        }),
        step({
          id: 'spread',
          kind: 'agent',
          title: 'Spread financials',
          does: 'Spreads three years of tax returns into the bank’s standard template.',
          reads: 'Tax returns and statements',
          handsOn: 'A spread with DSCR and revenue trend',
          facts: [['Can call', 'docs.read']],
        }),
        step({
          id: 'kyc',
          kind: 'tool',
          title: 'kyc.verify',
          does: 'Verifies the identity of every listed beneficial owner.',
          reads: 'The owners’ details',
          handsOn: 'Verified or not, per owner',
          facts: [['System', 'KYC provider']],
        }),
      ],
    ],
  },
  {
    id: 'analyze',
    name: 'Analyze',
    typicalTime: '2:05',
    purpose: 'Turns the evidence into a grade and a recommendation.',
    columns: [
      [
        step({
          id: 'risk',
          kind: 'agent',
          title: 'Risk scoring',
          does: 'Scores the borrower against the commercial risk model.',
          reads: 'The credit file and the spread',
          handsOn: 'A risk grade out of 10',
          facts: [['Model', 'CRM v3.2']],
        }),
        step({
          id: 'memo',
          kind: 'agent',
          title: 'Draft credit memo',
          does: 'Writes the credit memo and a recommendation for the analyst.',
          reads: 'Everything gathered so far',
          handsOn: 'A memo and a recommendation',
          facts: [['Can call', 'docs.read, docs.merge']],
        }),
      ],
    ],
  },
  {
    id: 'approve',
    name: 'Approve',
    typicalTime: '2h 50m',
    purpose:
      'A credit analyst reads the memo and decides. Larger loans also need a senior officer.',
    columns: [
      [
        step({
          id: 'policy',
          kind: 'decision',
          title: 'Policy check',
          does: 'Routes the run by loan size and any policy exceptions.',
          reads: 'The memo and the loan amount',
          handsOn: 'Which approvals run',
          facts: [
            ['Under $500k', 'Credit analyst'],
            ['$500k and over', 'Senior officer as well'],
          ],
        }),
      ],
      [
        step({
          id: 'approve',
          kind: 'human',
          title: 'Approve credit memo',
          note: 'analyst',
          does: 'The analyst reviews the memo and any policy exception, then approves, asks for changes or declines.',
          reads: 'The memo, the grade, the exception',
          handsOn: 'Approve, request changes or decline',
          facts: [
            ['Who', 'Dana Whitfield, credit analyst'],
            ['Answer within', '4 hours'],
            ['Request changes', 'Sends it back to Draft credit memo'],
          ],
        }),
        step({
          id: 'senior',
          kind: 'human',
          title: 'Senior officer review',
          note: '$500k+',
          sometimes: true,
          does: 'A second approval on larger loans.',
          reads: 'The approved memo',
          handsOn: 'Approve or decline',
          facts: [
            ['Who', 'Any senior credit officer'],
            ['Only when', 'The loan is $500,000 or more'],
          ],
        }),
      ],
    ],
  },
  {
    id: 'decide',
    name: 'Decide & notify',
    typicalTime: '0:40',
    purpose: 'Writes the decision and tells the applicant.',
    columns: [
      [
        step({
          id: 'letter',
          kind: 'agent',
          title: 'Draft decision letter',
          does: 'Prepares the approval letter with the analyst’s conditions.',
          reads: 'The decision and its conditions',
          handsOn: 'A decision letter',
        }),
        step({
          id: 'notify',
          kind: 'tool',
          title: 'portal.notify',
          does: 'Sends the decision letter to the applicant through the portal.',
          reads: 'The decision letter',
          handsOn: 'A delivery receipt',
          facts: [['System', 'Loan portal']],
        }),
      ],
    ],
  },
]

export const COMMERCIAL_LOAN_SPEC: WorkflowSpec = {
  id: 'loan-review',
  name: 'Commercial loan review',
  description:
    'Reviews a commercial loan application. Agents read the documents, pull credit, spread the financials and draft a credit memo; a credit analyst approves it before the decision letter goes out.',
  owner: 'Dana Whitfield',
  startsWhen: 'a completed application is posted from the loan portal',
  version: 'v12 · edited 26 Sep by Dana W.',
  nextVersion: 'v13',
  liveRun: {
    state: 'waiting',
    title: 'Live run · Harbor Street Bakery · $450,000',
    sub: 'Stage 4 of 5, Approve · waiting on Dana W., due in 3h 40m',
  },
  stages: STAGES,
  inputs: RUN_INPUT_SPECS,
  outputs: RUN_OUTPUT_SPECS,
  approvers: [
    {
      initials: 'DW',
      step: 'Approve credit memo',
      who: 'Dana Whitfield, credit analyst',
      when: 'Every loan · answer within 4 hours',
    },
    {
      step: 'Senior officer review',
      who: 'Any senior credit officer',
      when: 'Only loans of $500,000 or more',
    },
  ],
  systems: ['credit_bureau.pull', 'kyc.verify', 'docs.read', 'docs.merge', 'portal.notify'],
  stats: [
    ['Runs', '31'],
    ['Approved', '24'],
    ['Typical run', '3h 05m'],
    ['Approvals on time', '29 of 31'],
  ],
  statsNote: 'The approval is most of the time. Everything before it takes under five minutes.',
  timeNote: 'Typical time, last 31 runs',
  runs: [
    {
      id: 'harbor-street',
      name: 'Harbor Street Bakery · $450,000',
      startedBy: 'Dana Whitfield',
      result: 'Waiting on Dana W.',
      state: 'waiting',
      stagesDone: 3,
      progress: 'Stage 4 of 5 · Approve',
      started: 'Today 09:02',
    },
    {
      id: 'ridgeline-dental',
      name: 'Ridgeline Dental · $220,000',
      startedBy: 'Dana Whitfield',
      result: 'Approved',
      state: 'done',
      stagesDone: 5,
      progress: 'All 5 stages',
      started: '17 Oct',
      took: '2h 12m',
    },
    {
      id: 'copperleaf-farms',
      name: 'Copperleaf Farms · $780,000',
      startedBy: 'Marcus Lee',
      result: 'Approved',
      state: 'done',
      stagesDone: 5,
      progress: 'All 5 stages',
      started: '15 Oct',
      took: '1d 4h',
    },
    {
      id: 'lantern-print',
      name: 'Lantern Print Co · $95,000',
      startedBy: 'Dana Whitfield',
      result: 'Declined',
      state: 'stopped',
      stagesDone: 3,
      progress: 'Stopped at stage 4 · Approve',
      started: '13 Oct',
      took: '3h 40m',
    },
  ],
  runsTotal: 31,
  versions: [
    {
      id: 'v12',
      change: 'Senior officer review only from $500,000',
      meta: '26 Sep · Dana Whitfield · 14 runs',
      current: true,
    },
    {
      id: 'v11',
      change: 'Spreads three years of returns, not two',
      meta: '3 Sep · Marcus Lee · 17 runs',
    },
    { id: 'v10', change: 'KYC runs alongside the credit pull', meta: '12 Aug · Dana Whitfield' },
  ],
  draftNote:
    'Nothing changes until you publish it. The live run for Harbor Street Bakery finishes on v12; runs that start after publishing use the new version.',
}
