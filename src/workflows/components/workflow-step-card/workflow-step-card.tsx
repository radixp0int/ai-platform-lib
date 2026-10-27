import { DescriptionList } from '../../../primitives/description-list'
import { Pill } from '../../../primitives/pill'
import { SectionLabel } from '../../../primitives/section-label'
import { IoTypePill } from '../io-type-pill'
import { KindIcon } from '../kind-icon'
import { STEP_KIND_LABEL } from '../types'
import type { WorkflowStepCardProps } from './types'
// One step as the workflow defines it: what it does, what it reads and hands on
// as typed fields, and whatever is particular to its kind (who approves, what it
// can call, what happens when it fails).
//
// A definition, not a run: no values, no status. Where an input comes from is
// the point, since that is what tells you how the steps depend on one another.

export function WorkflowStepCard({ step, titleOf, className = '' }: WorkflowStepCardProps) {
  const inputs = step.io?.inputs ?? []
  const outputs = step.io?.outputs ?? []
  return (
    <article
      className={`flex min-w-0 flex-col gap-2.5 rounded-surface border bg-panel-solid px-4 py-3.5 ${
        step.sometimes ? 'border-dashed border-ink-soft/60' : 'border-line'
      } ${className}`}
    >
      <header className="flex min-w-0 items-center gap-2">
        <KindIcon kind={step.kind} size={18} />
        <span className="flex min-w-0 flex-col">
          <span className="text-[11.5px] font-bold tracking-[0.04em] text-ink-soft uppercase">
            {STEP_KIND_LABEL[step.kind]}
          </span>
          <h3
            className={`m-0 text-[14.5px] leading-5 font-bold break-words text-ink-strong ${
              step.kind === 'tool' ? 'font-mono' : ''
            }`}
          >
            {step.title}
          </h3>
        </span>
        <span className="flex-1" />
        {step.sometimes && (
          <Pill size="sm" tone="neutral" variant="outline" className="shrink-0 border-dashed">
            Sometimes
          </Pill>
        )}
      </header>

      <p className="m-0 text-[13.5px] leading-normal text-ink">{step.does}</p>

      {(inputs.length > 0 || outputs.length > 0) && (
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-2.5 border-t border-line pt-2.5 max-sm:grid-cols-1">
          <div role="group" aria-label="Inputs" className="flex min-w-0 flex-col gap-1.5">
            <SectionLabel>Inputs</SectionLabel>
            {inputs.map((input) => (
              <span key={input.name} className="flex min-w-0 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[12.5px] font-medium text-ink-strong">
                    {input.name}
                  </span>
                  <IoTypePill type={input.type} />
                </span>
                <span className="text-xs text-ink-soft">
                  {'run' in input.from
                    ? 'From the run’s inputs'
                    : `From ${titleOf?.(input.from.step) ?? input.from.step}`}
                </span>
              </span>
            ))}
          </div>
          <div role="group" aria-label="Outputs" className="flex min-w-0 flex-col gap-1.5">
            <SectionLabel>Outputs</SectionLabel>
            {outputs.map((output) => (
              <span key={output.name} className="flex min-h-5 flex-wrap items-center gap-1.5">
                <span className="font-mono text-[12.5px] font-medium text-ink-strong">
                  {output.name}
                </span>
                <IoTypePill type={output.type} />
              </span>
            ))}
          </div>
        </div>
      )}

      {step.facts && step.facts.length > 0 && (
        <DescriptionList
          rows={step.facts}
          className="m-0 flex flex-col gap-1.5 border-t border-line pt-2.5"
          rowClassName="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-2.5 text-[13px]"
          termClassName="text-ink-soft"
          detailClassName="m-0 font-semibold text-ink-strong"
        />
      )}
    </article>
  )
}
