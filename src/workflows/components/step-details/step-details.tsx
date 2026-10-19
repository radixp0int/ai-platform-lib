import { DescriptionList } from '../../../primitives/description-list'
import type { StepDetailsProps } from './types'
// The pieces a step is made of, shared by the two things that draw one: the
// 400px StepInspector and the full-width StepDetail behind its expand button.
//
// They exist as one copy for the same reason Panel does — the two views
// cannot be allowed to drift, and the decision form least of all, since that is
// the part that actually does something. What differs between the views is
// arrangement, not these blocks: the panel stacks them in one narrow column,
// the page lays them out in two.
import { Avatar } from '../../../primitives/avatar'
import { SectionLabel } from '../../../primitives/section-label'

/**
 * Who it is waiting on, and the flat facts under them.
 *
 * Boxed, and led by the assignee's initials, because as a bare run of grey
 * label/value pairs this was the block readers slid past — in the 400px panel
 * especially. A face is what the eye lands on, and who owns the decision is the
 * fact people check first, so it is a row of its own above the list rather than
 * the first two entries in it. `due` is stated here and nowhere else: a run that
 * also listed it under `rows` would say it twice.
 */
export function StepDetails({ step }: StepDetailsProps) {
  const { detail } = step
  const who = step.assignee
  if (!who && detail.rows.length === 0) return null

  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Details</SectionLabel>
      <div className="rounded-surface border border-line p-3.5">
        {who && (
          <div className="flex items-center gap-2.5 border-b border-line pb-3">
            {step.initials && (
              <Avatar variant="text" text={step.initials} size={30} tone="brand" aria-hidden />
            )}
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] leading-[18px] font-bold text-ink-strong">
                {who}
              </span>
              {detail.due && (
                <span className="truncate text-xs leading-4 text-ink-soft">{detail.due}</span>
              )}
            </span>
          </div>
        )}
        {detail.rows.length > 0 && (
          <DescriptionList
            rows={detail.rows}
            className={`grid grid-cols-[92px_minmax(0,1fr)] gap-x-3.5 gap-y-1.5 ${who ? 'mt-3' : ''}`}
          />
        )}
      </div>
    </div>
  )
}
