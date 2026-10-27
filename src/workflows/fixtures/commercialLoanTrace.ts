// The commercial loan review run for Harbor Street Bakery, twenty-three minutes
// in: the agents have drafted the credit memo and the run is waiting for Dana
// Whitfield, the credit analyst, to approve it. The same run as `loanRun`, read
// as a trace: step and stage ids, and the timeline in `APPROVAL_TRACE`, are its
// own, and the typed inputs and outputs agree with `STEP_IO`.
//
// What it exercises that a clean run would not:
//
//  1. Work in parallel: the credit pull, the spread and the identity check all
//     begin together once the intake agent is done.
//  2. A step skipped on purpose: the senior officer review only runs from
//     $500,000, and this loan is $450,000.
//  3. Minutes of waiting on a person after seconds of machine work, which is what
//     a duration that reads in `19m 32s` rather than tenths is for.
//
// `COMMERCIAL_LOAN_TRACE_BUREAU_FAILED` is the same run in which the credit
// pull timed out and the run waited for the analyst, for the stories that show a
// failure the run carried on past.
import type { RunTrace, TraceStep } from '../components/run-trace'

const MODEL = 'claude-sonnet-5-5'

export const COMMERCIAL_LOAN_TRACE: RunTrace = {
  id: 'harbor-street',
  workflow: 'Commercial loan review',
  title: 'Harbor Street Bakery · $450,000',
  state: 'waiting',
  startedBy: 'Dana Whitfield',
  startedLabel: '9:02 AM',
  elapsed: 1380,
  stages: [
    { id: 'intake', name: 'Intake' },
    { id: 'gather', name: 'Gather' },
    { id: 'analyze', name: 'Analyze' },
    { id: 'approve', name: 'Approve' },
    { id: 'decide', name: 'Decide & notify' },
  ],
  steps: [
    {
      id: 'trigger',
      stageId: 'intake',
      kind: 'trigger',
      title: 'Application received',
      status: 'done',
      startedAt: 0,
      duration: 0.4,
      summary: 'A $450,000 application from Harbor Street Bakery LLC, with 6 documents.',
      description: 'Starts a run when the loan portal posts a completed application.',
      input: 'portal: loan portal\nsubmission: application posted',
      output: 'application = 6 documents\napplicant = Harbor Street Bakery LLC\namount = $450,000',
    },
    {
      id: 'intake',
      stageId: 'intake',
      kind: 'agent',
      title: 'Intake agent',
      status: 'done',
      startedAt: 4,
      duration: 44,
      summary: '14 fields extracted, and 2 owners to verify.',
      description: 'Classifies the application and extracts the fields the rest of the run needs.',
      input: 'application: 6 documents',
      output: 'fields = 14 fields\nowners = 2 owners',
      reasoning:
        'The six documents are the application form, two years of bank statements, three years of tax returns, the articles of organization, an equipment list and the lease. Two owners are listed at 50% each, so both need an identity check. Collateral is the bakery’s equipment and an assignment of the lease.',
      usage: { model: MODEL, inputTokens: 14800, outputTokens: 2100 },
      calls: [
        { id: 'c1', kind: 'model', label: 'Classify the application', startedAt: 0, duration: 9.4 },
        { id: 'c2', kind: 'tool', label: 'docs.read', startedAt: 9.4, duration: 13.6 },
        { id: 'c3', kind: 'model', label: 'Extract the fields', startedAt: 23, duration: 21 },
      ],
    },
    {
      id: 'bureau',
      stageId: 'gather',
      kind: 'tool',
      mono: true,
      title: 'credit_bureau.pull',
      status: 'done',
      startedAt: 48,
      duration: 0.8,
      summary: 'A credit score of 742 and no derogatories.',
      description: 'Pulls the business credit file.',
      input: 'fields from Intake agent\nlegal_name: Harbor Street Bakery LLC',
      output: 'credit_score = 742\nderogatories = None',
    },
    {
      id: 'spread',
      stageId: 'gather',
      kind: 'agent',
      title: 'Spread financials',
      status: 'done',
      startedAt: 48,
      duration: 72,
      summary: 'Three years spread, with a DSCR of 1.38×.',
      description: 'Spreads three years of tax returns into the bank’s standard template.',
      input: 'application: tax returns and statements, 3 years',
      output: 'spread = 3 years\ndscr = 1.38×',
      reasoning:
        'Three years of returns are enough to see a trend: revenue is up steadily and margins hold. The debt service coverage ratio comes out at 1.38×, above the bank’s 1.25× floor. One year’s depreciation add-back looked high, so I marked it in the spread for the analyst.',
      usage: { model: MODEL, inputTokens: 21500, outputTokens: 4800 },
      calls: [
        { id: 'c1', kind: 'tool', label: 'docs.read', startedAt: 0, duration: 18.5 },
        { id: 'c2', kind: 'model', label: 'Spread three years', startedAt: 18.5, duration: 43.6 },
        {
          id: 'c3',
          kind: 'model',
          label: 'Compute DSCR and trend',
          startedAt: 62.1,
          duration: 9.9,
        },
      ],
    },
    {
      id: 'kyc',
      stageId: 'gather',
      kind: 'tool',
      mono: true,
      title: 'kyc.verify',
      status: 'done',
      startedAt: 49,
      duration: 2.1,
      summary: 'Both owners verified.',
      description: 'Verifies the identity of every listed beneficial owner.',
      input: 'owners from Intake agent: 2',
      output: 'verified = 2 of 2 owners',
    },
    {
      id: 'risk',
      stageId: 'analyze',
      kind: 'agent',
      title: 'Risk scoring',
      status: 'done',
      startedAt: 120,
      duration: 38,
      summary: 'Graded 4 of 10 on the commercial risk model.',
      description: 'Scores the borrower against the commercial risk model.',
      input: 'credit_score: 742\nspread: 3 years\nmodel: CRM v3.2',
      output: 'risk_grade = 4 of 10',
      reasoning:
        'A 742 business credit score and a clean file offset a thin cash cushion in the first of the three years. The model grades the borrower 4 of 10, which is inside the acceptable band for a loan of this size.',
      usage: { model: MODEL, inputTokens: 9200, outputTokens: 1100 },
      calls: [
        { id: 'c1', kind: 'model', label: 'Score against CRM v3.2', startedAt: 0, duration: 38 },
      ],
    },
    {
      id: 'memo',
      stageId: 'analyze',
      kind: 'agent',
      title: 'Draft credit memo',
      status: 'done',
      startedAt: 120,
      duration: 87,
      summary: 'A 7-page memo recommending approval with conditions.',
      description: 'Writes the credit memo and a recommendation for the analyst.',
      input: 'spread: 3 years\ndscr: 1.38×\nverified: 2 of 2 owners',
      output: 'credit_memo = 7 pages\nrecommendation = Approve with conditions',
      reasoning:
        'The numbers support the loan: a DSCR of 1.38×, a clean credit file and both owners verified. One guarantor scores 672 against a policy minimum of 680. Twenty-four months of cash reserves mitigate that, so I recommend approval with conditions, including a personal guarantee from both owners.',
      usage: { model: MODEL, inputTokens: 31000, outputTokens: 6400 },
      calls: [
        { id: 'c1', kind: 'model', label: 'Outline the memo', startedAt: 0, duration: 12.4 },
        { id: 'c2', kind: 'tool', label: 'docs.read', startedAt: 12.4, duration: 3.6 },
        { id: 'c3', kind: 'model', label: 'Write the memo', startedAt: 16, duration: 55.2 },
        { id: 'c4', kind: 'tool', label: 'docs.merge', startedAt: 71.2, duration: 2.8 },
        { id: 'c5', kind: 'model', label: 'Write the recommendation', startedAt: 74, duration: 13 },
      ],
    },
    {
      id: 'policy',
      stageId: 'approve',
      kind: 'decision',
      title: 'Policy check',
      status: 'done',
      startedAt: 207,
      duration: 0.6,
      summary: 'One policy exception, so it goes to the analyst.',
      description: 'Routes the run by loan size and any policy exceptions.',
      input: 'amount: $450,000\nrisk_grade: 4 of 10\ncredit_memo: 7 pages',
      output: 'route = Analyst approval\nexceptions = 1 exception',
    },
    {
      id: 'approve',
      stageId: 'approve',
      kind: 'human',
      title: 'Approve credit memo',
      status: 'waiting',
      startedAt: 207.6,
      duration: 1172.4,
      assignee: 'Dana Whitfield',
      summary: 'Waiting on Dana W., due in 3h 40m.',
      description:
        'The analyst reviews the memo and any policy exception, then approves, asks for changes or declines.',
      input:
        'asked: Dana Whitfield (credit analyst)\ncredit_memo: 7 pages, risk grade 4 of 10\nexception: guarantor credit score is 672, policy asks for 680\noptions: approve / request changes / decline',
      output: 'No decision yet.',
    },
    {
      id: 'senior',
      stageId: 'approve',
      kind: 'human',
      title: 'Senior officer review',
      status: 'skipped',
      summary: 'Skipped: $450,000 is under $500,000.',
      description: 'A second approval on larger loans.',
      input: 'amount: $450,000\nthreshold: $500,000',
      output: 'Not needed for this run.',
    },
    {
      id: 'letter',
      stageId: 'decide',
      kind: 'agent',
      title: 'Draft decision letter',
      status: 'queued',
      summary: 'Starts when the analyst decides.',
      description: 'Prepares the approval letter with the analyst’s conditions.',
      input: 'waiting on Approve credit memo',
      output: 'Not started.',
    },
    {
      id: 'notify',
      stageId: 'decide',
      kind: 'tool',
      mono: true,
      title: 'portal.notify',
      status: 'queued',
      summary: 'Starts when the letter is ready.',
      description: 'Sends the decision letter to the applicant through the portal.',
      input: 'waiting on Draft decision letter',
      output: 'Not started.',
    },
  ],
}

const failedBureau = (step: TraceStep): TraceStep =>
  step.id === 'bureau'
    ? {
        ...step,
        status: 'failed',
        duration: 30,
        summary: 'Timed out twice; the run waited for the analyst to go on.',
        output: 'No response from the credit bureau after 2 retries.',
        failure:
          'The credit bureau did not answer after two retries. The run waited for the analyst to continue, and the risk score used the file from the last pull.',
      }
    : step

/** The same run, with the credit pull timed out and the run carried on past it. */
export const COMMERCIAL_LOAN_TRACE_BUREAU_FAILED: RunTrace = {
  ...COMMERCIAL_LOAN_TRACE,
  steps: COMMERCIAL_LOAN_TRACE.steps.map(failedBureau),
}
