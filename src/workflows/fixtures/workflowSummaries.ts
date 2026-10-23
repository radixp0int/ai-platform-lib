// Ten workflows and where each one's live run stands — the first page of what a
// list endpoint would return.
//
// Written as one line of prose per workflow rather than as nested objects: a
// stage is `Name: steps`, steps in the same column are separated by commas, and
// ` / ` starts the next column of the same stage. Each step is a kind letter and
// a title; a `-` after the letter marks a step this run skips.
//
//   a agent · t system call · h approval · d decision · r trigger · f sub-workflow
//
// Statuses are not authored. They follow from which stage the run is on, so a
// summary cannot disagree with itself.
import type { BlueprintStage } from '../components/flow-blueprint'
import type { RecentRun } from '../components/recent-runs'
import type { StepStatus } from '../components/types'
import type { WorkflowNeed, WorkflowState, WorkflowSummary } from '../recipes/workflows-table/types'

type Spec = {
  id: string
  name: string
  run: string
  startedBy: string
  state: WorkflowState
  /** Index of the stage the run is on. Ignored when idle. */
  at: number
  /** Who each open approval is waiting on: initials, name, when it is due. */
  people?: [string, string, string][]
  flow: string
}

const SPECS: Spec[] = [
  {
    id: 'loan-review',
    name: 'Commercial loan review',
    run: 'Harbor Street Bakery · $450,000',
    startedBy: 'Dana Whitfield',
    state: 'waiting',
    at: 3,
    people: [['DW', 'Dana Whitfield', 'in 3h 40m']],
    flow: 'Intake: r Application received, a Intake agent | Gather: t credit_bureau.pull, a Spread financials, t kyc.verify | Analyze: a Risk scoring, a Draft credit memo | Approve: d Policy check / h Approve credit memo, h- Senior officer review | Decide: a Draft decision letter, t portal.notify',
  },
  {
    id: 'rfp-response',
    name: 'RFP response',
    run: 'Meridian Health',
    startedBy: 'Kofi Adeyemi',
    state: 'waiting',
    at: 7,
    people: [['KA', 'Kofi A.', 'tomorrow']],
    flow: 'Intake: r RFP received, a Read the RFP | Qualify: a Score fit | Questions: a Split into questions | Library: t answers.search | Draft: a Draft answers | Security: a Fill security questionnaire, f Vendor risk review | Pricing: a Build price table, t cpq.quote, a Check margin | Review: d Deal size / h Review response, h- Legal sign-off | Assemble: a Assemble document / t pdf.render | Submit: t portal.submit',
  },
  {
    id: 'onboarding',
    name: 'Employee onboarding',
    run: 'New hire · Priya Raman',
    startedBy: 'Rachel Okafor',
    state: 'waiting',
    at: 5,
    people: [
      ['RO', 'R. Okafor', 'today'],
      ['NT', 'Nia T.', 'today'],
    ],
    flow: 'Offer: r Offer signed, a Create HRIS record | Accounts: t okta.create_user, t gsuite.provision, t slack.invite | Equipment: t laptop.order, t facilities.badge | Payroll: a Enrol in payroll, t benefits.enrol | Checks: t checkr.run, a Summarise check | Approvals: d Access tier / h Approve elevated access, h Confirm background check | Welcome: a Build welcome pack, t calendar.schedule | Day one: t slack.dm, a First-week plan',
  },
  {
    id: 'incident-triage',
    name: 'Incident triage',
    run: 'SEV-2 · checkout p99 latency',
    startedBy: 'Sam Raines',
    state: 'running',
    at: 3,
    flow: 'Detect: r Latency SLO burn, t pagerduty.page | Triage: t datadog.query, t loki.search, t deploys.recent | Correlate: a Correlate signals, t synthetic.probe | Diagnose: a Trace analysis, a Blast radius | Decide: d Rollback or fix / h Approve rollback | Mitigate: t deploy.rollback | Verify: t synthetic.verify, a Watch error budget | Communicate: a Draft status update, t statuspage.post | Review: a Draft postmortem',
  },
  {
    id: 'month-end-close',
    name: 'Month-end close',
    run: 'September close',
    startedBy: 'Lena Fischer',
    state: 'running',
    at: 2,
    flow: 'Start: r Period end | Bank: t bank.statements, a Reconcile accounts | Subledgers: t subledger.export, a Tie out AR and AP | Intercompany: a Match intercompany | Accruals: a Propose accruals | Variances: a Explain variances | Approve: d Materiality / h Approve journals | Post: t erp.post_journals | Report: a Draft close memo, t bi.refresh | Lock: t erp.lock_period',
  },
  {
    id: 'vendor-risk',
    name: 'Vendor risk review',
    run: 'Kestrel Analytics · renewal',
    startedBy: 'Owen Blake',
    state: 'waiting',
    at: 6,
    people: [['OB', 'Owen B.', 'in 2 days']],
    flow: 'Request: r Review requested | Screen: t sanctions.screen, t adverse_media.search | Collect: t docs.collect, a Chase missing docs | Security: a Read security docs, a Map controls | Privacy: a Review data flows | Score: a Score vendor risk, a Draft findings | Sign-off: d Risk tier / h Sign off on vendor | Record: t grc.record | Notify: t slack.notify',
  },
  {
    id: 'invoice-processing',
    name: 'Invoice processing',
    run: 'INV-20418 · Northwind Supply',
    startedBy: 'Mei Tanaka',
    state: 'running',
    at: 4,
    flow: 'Receive: r Invoice received, a Classify document | Extract: a Extract line items | Vendor: t erp.vendor_lookup, t tax.validate | Match: a Three-way match | Exceptions: a Explain variances, t erp.po_history | Approve: d Variance check / h Approve payment | Pay: t erp.post_payment | Remit: t email.remit, t ledger.record',
  },
  {
    id: 'support-escalation',
    name: 'Support escalation',
    run: 'Case 88231 · failed payout',
    startedBy: 'Tomás Rivera',
    state: 'waiting',
    at: 5,
    people: [['TR', 'Tomás R.', 'in 45m']],
    flow: 'Intake: r Case escalated, a Summarise case | Customer: t crm.lookup, t payments.lookup | Logs: t logs.search | Diagnose: a Find root cause | Draft: a Draft reply, a Size the refund | Decide: d Refund needed / h Approve refund | Resolve: t payments.refund, t desk.reply | Follow up: a Schedule check-in',
  },
  {
    id: 'cash-forecast',
    name: 'Cash forecast',
    run: 'Daily forecast · 9 Oct',
    startedBy: 'Schedule',
    state: 'running',
    at: 5,
    flow: 'Start: r Daily 6:00 AM | Balances: t bank.balances | Receivables: t ar.aging, a Predict collections | Payables: t ap.schedule | Payroll: t payroll.calendar | Model: a Build 13-week forecast | Stress: a Run scenarios | Review: d Variance to plan / h Review forecast | Publish: t bi.publish, t slack.notify',
  },
  {
    id: 'kyc-refresh',
    name: 'KYC refresh',
    run: '',
    startedBy: 'Schedule',
    state: 'idle',
    at: -1,
    flow: 'Select: r Monthly schedule, a Select due clients | Identity: t kyc.verify | Registry: t registry.lookup | Owners: a Map beneficial owners | Screen: t sanctions.screen, t pep.screen | Compare: a Summarise changes | Review: d Any change / h Review changed files | Update: t core.update | Archive: t docs.archive',
  },
]

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-')

