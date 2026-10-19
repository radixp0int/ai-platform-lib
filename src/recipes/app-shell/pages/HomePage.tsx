import { useState, type ReactNode } from 'react'
import { PageHeader } from '../../../components/page-header'
import { RecordList } from '../../../components/record-list'
import { recentChats } from '../../../fixtures/platform/recentChats'
import { SPACE_LABEL, SPACE_ORDER, type SpaceId } from '../../../fixtures/platform/tenants'
import { APP_NAME, DEMO_USER } from '../../../fixtures/platform/user'
import { ButtonLink } from '../../../primitives/button'
import { IconTile } from '../../../primitives/icon-tile'
import {
  ChatIcon,
  ChevronRightIcon,
  IngestionIcon,
  InsightsIcon,
  PlugIcon,
  WorkflowIcon,
} from '../../../primitives/icons'
import { Link } from '../../../primitives/link'
import { Pill } from '../../../primitives/pill'
import { SegmentedControl } from '../../../primitives/segmented-control'
import { StatTile } from '../../../primitives/stat-tile'
import { usePlatform } from '../platform-context'
import { card, columnHead, pageColumn, sectionTitle, textLink } from './pageStyles'

const SPACE_ICON: Record<SpaceId, ReactNode> = {
  chat: <ChatIcon width={17} height={17} />,
  workflows: <WorkflowIcon width={17} height={17} />,
  insights: <InsightsIcon width={17} height={17} />,
  ingestion: <IngestionIcon width={17} height={17} />,
}

type Activity = {
  id: string
  when: string
  name: string
  space: SpaceId
  status: ReactNode
  href: string
}

type Filter = 'all' | SpaceId

