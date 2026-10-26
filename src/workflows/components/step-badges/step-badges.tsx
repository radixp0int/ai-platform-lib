import type { StepBadgesProps } from './types'
// The pieces a step is made of, shared by the two things that draw one: the
// 400px StepInspector and the full-width StepDetail behind its expand button.
//
// They exist as one copy for the same reason Panel does — the two views
// cannot be allowed to drift, and the decision form least of all, since that is
// the part that actually does something. What differs between the views is
// arrangement, not these blocks: the panel stacks them in one narrow column,
// the page lays them out in two.
import type { StepStatus } from '../index'
import { KindIcon, STEP_KIND_LABEL } from '../index'

const STATUS_LABEL: Record<StepStatus, string> = {
  done: 'Done',
  running: 'Running',
  waiting: 'Needs approval',
  queued: 'Queued',
  skipped: 'Skipped',
  failed: 'Failed',
  approved: 'Approved',
  changes: 'Sent back',
}

/** What kind of step this is, and where it has got to. */
export function StepBadges({ step, status }: StepBadgesProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex h-5 items-center gap-1.5 rounded-control bg-chip px-2 text-[11px] font-bold text-chip-fg">
        <KindIcon kind={step.kind} initials={step.initials} size={14} />
        {STEP_KIND_LABEL[step.kind]}
      </span>
      {status === 'waiting' ? (
        <span className="ml-auto inline-flex h-5 items-center rounded-control bg-notify px-2 text-[11px] font-bold text-on-notify">
          Needs approval
        </span>
      ) : (
        status && (
          <span className="ml-auto text-xs font-semibold text-ink-soft">
            {STATUS_LABEL[status]}
          </span>
        )
      )}
    </div>
  )
}
