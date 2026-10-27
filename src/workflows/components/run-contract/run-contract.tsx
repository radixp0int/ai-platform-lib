import type { ReactNode } from 'react'
import { Pill } from '../../../primitives/pill'
import { SectionLabel } from '../../../primitives/section-label'
import { IoTypePill } from '../io-type-pill'
import type { RunContractProps } from './types'
// What a workflow asks for to start and what it hands back at the end — the
// workflow's side of the bargain, independent of any one run. Built for the
// workflow detail page; it stands alone so that page only has to place it.

function Row({
  name,
  type,
  badge,
  children,
}: {
  name: string
  type: RunContractProps['inputs'][number]['type']
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <li className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate font-mono text-[12.5px] leading-5 font-medium text-ink-strong">
          {name}
        </span>
        <IoTypePill type={type} />
        <span className="flex-1" />
        {badge}
      </span>
      <span className="text-[13px] leading-5 text-pretty text-ink-soft">{children}</span>
    </li>
  )
}

export function RunContract({ inputs, outputs }: RunContractProps) {
  return (
    <div className="grid gap-6 @2xl:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <SectionLabel>Inputs</SectionLabel>
        {inputs.length === 0 ? (
          <p className="text-[13px] text-ink-soft">Needs nothing to start.</p>
        ) : (
          <ul aria-label="Inputs" className="rounded-surface border border-line px-3.5">
            {inputs.map((input) => (
              <Row
                key={input.name}
                name={input.name}
                type={input.type}
                badge={
                  <Pill size="sm" tone={input.required ? 'brand' : 'neutral'}>
                    {input.required ? 'Required' : 'Optional'}
                  </Pill>
                }
              >
                {input.description}
              </Row>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        <SectionLabel>Outputs</SectionLabel>
        <ul aria-label="Outputs" className="rounded-surface border border-line px-3.5">
          {outputs.map((output) => (
            <Row
              key={output.name}
              name={output.name}
              type={output.type}
              badge={<span className="text-xs font-semibold text-ink">→ {output.goesTo}</span>}
            >
              {output.description}
            </Row>
          ))}
        </ul>
      </div>
    </div>
  )
}
