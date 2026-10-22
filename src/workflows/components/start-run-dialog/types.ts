import type { RunInputSpec } from '../../engine/wireProtocol'

/** A workflow the dialog can start: what it is called and what it asks for. */
export type StartableWorkflow = {
  id: string
  name: string
  inputs: RunInputSpec[]
  /** What the form starts filled in with. */
  defaults?: Record<string, string>
}

export type StartRunDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** More than one adds a picker above the form. */
  workflows: StartableWorkflow[]
  /** Which one the picker starts on. Defaults to the first. */
  workflowId?: string
  /** The start has been sent and not yet answered. */
  busy?: boolean
  /** Why the last start was refused, e.g. a server's `MISSING_INPUT`. */
  error?: string
  /** The run is under way: the dialog says so instead of showing the form. */
  started?: boolean
  onStart: (workflowId: string, values: Record<string, string>) => void
  /** Present to offer "Open live run" once started. */
  onOpenRun?: (workflowId: string) => void
}