/** A tenant's landing page: what needs you, where you can go, what you had open. */
export function HomePage() {
  const { tenant, base, runs, tasks } = usePlatform()
  const [filter, setFilter] = useState<Filter>('all')
  const has = (space: SpaceId) => tenant.spaces.includes(space)
  const firstName = DEMO_USER.name.split(' ')[0]

  const spaceNote: Record<SpaceId, string> = {
    chat: `Last conversation ${recentChats[0]?.date ?? 'not yet'}`,
    workflows:
      tasks.length > 0
        ? `${tasks.length} ${tasks.length === 1 ? 'run needs' : 'runs need'} your approval`
        : 'No runs are waiting on you',
    insights: 'Usage and top questions',
    ingestion: 'Documents and API sources',
  }

  const activity: Activity[] = [
    ...runs.map((run) => ({
      id: run.id,
      when: 'Today',
      name: run.title,
      space: 'workflows' as const,
      status:
        run.status === 'waiting' ? (
          <Pill tone="warning">Needs approval</Pill>
        ) : (
          <Pill tone="brand">Running</Pill>
        ),
      href: `${base}/${run.path}`,
    })),
    ...(has('chat')
      ? recentChats.slice(0, 3).map((chat) => ({
          id: chat.id,
          when: chat.date,
          name: chat.title,
          space: 'chat' as const,
          status: <Pill tone="neutral">Conversation</Pill>,
          href: `${base}/chat`,
        }))
      : []),
  ]
  const shown = filter === 'all' ? activity : activity.filter((item) => item.space === filter)
  const filters: Filter[] = [
    'all',
    ...SPACE_ORDER.filter((space) => space === 'chat' || space === 'workflows').filter(has),
  ]

  return (
    <div className={`${pageColumn} max-w-[67.5rem] gap-6`}>
      <PageHeader
        title={<>Welcome, {firstName}</>}
        className="flex flex-col gap-1"
        descriptionClassName="text-[15px] text-ink-soft"
        description={
          <>
            {tasks.length > 0
              ? `${tasks.length === 1 ? 'One run is' : `${tasks.length} runs are`} waiting on your approval.`
              : `Nothing in ${tenant.name} is waiting on you.`}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {has('chat') && (
          <ButtonLink href={`${base}/chat`} variant="primary" size="lg">
            <ChatIcon width={16} height={16} />
            Ask {APP_NAME}
          </ButtonLink>
        )}
        {has('workflows') && (
          <ButtonLink href={`${base}/workflows`} variant="secondary" size="lg">
            <WorkflowIcon width={16} height={16} className="text-ink-soft" />
            Open workflows
          </ButtonLink>
        )}
        {has('ingestion') && (
          <>
            <ButtonLink href={`${base}/ingestion/new`} variant="secondary" size="lg">
              <IngestionIcon width={16} height={16} className="text-ink-soft" />
              Upload documents
            </ButtonLink>
            <ButtonLink href={`${base}/ingestion/new`} variant="secondary" size="lg">
              <PlugIcon width={16} height={16} className="text-ink-soft" />
              Connect an API
            </ButtonLink>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        {has('workflows') && (
          <section className={`${card} flex flex-col px-5 pt-4.5 pb-1`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink-strong">Waiting on you</h2>
              <Link variant="plain" href={`${base}/tasks`} className={textLink}>
                Open Tasks <ChevronRightIcon width={14} height={14} />
              </Link>
            </div>
            <StatTile
              value={tasks.length}
              label={<>{tasks.length === 1 ? 'approval' : 'approvals'} across Workflows</>}
              className="mt-1.5 mb-3 flex items-baseline gap-2.5"
              valueClassName="text-[40px] leading-none font-normal text-ink-strong tabular-nums"
              labelClassName="text-sm text-ink-soft"
            />
            {tasks.map((task) => (
              <div key={task.id} className="flex min-h-15 items-center gap-3 border-t border-line">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-strong">
                    {task.run.title}
                  </span>
                  <span className="block truncate text-xs text-ink-soft">
                    {task.title} · from {task.run.startedBy.name}
                  </span>
                </span>
                <ButtonLink href={`${base}/tasks`} variant="secondary" size="lg">
                  Review
                </ButtonLink>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="border-t border-line py-4 text-sm text-ink-soft">
                Approvals from this tenant's runs will show up here.
              </p>
            )}
          </section>
        )}

        <section className={`${card} flex flex-col px-5 pt-4.5 pb-1`}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink-strong">Spaces</h2>
            <span className="text-xs text-ink-soft">Set by your tenant admin</span>
          </div>
          {SPACE_ORDER.filter(has).map((space, index) => (
            <Link
              variant="plain"
              key={space}
              href={`${base}/${space}`}
              className={`flex min-h-13 items-center gap-3 text-ink ${index > 0 ? 'border-t border-line' : ''}`}
            >
              <IconTile
                size={36}
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full bg-tint/5 text-brand-fg"
              >
                {SPACE_ICON[space]}
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-strong">
                  {SPACE_LABEL[space]}
                </span>
                <span className="block truncate text-xs text-ink-soft">{spaceNote[space]}</span>
              </span>
              <ChevronRightIcon width={16} height={16} className="shrink-0 text-ink-soft" />
            </Link>
          ))}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className={sectionTitle}>Recent activity</h2>
        {filters.length > 2 && (
          <SegmentedControl
            label="Filter recent activity"
            value={filter}
            onValueChange={(value) => setFilter(value as Filter)}
            options={filters.map((option) => ({
              value: option,
              label: option === 'all' ? 'Recent' : option === 'chat' ? 'Conversations' : 'Runs',
            }))}
          />
        )}
        <RecordList
          items={shown}
          columns={['Date', 'Name', 'Space', 'Status']}
          className="flex flex-col"
          headerClassName={`grid grid-cols-[7.5rem_minmax(0,2.4fr)_minmax(0,1fr)_9.5rem] items-center gap-x-4 border-b border-line px-3 pb-2 ${columnHead}`}
          getKey={(item) => item.id}
          renderRow={(item, index) => (
            <Link
              variant="plain"
              key={`${item.space}-${item.id}`}
              href={item.href}
              className={`grid min-h-13 grid-cols-[7.5rem_minmax(0,2.4fr)_minmax(0,1fr)_9.5rem] items-center gap-x-4 px-3 text-sm text-ink transition hover:bg-tint/5 ${
                index > 0 ? 'border-t border-line' : ''
              }`}
            >
              <span className="text-ink-soft">{item.when}</span>
              <span className="flex min-w-0 items-center gap-2.5">
                <IconTile
                  size={32}
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-tint/5 text-brand-fg [&_svg]:size-4"
                >
                  {SPACE_ICON[item.space]}
                </IconTile>
                <span className="truncate font-semibold text-ink-strong">{item.name}</span>
              </span>
              <span>{SPACE_LABEL[item.space]}</span>
              <span className="flex">{item.status}</span>
            </Link>
          )}
          empty={
            shown.length === 0 && (
              <p className="px-3 py-6 text-sm text-ink-soft">Nothing opened in this tenant yet.</p>
            )
          }
        />
      </section>
    </div>
  )
}
