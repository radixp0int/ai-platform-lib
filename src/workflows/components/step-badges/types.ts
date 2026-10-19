import type { RunDetail } from '../../engine/wireProtocol'
import type { StepSeed, StepStatus } from '../index'

export type StepBadgesProps = {
  step: StepSeed<RunDetail>
  status: StepStatus | undefined
}
