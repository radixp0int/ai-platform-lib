import { PageHeader } from '../../../components/page-header'
import { RecordList } from '../../../components/record-list'
import { ButtonLink } from '../../../primitives/button'
import { IconTile } from '../../../primitives/icon-tile'
import { WorkflowIcon } from '../../../primitives/icons'
import { Pill } from '../../../primitives/pill'
import { StatTile } from '../../../primitives/stat-tile'
import { usePlatform } from '../platform-context'
import { card, columnHead, pageColumn } from './pageStyles'

const GRID =
  'grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_9.5rem_minmax(0,1.5fr)_7rem] items-center gap-x-4'

/** The Workflows space's front page: this tenant's runs, and which need someone. */
export function RunsPage() {
  const { tenant, base, runs } = usePlatform()
  const waiting = runs.filter((run) => run.status === 'waiting').length
  const tiles: [number, string][] = [
    [runs.length, 'Runs in progress'],
    [waiting, 'Waiting on an approval'],
    [runs.length - waiting, 'Running without a person'],
  ]

  return (
    <div className={`${pageColumn} max-w-[74rem] gap-5`}>
      <PageHeader
        title={<>Runs</>}
        className="flex flex-col gap-1"
        descriptionClassName="text-sm text-ink-soft"
        description={<>Workflows in {tenant.name}.</>}
      />

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        {tiles.map(([count, label]) => (
          <StatTile
            key={label}
            value={count}
            label={label}
            className={`${card} flex flex-col px-5 py-4`}
          />
        ))}
      </div>

      <RecordList
        items={runs}
        columns={['Run', 'Current step', 'Status', 'Started by', null]}
        className="flex flex-col overflow-x-auto"
        headerClassName={`${GRID} min-w-[46rem] border-b border-line px-3 pb-2 ${columnHead}`}
        getKey={(item) => item.id}
        renderRow={(run, index) => (
          <div
            key={run.id}
            className={`${GRID} min-h-17 min-w-[46rem] px-3 text-sm text-ink ${
              index > 0 ? 'border-t border-line' : ''
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <IconTile
                size={32}
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-full bg-tint/5 text-brand-fg"
              >
                <WorkflowIcon width={16} height={16} />
              </IconTile>
              <span className="truncate font-semibold text-ink-strong">{run.title}</span>
            </span>
            <span className="truncate">{run.step}</span>
            <span className="flex">
              {run.status === 'waiting' ? (
                <Pill tone="warning">Needs approval</Pill>
              ) : (
                <Pill tone="brand">Running</Pill>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ink-strong">
                {run.startedBy.name}
              </span>
              <span className="block truncate text-xs text-ink-soft">{run.startedBy.role}</span>
            </span>
            <ButtonLink
              href={`${base}/${run.path}`}
              aria-label={`${run.status === 'waiting' ? 'Review' : 'Open'} ${run.title}`}
              variant="secondary"
              size="lg"
            >
              {run.status === 'waiting' ? 'Review' : 'Open'}
            </ButtonLink>
          </div>
        )}
        empty={
          runs.length === 0 && (
            <p className="px-3 py-8 text-sm text-ink-soft">
              No runs in {tenant.name} yet. The run demos live in Alderfinch Treasury.
            </p>
          )
        }
      />
    </div>
  )
}
