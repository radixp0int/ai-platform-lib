import { PageHeader } from '../../../components/page-header'
import { Button } from '../../../primitives/button'
import { DescriptionList } from '../../../primitives/description-list'
import { ArrowRightIcon, PencilIcon, PlayIcon } from '../../../primitives/icons'
import { Link } from '../../../primitives/link'
import type { WorkflowHeaderProps } from './types'
// The top of a workflow's page: its name and what it is for, the two things you
// do to it (edit it, start a run), the facts that identify it, and, when a run
// is in progress, a banner that opens it.
//
// The banner is the way from the workflow to its live run, so it is a whole link
// and says in words what the run is waiting for. Orange stays reserved for a run
// that is waiting on a person.

const BANNER = {
  waiting: { box: 'border-notify/40 bg-notify/5', dot: 'bg-notify' },
  running: { box: 'border-accent/35 bg-chip/60', dot: 'bg-brand-solid' },
}

export function WorkflowHeader({
  name,
  description,
  meta,
  liveRun,
  liveHref = '#live',
  onEdit,
  onStart,
  className = '',
}: WorkflowHeaderProps) {
  return (
    <header className={`flex flex-col gap-3.5 ${className}`}>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
        <div className="flex min-w-[min(100%,32rem)] flex-1 flex-col gap-2">
          <PageHeader
            title={name}
            titleClassName="text-[34px] leading-[1.12] font-bold tracking-tight text-ink-strong"
            className="flex flex-col"
          />
          <p className="m-0 max-w-[42rem] text-[15px] leading-relaxed text-ink">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={onEdit}
            icon={<PencilIcon width={16} height={16} />}
          >
            Edit workflow
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            icon={<PlayIcon width={15} height={15} />}
          >
            Start a run
          </Button>
        </div>
      </div>

      <DescriptionList
        rows={meta}
        className="m-0 flex flex-wrap gap-x-7 gap-y-1.5 text-[13px]"
        rowClassName="flex gap-1.5"
        termClassName="text-ink-soft"
        detailClassName="m-0 font-bold text-ink-strong"
      />

      {liveRun && (
        <Link
          variant="plain"
          href={liveHref}
          className={`flex min-h-13 flex-wrap items-center gap-x-3.5 gap-y-1 rounded-surface border py-2 pr-3.5 pl-4 text-ink-strong transition hover:bg-tint/5 ${BANNER[liveRun.state].box}`}
        >
          <span
            aria-hidden
            className={`size-2 shrink-0 rounded-full ${BANNER[liveRun.state].dot}`}
          />
          <span className="text-sm font-bold">{liveRun.title}</span>
          <span className="text-[13.5px] text-ink">{liveRun.sub}</span>
          <span className="flex-1" />
          <span className="flex items-center gap-1.5 text-sm font-bold text-brand-fg">
            Open live run
            <ArrowRightIcon width={14} height={14} />
          </span>
        </Link>
      )}
    </header>
  )
}
