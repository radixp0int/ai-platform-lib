import type { RunDetail } from '../../engine/wireProtocol'
import type { StepSeed } from '../index'

export type NextIfApprovedProps = { steps: StepSeed<RunDetail>[] }
