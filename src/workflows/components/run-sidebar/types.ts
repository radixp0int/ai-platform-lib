import type { RunHeader, VariantInfo } from '../../engine/wireProtocol'
import type { StageSeed } from '../index'
import type { RecentRun } from '../recent-runs'
import type { NeedsItem } from './run-sidebar'

export type RunSidebarProps = {
  header: RunHeader
  stages: StageSeed[]
  needs: NeedsItem[]
  /** The stage being looked at, if any. */
  selectedStageId: string | null
  onSelectStage: (id: string) => void
  /** Empty when there is nothing to switch between — the hard-coded route. */
  variants: VariantInfo[]
  variantId: string
  onVariant: (id: string) => void
  onOpenStep: (id: string) => void
  /** The step being looked at, if any — mirrors `selectedStageId` above. */
  selectedStepId: string | null
  onCollapse: () => void
  /**
   * Stages the canvas is drawing folded. Supplying `onToggleFold` puts an eye on
   * every stage row: open means the stage is drawn in full.
   */
  foldedStageIds?: readonly string[]
  onToggleFold?: (id: string) => void
  /**
   * Other runs to switch to. Supplying this splits the panel into two tabs,
   * Stages and Recent, so neither list has to be cut short for the other.
   */
  recent?: RecentRun[]
  /** Which of `recent` is the run on screen. */
  activeRecentId?: string | null
  onOpenRecent?: (id: string) => void
}
