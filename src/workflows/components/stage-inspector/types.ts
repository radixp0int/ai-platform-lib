import type { RunDetail } from '../../engine/index'
import type { StageSeed, StatusMap, StepSeed } from '../index'

export type StageInspectorProps = {
  stage: StageSeed
  /** Only this stage's steps, in graph order. */
  steps: StepSeed<RunDetail>[]
  statuses: StatusMap
  selectedStepId: string | null
  onSelectStep: (id: string) => void
  onClose: () => void
}
