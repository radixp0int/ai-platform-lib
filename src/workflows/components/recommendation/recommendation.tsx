import type { RecommendationProps } from './types'
// The pieces a step is made of, shared by the two things that draw one: the
// 400px StepInspector and the full-width StepDetail behind its expand button.
//
// They exist as one copy for the same reason Panel does — the two views
// cannot be allowed to drift, and the decision form least of all, since that is
// the part that actually does something. What differs between the views is
// arrangement, not these blocks: the panel stacks them in one narrow column,
// the page lays them out in two.
import { SectionLabel } from '../../../primitives/section-label'
import { KindIcon } from '../index'

export function Recommendation({ rec }: RecommendationProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>{rec.label ?? 'Agent recommendation'}</SectionLabel>
      {/* --canvas, not --panel-solid: the expanded view's own background IS
          panel-solid, so the card was white on white there and read flat. This
          value is distinct from that page AND from the panel's translucent
          shell, so one card works in both and neither view needs a variant. */}
      <div className="rounded-surface bg-canvas p-4 ring-1 ring-line">
        <div className="flex items-center gap-2.5">
          <KindIcon kind="agent" size={16} />
          <span className="text-xs text-ink-soft">{rec.from}</span>
        </div>
        <p className="mt-3 text-[15px] leading-5 font-bold text-ink-strong">{rec.verdict}</p>
        <div className="mt-3 grid grid-cols-3 gap-2.5 border-t border-line pt-3">
          {rec.figures.map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <span className="text-[11px] text-ink-soft">{k}</span>
              <span className="text-sm font-bold text-ink-strong tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
