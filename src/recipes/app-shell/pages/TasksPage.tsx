import { useState } from 'react'
import { PageHeader } from '../../../components/page-header'
import { RecordList } from '../../../components/record-list'
import type { Task } from '../../../fixtures/platform/work'
import { Button } from '../../../primitives/button'
import { DescriptionList } from '../../../primitives/description-list'
import { IconTile } from '../../../primitives/icon-tile'
import { CheckIcon, WorkflowIcon, XIcon } from '../../../primitives/icons'
import { Link } from '../../../primitives/link'
import { Pill } from '../../../primitives/pill'
import { Tabs, TabsList, TabsTrigger } from '../../../primitives/tabs'
import { Textarea } from '../../../primitives/textarea'
import { usePlatform } from '../platform-context'
import { card, columnHead, pageColumn, textLink } from './pageStyles'

type Decision = 'approved' | 'returned'

const GRID = 'grid grid-cols-[5.5rem_minmax(0,1fr)_7rem_9rem] items-center gap-x-4'

/**
 * Everything waiting on the viewer, from any space, in one list — with the
 * selected item's details and its decision beside it.
 *
 * Deciding here is a mock: it moves the row to Done for this session. The real
 * approval still happens on the run's canvas, which "Open the run" goes to.
 */
export function TasksPage() {
  const { tenant, base, tasks } = usePlatform()
  const [tab, setTab] = useState<'waiting' | 'done'>('waiting')
  const [decided, setDecided] = useState<Record<string, Decision>>({})
  const [selectedId, setSelectedId] = useState<string | null>(tasks[0]?.id ?? null)
  const waiting = tasks.filter((task) => !decided[task.id])
  const done = tasks.filter((task) => decided[task.id])
  const list = tab === 'waiting' ? waiting : done
  const selected = list.find((task) => task.id === selectedId) ?? null

  const decide = (task: Task, decision: Decision) => {
    setDecided((all) => ({ ...all, [task.id]: decision }))
    setSelectedId(waiting.find((item) => item.id !== task.id)?.id ?? null)
  }

  return (
    <div className={`${pageColumn} max-w-[74rem] gap-4`}>
      <PageHeader title="Tasks" className="flex items-center gap-3">
        {waiting.length > 0 && <Pill tone="warning">{waiting.length} waiting</Pill>}
      </PageHeader>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value === 'done' ? 'done' : 'waiting')
          setSelectedId(null)
        }}
      >
        <TabsList variant="line" aria-label="Task lists">
          <TabsTrigger value="waiting" count={waiting.length} controls={false}>
            Waiting on you
          </TabsTrigger>
          <TabsTrigger value="done" count={done.length || undefined} controls={false}>
            Done
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-start gap-6 max-lg:flex-col">
        <RecordList
          items={list}
          columns={['Date', 'Task', 'Space', 'Status']}
          className="flex min-w-0 flex-1 flex-col max-lg:w-full"
          headerClassName={`${GRID} border-b border-line px-3 pb-2 ${columnHead}`}
          getKey={(item) => item.id}
          renderRow={(task, index) => {
            const isSelected = task.id === selected?.id
            return (
              <button
                key={task.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(task.id)}
                className={`${GRID} min-h-15 rounded-control px-3 text-left text-sm text-ink transition ${
                  isSelected ? 'bg-tint/5' : 'hover:bg-tint/5'
                } ${index > 0 && !isSelected ? 'border-t border-line' : ''}`}
              >
                <span className="text-ink-soft">Today</span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <IconTile
                    size={32}
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-tint/5 text-brand-fg"
                  >
                    <WorkflowIcon width={16} height={16} />
                  </IconTile>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink-strong">
                      {task.title}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">{task.run.title}</span>
                  </span>
                </span>
                <span>Workflows</span>
                <span className="flex">
                  {decided[task.id] === 'approved' ? (
                    <Pill tone="success">Approved</Pill>
                  ) : decided[task.id] === 'returned' ? (
                    <Pill tone="neutral">Sent back</Pill>
                  ) : (
                    <Pill tone="warning">Needs approval</Pill>
                  )}
                </span>
              </button>
            )
          }}
          empty={
            list.length === 0 && (
              <p className="px-3 py-8 text-sm text-ink-soft">
                {tab === 'waiting'
                  ? `Nothing in ${tenant.name} is waiting on you.`
                  : 'Nothing decided in this session yet.'}
              </p>
            )
          }
        />

        {selected && (
          <aside
            aria-label="Task details"
            className={`${card} flex w-100 shrink-0 flex-col px-5 pt-4 pb-5 max-lg:w-full`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-strong">Approval</span>
              {!decided[selected.id] && <Pill tone="warning">Needs approval</Pill>}
              <span className="flex-1" />
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedId(null)}
                className="-mr-2.5 grid size-11 place-items-center rounded-full text-ink-soft transition hover:bg-tint/8 hover:text-ink-strong"
              >
                <XIcon width={18} height={18} />
              </button>
            </div>
            <h2 className="mt-1 text-[26px] leading-tight font-normal text-ink-strong">
              {selected.title}
            </h2>

            <ol className="mt-4.5 flex flex-col gap-3.5 border-l-2 border-line pl-4.5">
              <li className="flex flex-col">
                <span className="text-sm font-semibold text-ink-strong">Run started</span>
                <span className="text-xs text-ink-soft">
                  Today · by {selected.run.startedBy.name}
                </span>
              </li>
              <li aria-current="step" className="flex flex-col">
                <span className="text-sm font-bold text-brand-fg">
                  {decided[selected.id] ? 'Decided' : 'Waiting for your approval'}
                </span>
                <span className="text-xs text-ink-soft">
                  {decided[selected.id]
                    ? 'Recorded for this session'
                    : 'The run is paused at this step'}
                </span>
              </li>
            </ol>

            {!decided[selected.id] && (
              <div className="mt-5 flex gap-2">
                <Button
                  variant="primary"
                  icon={<CheckIcon width={16} height={16} strokeWidth={2} />}
                  onClick={() => decide(selected, 'approved')}
                >
                  Approve
                </Button>
                <Button onClick={() => decide(selected, 'returned')}>Send back</Button>
              </div>
            )}

            <DescriptionList
              className="mt-5 flex flex-col border-t border-line pt-3 text-sm"
              rowClassName="flex justify-between gap-4 py-1.5"
              termClassName="text-ink-soft"
              detailClassName="text-right font-semibold text-ink-strong"
              rows={[
                ['Run', selected.run.title],
                ['Stage', selected.stage],
                ['Requested by', `${selected.run.startedBy.name}, ${selected.run.startedBy.role}`],
                ['Tenant', tenant.name],
              ]}
            />

            {!decided[selected.id] && (
              <label className="mt-3.5 flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
                Note for {selected.run.startedBy.name.split(' ')[0]}
                <Textarea rows={3} placeholder="Optional. Sent with your decision." />
              </label>
            )}

            <Link
              variant="plain"
              href={`${base}/${selected.run.path}`}
              className={`${textLink} mt-4`}
            >
              Open the run
            </Link>
          </aside>
        )}
      </div>
    </div>
  )
}
