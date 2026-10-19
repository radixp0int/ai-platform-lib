import type { PolicyExceptionProps } from './types'
// The pieces a step is made of, shared by the two things that draw one: the
// 400px StepInspector and the full-width StepDetail behind its expand button.
//
// They exist as one copy for the same reason Panel does — the two views
// cannot be allowed to drift, and the decision form least of all, since that is
// the part that actually does something. What differs between the views is
// arrangement, not these blocks: the panel stacks them in one narrow column,
// the page lays them out in two.
import { FlagIcon } from '../../../primitives/icons/workflow-icons'
import { SectionLabel } from '../../../primitives/section-label'

/**
 * A callout rather than a paragraph. This is the thing that makes the run stop
 * for a person at all, and as plain text between two other blocks it was the
 * easiest item on the page to skim past. Warm rather than --danger: an
 * exception is a caveat to weigh, not a failure.
 */
export function PolicyException({ exc }: PolicyExceptionProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel tone="caution">{exc.label ?? 'Policy exception'}</SectionLabel>
      <div className="flex gap-3 rounded-surface bg-caution-surface p-3.5 ring-1 ring-caution-line">
        <FlagIcon width={17} height={17} className="mt-px shrink-0 text-caution" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[13.5px] leading-5 font-semibold text-ink-strong">{exc.text}</span>
          <span className="text-xs leading-[18px] text-ink-soft">{exc.mitigant}</span>
        </div>
      </div>
    </div>
  )
}
