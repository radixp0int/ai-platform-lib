import { useState } from 'react'
import { Button } from '../../../primitives/button'
import { ChevronDownIcon } from '../../../primitives/icons'
import { KindIcon } from '../kind-icon'
import { stepCount, type WorkflowStageSpec } from '../workflow-spec'
import { WorkflowStepCard } from '../workflow-step-card'
import type { WorkflowStageListProps } from './types'
// What each stage does, one row per stage: its number, name and usual time, the
// steps in it as small chips, and a chevron that opens the stage to say what it is
// for and show each step as a card.
//
// A list of disclosure buttons (`aria-expanded`) rather than an accordion widget,
// since any number can be open at once and "Expand all" is a normal thing to want.

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

const ROW =
  'grid w-full grid-cols-[2.5rem_minmax(0,9.5rem)_minmax(0,1fr)_4.75rem_1.25rem] items-start gap-x-3.5 border-0 bg-transparent py-3.5 pr-2 pl-1 text-left max-md:grid-cols-[2rem_minmax(0,1fr)_4.25rem_1.25rem] max-md:gap-y-2'

export function WorkflowStageList({
  stages,
  timeNote,
  defaultOpenIds = [],
  className = '',
}: WorkflowStageListProps) {
  const [open, setOpen] = useState<string[]>(defaultOpenIds)
  const allOpen = open.length === stages.length
  const steps = stages.flatMap((stage) => stage.columns.flat())
  const titleOf = (id: string) => steps.find((step) => step.id === id)?.title

  const toggle = (id: string) =>
    setOpen((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  return (
    <section aria-labelledby="workflow-stages" className={`flex min-w-0 flex-col ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1 pb-2.5">
        <h2 id="workflow-stages" className="m-0 text-[17px] font-bold text-ink-strong">
          What each stage does
        </h2>
        <span className="flex items-center gap-3.5">
          {timeNote && <span className="text-[12.5px] text-ink-soft">{timeNote}</span>}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpen(allOpen ? [] : stages.map((stage) => stage.id))}
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </Button>
        </span>
      </div>
      <ol className="m-0 flex list-none flex-col border-t border-line p-0">
        {stages.map((stage: WorkflowStageSpec, index) => {
          const isOpen = open.includes(stage.id)
          const stageSteps = stage.columns.flat()
          return (
            <li
              key={stage.id}
              className={`flex flex-col border-b border-line ${isOpen ? 'bg-tint/5' : ''}`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(stage.id)}
                className={`${ROW} cursor-pointer text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="pt-0.5 font-mono text-xs text-ink-soft">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[14.5px] leading-[22px] font-bold text-ink-strong">
                    {stage.name}
                  </span>
                  <span className="text-[12.5px] text-ink-soft">
                    {plural(stepCount(stage), 'step')}
                  </span>
                </span>
                <span className="flex min-w-0 flex-wrap gap-1.5 max-md:col-span-4 max-md:row-start-2">
                  {stageSteps.map((step) => (
                    <span
                      key={step.id}
                      className={`inline-flex min-h-7.5 max-w-full items-center gap-1.5 rounded-control border py-0 pr-2.5 pl-1.5 text-[13px] text-ink-strong ${
                        step.sometimes
                          ? 'border-dashed border-ink-soft/60 bg-panel-solid'
                          : 'border-transparent bg-tint/5'
                      }`}
                    >
                      <KindIcon kind={step.kind} size={18} />
                      <span
                        className={`min-w-0 truncate ${step.kind === 'tool' ? 'font-mono text-xs' : ''}`}
                      >
                        {step.title}
                      </span>
                      {step.note && (
                        <span className="shrink-0 text-[11.5px] text-ink-soft">{step.note}</span>
                      )}
                    </span>
                  ))}
                </span>
                <span className="pt-0.5 text-right text-[13px] font-semibold text-ink tabular-nums">
                  {stage.typicalTime}
                </span>
                <ChevronDownIcon
                  width={18}
                  height={18}
                  aria-hidden
                  className={`mt-0.5 text-ink transition-transform motion-reduce:transition-none ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="flex flex-col gap-3 px-3 pb-4.5 pl-14.5 max-md:pl-3">
                  <p className="m-0 max-w-[40rem] text-sm leading-normal text-ink">
                    {stage.purpose}
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-3">
                    {stageSteps.map((step) => (
                      <WorkflowStepCard key={step.id} step={step} titleOf={titleOf} />
                    ))}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
