import type { NextIfApprovedProps } from './types'
// The pieces a step is made of, shared by the two things that draw one: the
// 400px StepInspector and the full-width StepDetail behind its expand button.
//
// They exist as one copy for the same reason Panel does — the two views
// cannot be allowed to drift, and the decision form least of all, since that is
// the part that actually does something. What differs between the views is
// arrangement, not these blocks: the panel stacks them in one narrow column,
// the page lays them out in two.
import { SectionLabel } from '../../../primitives/section-label'

/**
 * What a yes sets running. Shown only where there is room for it — the expanded
 * view — and only on a gate, since "next" is a question you ask before
 * deciding, not after. The steps come from the graph, so it says what the run
 * actually does rather than repeating the `If approved` row.
 */
export function NextIfApproved({ steps }: NextIfApprovedProps) {
  if (steps.length === 0) return null
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Next if approved</SectionLabel>
      <div className="flex flex-col gap-2.5 rounded-surface border border-dashed border-line p-3.5">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5">
            <span className="size-[7px] shrink-0 rounded-full bg-ink-soft/40" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{s.title}</span>
            <span className="shrink-0 text-xs text-ink-soft">{s.meta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
