import { useId } from 'react'
import { Avatar } from '../../../primitives/avatar'
import { PersonIcon } from '../../../primitives/icons'
import type { WorkflowApproversProps, WorkflowStatsProps, WorkflowSystemsProps } from './types'
// The three small cards beside a workflow's stages: who decides, which systems
// it reaches, and how its last month went. Each is a labelled region with a
// heading, so they read as separate things to a screen reader, and each fills
// whatever column it is put in.

const CARD = 'flex flex-col rounded-dialog border border-line px-4.5 py-4'
const HEADING = 'm-0 text-[15px] font-bold text-ink-strong'

export function WorkflowApprovers({ approvers, className = '' }: WorkflowApproversProps) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={`${CARD} gap-1 ${className}`}>
      <h2 id={id} className={`${HEADING} mb-1.5`}>
        Who decides
      </h2>
      <ul className="m-0 flex list-none flex-col p-0">
        {approvers.map((approver) => (
          <li
            key={approver.step}
            className="flex gap-3 border-b border-line py-2.5 last:border-b-0"
          >
            {approver.initials ? (
              <Avatar variant="text" text={approver.initials} size={34} tone="brand" aria-hidden />
            ) : (
              <span
                aria-hidden
                className="grid size-[34px] shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-ink-soft/70 text-ink-soft"
              >
                <PersonIcon width={16} height={16} />
              </span>
            )}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-bold text-ink-strong">{approver.step}</span>
              <span className="text-[13px] text-ink">{approver.who}</span>
              <span className="text-[12.5px] text-ink-soft">{approver.when}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function WorkflowSystems({ systems, className = '' }: WorkflowSystemsProps) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={`${CARD} gap-2.5 ${className}`}>
      <h2 id={id} className={HEADING}>
        Connected systems
      </h2>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {systems.map((system) => (
          <li
            key={system}
            className="inline-flex h-6.5 items-center rounded-control bg-tint/8 px-2.25 font-mono text-xs text-ink-strong"
          >
            {system}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function WorkflowStats({
  stats,
  note,
  heading = 'Last 30 days',
  className = '',
}: WorkflowStatsProps) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={`${CARD} gap-2.5 ${className}`}>
      <h2 id={id} className={HEADING}>
        {heading}
      </h2>
      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-[12.5px] text-ink-soft">{label}</dt>
            <dd className="m-0 text-xl font-bold text-ink-strong">{value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="m-0 text-[12.5px] leading-snug text-ink-soft">{note}</p>}
    </section>
  )
}
