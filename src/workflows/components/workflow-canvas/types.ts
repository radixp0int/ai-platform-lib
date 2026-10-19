import '@xyflow/react/dist/style.css'
import type { RunGraph } from '../../engine/index'
import { type StatusMap } from '../index'

export type WorkflowCanvasProps = {
  graph: RunGraph
  statuses: StatusMap
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** The stage being looked at — highlighted, but not re-framed on its own. */
  selectedStageId: string | null
  onSelectStage: (id: string) => void
  /**
   * Bumped only when someone deliberately picks a stage. Framing keys on this
   * rather than on `selectedStageId`, because that id also moves when a step is
   * selected — including by a live run reaching a gate, which must not yank the
   * viewport while you are reading something else.
   */
  stageFocusSeq: number
  /**
   * Stages to draw folded: one narrow column of status bars each. Keep the
   * array stable between renders: the node build is memoised on it.
   */
  foldedStageIds?: readonly string[]
  /** Supplying this puts a fold control on every lane header. */
  onToggleFold?: (id: string) => void
  /**
   * The stage whose fold was just toggled, and a counter bumped each time one
   * is. Folding moves everything to the right of it, so the canvas re-frames on
   * that stage — but only on a deliberate toggle, for the same reason as
   * `stageFocusSeq`.
   */
  foldFocus?: { stageId: string | null; seq: number }
}
