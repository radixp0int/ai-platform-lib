// The run's part of the menu when the menu is folded to its icon rail: the
// stages as markers, one to a row, and a badge when something waits on you.
// Names live in tooltips, the way the menu's own icons keep theirs.
import { MenuBadge } from '../../../components/side-menu'
import { Tooltip } from '../../../primitives/tooltip'
import { StageMarker } from '../index'
import type { RunOutlineRailProps } from './types'

export function RunOutlineRail({
  stages,
  needs,
  selectedStageId,
  onSelectStage,
  onOpenStep,
  selectedStepId,
}: RunOutlineRailProps) {
  const first = needs[0]
  return (
    <section
      aria-label="This run"
      className="mt-2 flex w-full flex-1 flex-col items-center gap-0.5 border-t border-line pt-2"
    >
      {stages.map((stage) => {
        const selected = stage.id === selectedStageId
        return (
          <Tooltip key={stage.id} content={`${stage.name} · ${stage.sub}`}>
            <button
              type="button"
              onClick={() => onSelectStage(stage.id)}
              aria-pressed={selected}
              aria-label={`${stage.name}. ${stage.sub}`}
              className={`grid size-11 place-items-center rounded-control transition ${
                selected ? 'bg-tint/7' : 'hover:bg-tint/5'
              }`}
            >
              <StageMarker status={stage.status} />
            </button>
          </Tooltip>
        )
      })}
      {first && (
        <Tooltip content={`Needs you · ${first.title}`}>
          <button
            type="button"
            onClick={() => onOpenStep(first.stepId)}
            aria-pressed={needs.some((item) => item.stepId === selectedStepId)}
            aria-label={`Needs you: ${needs.length} waiting`}
            className="mt-auto grid size-11 place-items-center rounded-control transition hover:bg-tint/5"
          >
            <MenuBadge count={needs.length} />
          </button>
        </Tooltip>
      )}
    </section>
  )
}