function summarise(spec: Spec): WorkflowSummary {
  const { id, state, at } = spec
  const idle = state === 'idle'
  const waiting = state === 'waiting'
  const needs: WorkflowNeed[] = []
  const running: string[] = []
  let agents = 0
  let tools = 0
  let asked = 0

  const stages: BlueprintStage[] = spec.flow.split(' | ').map((chunk, s) => {
    const [name, body] = chunk.split(': ')
    const columns = body.split(' / ').map((column, c) =>
      column.split(', ').map((token) => {
        const skipped = token[1] === '-'
        const kind = token[0]
        const title = token.slice(skipped ? 3 : 2)
        if (kind === 'a') agents += 1
        if (kind === 't') tools += 1

        let status: StepStatus = 'queued'
        if (skipped) status = 'skipped'
        else if (!idle && s < at) status = 'done'
        else if (!idle && s === at) {
          if (!waiting) status = c === 0 ? 'running' : 'queued'
          // A run stopped at a gate has done everything in the stage but the
          // approvals themselves.
          else if (kind !== 'h') status = 'done'
          else {
            const [initials, who, due] = spec.people?.[asked] ?? ['', 'Someone', 'soon']
            asked += 1
            status = 'waiting'
            needs.push({ initials, title, who, due })
          }
        }
        if (status === 'running') running.push(title)
        return { id: `${id}-${slug(name)}-${slug(title)}`, status }
      }),
    )
    return {
      id: slug(name),
      name,
      columns,
      status: idle ? 'upcoming' : s < at ? 'done' : s === at ? 'current' : 'upcoming',
    }
  })

  const now = waiting
    ? needs.length > 1
      ? { title: `${needs.length} approvals open`, sub: needs.map((n) => n.who).join(' and ') }
      : { title: needs[0].title, sub: `${needs[0].who} · due ${needs[0].due}` }
    : idle
      ? { title: 'No live run', sub: 'Starts on its trigger' }
      : {
          title: running.length > 1 ? `${running.length} steps running` : running[0],
          sub: 'No one needed yet',
        }

  return {
    id,
    name: spec.name,
    run: spec.run,
    state,
    startedBy: spec.startedBy,
    stages,
    agents,
    tools,
    now,
    needs,
  }
}

export const WORKFLOW_SUMMARIES: WorkflowSummary[] = SPECS.map(summarise)

/** The same workflows as the run outline's Recent tab wants them. */
export const RECENT_RUNS: RecentRun[] = WORKFLOW_SUMMARIES.map((workflow) => ({
  id: workflow.id,
  title: workflow.name,
  sub: workflow.run || 'No live run',
  state: workflow.state,
  trailing:
    workflow.state === 'waiting'
      ? workflow.needs[0]?.due.replace(/^in /, '')
      : workflow.state === 'running'
        ? workflow.stages.find((stage) => stage.status === 'current')?.name
        : undefined,
}))
