// What each authored workflow asks for to start and hands back at the end, keyed
// by the ids the summaries use. Only the four with a scripted run have one; the
// rest of the table's workflows start with nothing to fill in.
import type { StartableWorkflow } from '../components/start-run-dialog'
import type { RunInputSpec, RunOutputSpec } from '../engine/wireProtocol'
import { incidentTriage } from './incidentTriage'
import { RUN_INPUT_SPECS, RUN_INPUTS, RUN_OUTPUT_SPECS } from './loanRun'
import { onboarding } from './onboarding'
import { rfpResponse } from './rfpResponse'
import { WORKFLOW_SUMMARIES } from './workflowSummaries'

export type RunContractSpec = {
  inputs: RunInputSpec[]
  outputs: RunOutputSpec[]
  defaults: Record<string, string>
}

export const RUN_CONTRACTS: Record<string, RunContractSpec> = {
  'loan-review': { inputs: RUN_INPUT_SPECS, outputs: RUN_OUTPUT_SPECS, defaults: RUN_INPUTS },
  ...Object.fromEntries(
    [rfpResponse, onboarding, incidentTriage].map((script) => [
      script.id,
      { inputs: script.inputs, outputs: script.outputs, defaults: script.defaultInputs },
    ]),
  ),
}

/** Every workflow in the table, as the start dialog's picker lists them. */
export const STARTABLE_WORKFLOWS: StartableWorkflow[] = WORKFLOW_SUMMARIES.map((w) => ({
  id: w.id,
  name: w.name,
  inputs: RUN_CONTRACTS[w.id]?.inputs ?? [],
  defaults: RUN_CONTRACTS[w.id]?.defaults,
}))
