import type { StageLanesProps } from './types'
// The stage columns behind the steps.
//
// They live in the viewport layer rather than as nodes, so they pan and zoom with
// the graph without adding anything for React Flow to measure or hit-test.
//
// `top`/`bottom` are props rather than constants because a lane is only as tall
// as the run it stands behind: the onboarding variant's five-wide provisioning
// column is 720px, and a fixed height would leave its nodes hanging outside.
//
// A lane is one of two widths. An open one keeps its full
// header and gains a control that folds it; a folded one has no room for a
// subtitle, so its whole header becomes the control that opens it again.
import { ViewportPortal } from '@xyflow/react'
import { EyeIcon } from '../../../primitives/icons'
import { StageMarker } from '../index'

export function StageLanes({
  stages,
  lanes,
  top,
  bottom,
  selectedStageId,
  onSelectStage,
  foldedStageIds = [],
  onToggleFold,
}: StageLanesProps) {
  return (
    <ViewportPortal>
      {stages.map((stage) => {
        const lane = lanes[stage.id]
        if (!lane) return null
        const current = stage.status === 'current'
        const selected = stage.id === selectedStageId
        const folded = foldedStageIds.includes(stage.id)
        return (
          <div
            key={stage.id}
            style={{
              position: 'absolute',
              transform: `translate(${lane.x}px, ${top}px)`,
              width: lane.w,
              height: bottom - top,
            }}
            /* The lane body stays click-through so it never steals a click meant
               for a node or the pane; only its header bar is a target. */
            className={`pointer-events-none box-border border-l border-dashed transition-colors ${
              selected
                ? 'border-accent bg-chip/70'
                : current
                  ? 'border-ink-soft/25 bg-chip/40'
                  : 'border-ink-soft/25'
            }`}
          >
            {folded ? (
              <button
                type="button"
                onClick={() => onToggleFold?.(stage.id)}
                aria-expanded={false}
                aria-label={`Show the ${stage.name} stage`}
                title={`Show ${stage.name}`}
                className="nodrag pointer-events-auto flex h-[52px] w-full items-center gap-2 border-b border-line bg-panel-solid/50 px-3 text-left transition hover:bg-panel-solid/80"
              >
                <StageMarker status={stage.status} />
                <span className="min-w-0 truncate text-[13px] font-bold text-ink">
                  {stage.name}
                </span>
              </button>
            ) : (
              <div
                className={`flex h-[52px] w-full items-stretch border-b transition ${
                  selected ? 'border-accent bg-panel-solid/80' : 'border-line bg-panel-solid/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectStage(stage.id)}
                  aria-pressed={selected}
                  className={`nodrag pointer-events-auto flex min-w-0 flex-1 items-center gap-2.5 px-5 text-left transition ${
                    selected ? '' : 'hover:bg-panel-solid/70'
                  }`}
                >
                  <StageMarker status={stage.status} />
                  <span className="text-[13.5px] font-bold whitespace-nowrap text-ink-strong">
                    {stage.name}
                  </span>
                  <span
                    className={`min-w-0 truncate text-xs ${
                      current || selected ? 'text-ink-strong' : 'text-ink-soft'
                    }`}
                  >
                    {stage.sub}
                  </span>
                </button>
                {onToggleFold && (
                  <button
                    type="button"
                    onClick={() => onToggleFold(stage.id)}
                    aria-expanded
                    aria-label={`Fold the ${stage.name} stage`}
                    title={`Fold ${stage.name}`}
                    className="nodrag pointer-events-auto grid w-11 shrink-0 place-items-center text-ink-soft transition hover:bg-panel-solid/70 hover:text-ink-strong"
                  >
                    <EyeIcon width={16} height={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </ViewportPortal>
  )
}
