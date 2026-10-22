import type { ResolvedIO } from '../../engine/io'

/** Resolved against the run already — see `resolveStepIO` — so the block stays source-agnostic. */
export type StepInputsOutputsProps = { io: ResolvedIO }
