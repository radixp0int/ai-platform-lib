import type { RunInputSpec, RunOutputSpec } from '../../engine/wireProtocol'

export type RunContractProps = { inputs: RunInputSpec[]; outputs: RunOutputSpec[] }
