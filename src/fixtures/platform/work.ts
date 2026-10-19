// The workflow runs and approvals the platform pages show. They are the three
// runs the workflow demos already ship (workflow-demo/example and the
// workflow-ws-server variants), listed here so Home, Tasks and Runs agree.
//
// They belong to one tenant. Every other tenant has none, which is what the
// empty states are for — the same three approvals turning up in every bank
// would be the fixture showing through.
import type { Tenant } from './tenants'

export type Run = {
  id: string
  title: string
  /** The step the run is on. */
  step: string
  status: 'waiting' | 'running'
  startedBy: { name: string; role: string }
  /** Path below the tenant: where the run's canvas lives. */
  path: string
}

export type Task = {
  id: string
  /** What is being asked for — the approval step's own title. */
  title: string
  run: Run
  stage: string
}

const RUNS: Run[] = [
  {
    id: 'loan-review',
    title: 'Commercial loan review',
    step: 'Approve credit memo',
    status: 'waiting',
    startedBy: { name: 'Dana Whitfield', role: 'Credit analyst' },
    path: 'workflows/demo',
  },
  {
    id: 'new-hire',
    title: 'New hire · Priya Raman',
    step: 'Approve elevated access',
    status: 'waiting',
    startedBy: { name: 'Rachel Okafor', role: 'Hiring manager' },
    path: 'workflows/live',
  },
  {
    id: 'sev-2',
    title: 'SEV-2 · checkout p99 latency',
    step: 'Detect',
    status: 'running',
    startedBy: { name: 'Sam Raines', role: 'On call, checkout' },
    path: 'workflows/live',
  },
]

const TASKS: Task[] = [
  { id: 'credit-memo', title: 'Approve credit memo', run: RUNS[0], stage: 'Approve' },
  { id: 'elevated-access', title: 'Approve elevated access', run: RUNS[1], stage: 'Compliance' },
]

const OWNER = 'alderfinch-treasury'

const owns = (tenant: Tenant) => tenant.id === OWNER && tenant.spaces.includes('workflows')

export const runsFor = (tenant: Tenant): Run[] => (owns(tenant) ? RUNS : [])

export const tasksFor = (tenant: Tenant): Task[] => (owns(tenant) ? TASKS : [])
