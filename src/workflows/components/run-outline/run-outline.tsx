// What this run is, where it has got to, and what is waiting on you — the run's
// section of the platform's side menu, drawn under its destinations.
//
// It is not a panel of its own: the brand, the collapse control and the account
// all belong to the app, and the menu already has them. This is only the
// run-shaped part, handed to `InSideMenu` by the page.
//
// Everything run-shaped arrives as props. "Needs you" is a *list*, not a
// boolean: a run can stop on two approvals at once (the onboarding variant
// does), and the old single hardcoded card made the second one invisible.
import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from '../../../primitives/icons'
import { SectionLabel } from '../../../primitives/section-label'
import { Select } from '../../../primitives/select'
import { StatusDot } from '../../../primitives/status-dot'
import { Tabs, TabsList, TabsTrigger } from '../../../primitives/tabs'
import { RecentRuns } from '../recent-runs'
import { StageMarker } from '../index'
import type { RunOutlineProps } from './types'

export function RunOutline({
  header,
  stages,
  needs,
  selectedStageId,
  onSelectStage,
  variants,
  variantId,
  onVariant,
  onOpenStep,
  selectedStepId,
  foldedStageIds = [],
  onToggleFold,
  recent,
  activeRecentId,
  onOpenRecent,
}: RunOutlineProps) {
  const current = variants.find((v) => v.id === variantId)
  const [tab, setTab] = useState<'stages' | 'recent'>('stages')
  const showRecent = recent !== undefined && tab === 'recent'
  // What the Recent tab is for: how many *other* runs are waiting on someone.
  const waitingElsewhere =
    recent?.filter((run) => run.state === 'waiting' && run.id !== activeRecentId).length ?? 0

  return (
    <section
      aria-label="This run"
      className="mt-3 flex min-h-0 flex-1 flex-col gap-4 border-t border-line pt-4"
    >
      <div className="rounded-surface bg-panel-solid px-4 py-3.5 shadow-sm ring-1 ring-line">
        <div className="text-sm leading-5 font-bold text-ink-strong">{header.primary}</div>
        <div className="text-[12.5px] leading-[17px] text-ink-soft">{header.secondary}</div>
        <div className="text-[12.5px] leading-[17px] text-ink-soft tabular-nums">
          {header.tertiary}
        </div>
      </div>

      {variants.length > 1 && (
        <div>
          <Select
            label="Workflow"
            value={variantId}
            onChange={(value) => onVariant(String(value))}
            options={variants.map((v) => ({ value: v.id, label: v.label }))}
          />
          {current && (
            <p className="mt-1.5 px-0.5 text-xs leading-[17px] text-ink-soft">{current.blurb}</p>
          )}
        </div>
      )}

      {recent !== undefined && (
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value === 'recent' ? 'recent' : 'stages')}
        >
          <TabsList variant="segmented" aria-label="This run" className="w-full">
            <TabsTrigger
              value="stages"
              count={stages.length}
              controls={false}
              className="flex-1 justify-center"
            >
              Stages
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              count={waitingElsewhere || undefined}
              controls={false}
              className="flex-1 justify-center"
            >
              Recent
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {showRecent && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <RecentRuns
            runs={recent}
            activeId={activeRecentId}
            onOpen={(id) => {
              onOpenRecent?.(id)
              setTab('stages')
            }}
          />
        </div>
      )}

      {/* Stages take the slack and scroll; "Needs you" below never shrinks.
          That order is the priority: stages are reference, a pending approval is
          the thing being asked of you, and a run waiting on two people must not
          hide the second one below the fold. */}
      <div className={`min-h-36 flex-1 overflow-y-auto ${showRecent ? 'hidden' : ''}`}>
        <div className="mb-2 flex items-baseline justify-between gap-2 px-2.5">
          <SectionLabel>Stages</SectionLabel>
          {onToggleFold && (
            <span className="text-[11.5px] text-ink-soft tabular-nums">
              {stages.length - foldedStageIds.length} of {stages.length} shown
            </span>
          )}
        </div>
        <div className="relative flex flex-col gap-0.5">
          {/* Each stage owns a segment of one spine, the way the sidebar's chat
              history groups do. */}
          <span aria-hidden className="absolute top-6 bottom-6 left-[19px] w-px bg-ink-soft/25" />
          {stages.map((stage) => {
            const current = stage.status === 'current'
            const selected = stage.id === selectedStageId
            const folded = foldedStageIds.includes(stage.id)
            return (
              <div key={stage.id} className="relative flex items-center gap-1">
                {/* The outline is how you navigate the canvas, so each row is a button. `current`
                  (where the run is) and `selected` (where you are looking) are different facts and
                  get different weight. */}
                <button
                  type="button"
                  onClick={() => onSelectStage(stage.id)}
                  aria-pressed={selected}
                  className={`relative flex min-w-0 flex-1 items-center gap-3 rounded-control p-2.5 text-left transition ${
                    selected
                      ? 'bg-chip ring-1 ring-accent'
                      : current
                        ? 'bg-chip hover:ring-1 hover:ring-accent/40'
                        : 'hover:bg-tint/6'
                  }`}
                >
                  <StageMarker status={stage.status} />
                  <div className="flex min-w-0 flex-col">
                    <span
                      className={`text-sm leading-5 ${
                        current || selected
                          ? 'font-bold text-chip-fg'
                          : folded
                            ? 'font-medium text-ink-soft'
                            : 'font-medium text-ink'
                      }`}
                    >
                      {stage.name}
                    </span>
                    <span className="truncate text-xs leading-[17px] text-ink-soft">
                      {stage.sub}
                    </span>
                  </div>
                </button>
                {/* Its own button beside the row, not inside it: the row picks a
                  stage to read about, the eye decides whether the canvas draws
                  it in full. The filled tile is what says "shown". */}
                {onToggleFold && (
                  <button
                    type="button"
                    onClick={() => onToggleFold(stage.id)}
                    aria-pressed={!folded}
                    aria-label={`Show ${stage.name} on the canvas`}
                    title={folded ? `Show ${stage.name} on the canvas` : `Fold ${stage.name}`}
                    className={`grid size-9 shrink-0 place-items-center rounded-control transition ${
                      folded
                        ? 'text-ink-soft hover:bg-tint/8 hover:text-ink'
                        : 'bg-chip text-chip-fg hover:bg-chip-hover'
                    }`}
                  >
                    {folded ? (
                      <EyeOffIcon width={16} height={16} />
                    ) : (
                      <EyeIcon width={16} height={16} />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className={`shrink-0 ${showRecent ? 'hidden' : ''}`}>
        <div className="mb-2 flex items-center gap-2 px-2.5">
          <SectionLabel>Needs you</SectionLabel>
          <span className="grid h-[17px] min-w-[17px] place-items-center rounded-full bg-notify px-1.5 text-[10px] font-bold text-on-notify">
            {needs.length}
          </span>
        </div>
        {needs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {needs.map((item) => {
              // Same two facts the stage rows separate: a run can stop on two
              // approvals at once, and after clicking one of them you could not
              // tell which was open.
              const selected = item.stepId === selectedStepId
              return (
                <button
                  key={item.stepId}
                  type="button"
                  onClick={() => onOpenStep(item.stepId)}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-3 rounded-surface bg-panel-solid p-3 text-left ring-1 transition ${
                    selected ? 'ring-accent' : 'ring-line hover:ring-accent/40'
                  }`}
                >
                  <StatusDot
                    className="mt-[7px] size-2 shrink-0 rounded-full bg-notify"
                    aria-hidden
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[13px] leading-5 font-bold text-ink-strong">
                      {item.title}
                    </span>
                    <span className="text-xs leading-[17px] text-ink-soft">{item.sub}</span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="px-2.5 text-[13px] leading-5 text-ink-soft">
            Nothing waiting on you in this run.
          </p>
        )}
      </div>
    </section>
  )
}
