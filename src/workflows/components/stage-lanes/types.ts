import type { StageSeed } from '../index'
export type Lane = { x: number; w: number }

export type StageLanesProps = {
  stages: StageSeed[]
  lanes: Record<string, Lane>
  top: number
  bottom: number
  /** The stage being looked at, if any. */
  selectedStageId: string | null
  onSelectStage: (id: string) => void
  /** Stages drawn folded. Their header shrinks to a marker and a name. */
  foldedStageIds?: readonly string[]
  /** Supplying this puts a fold control on every lane header. */
  onToggleFold?: (id: string) => void
}
