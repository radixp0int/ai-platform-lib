import type { HowItGotHereProps } from './types'
// The pieces a step is made of, shared by the two things that draw one: the
// 400px StepInspector and the full-width StepDetail behind its expand button.
//
// They exist as one copy for the same reason Panel does — the two views
// cannot be allowed to drift, and the decision form least of all, since that is
// the part that actually does something. What differs between the views is
// arrangement, not these blocks: the panel stacks them in one narrow column,
// the page lays them out in two.
import { SectionLabel } from '../../../primitives/section-label'

export function HowItGotHere({ trace }: HowItGotHereProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>How it got here</SectionLabel>
      <ol className="turn-rail flex flex-col gap-1.5 pl-4 text-xs leading-4 text-ink-soft">
        {trace.map(([at, label, ms]) => (
          <li key={`${at}-${label}`} className="flex items-baseline gap-3">
            <span className="w-9 shrink-0 font-mono tabular-nums">{at}</span>
            <span className="min-w-0 flex-1">{label}</span>
            <span className="shrink-0 font-mono tabular-nums">{ms}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
