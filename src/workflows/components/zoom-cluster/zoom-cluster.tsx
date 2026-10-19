// The two floating clusters on the canvas: what the symbols mean, and where the
// zoom is. The zoom readout names the tier, so a node shedding its subtitle
// never looks like a bug.
import { Panel, useReactFlow } from '@xyflow/react'
import { ExpandDiagonalIcon, MinusIcon, PlusIcon } from '../../../primitives/icons'
import { TIER_LABEL, useZoomPercent, useZoomTier } from '../zoom'

export function ZoomCluster() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const pct = useZoomPercent()
  const tier = useZoomTier()

  const btn =
    'grid size-[34px] place-items-center rounded-control text-ink-soft transition hover:bg-tint/8 hover:text-ink-strong'

  return (
    <Panel position="bottom-right">
      <div className="glass flex flex-col items-center gap-0.5 rounded-surface p-1.5">
        <div className="flex flex-col items-center px-0.5 pt-1 pb-0.5">
          <span className="text-xs leading-[15px] font-bold text-ink-strong tabular-nums">
            {pct}%
          </span>
          <span className="text-[10px] leading-[13px] font-semibold text-ink-soft">
            {TIER_LABEL[tier]}
          </span>
        </div>
        <button type="button" onClick={() => zoomIn()} className={btn} aria-label="Zoom in">
          <PlusIcon width={16} height={16} />
        </button>
        <button type="button" onClick={() => zoomOut()} className={btn} aria-label="Zoom out">
          <MinusIcon width={16} height={16} />
        </button>
        <button
          type="button"
          onClick={() => fitView({ padding: 0.12, duration: 300 })}
          className={btn}
          aria-label="Fit the run on screen"
        >
          <ExpandDiagonalIcon width={16} height={16} />
        </button>
      </div>
    </Panel>
  )
}
