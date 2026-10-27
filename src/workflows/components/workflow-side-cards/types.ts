import type { WorkflowApprover } from '../workflow-spec'

export type WorkflowApproversProps = {
  approvers: WorkflowApprover[]
  className?: string
}

export type WorkflowSystemsProps = {
  /** The systems the workflow reaches, as they are named in its steps. */
  systems: string[]
  className?: string
}

export type WorkflowStatsProps = {
  /** Label and value pairs, drawn two to a row. */
  stats: [label: string, value: string][]
  /** One line on what the numbers say. */
  note?: string
  /** The heading. Defaults to "Last 30 days". */
  heading?: string
  className?: string
}
