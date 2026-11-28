import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Omnibox } from '../../components/omnibox'
import { RecordList } from '../../components/record-list'
import { SectionCard } from '../../components/section-card'
import { APP_NAME, DEMO_USER } from '../../fixtures/platform/user'
import { Button, ButtonLink } from '../../primitives/button'
import { EyeIcon, EyeOffIcon, HomeIcon } from '../../primitives/icons'
import { Link } from '../../primitives/link'
import { Pill } from '../../primitives/pill'
import { SegmentedControl } from '../../primitives/segmented-control'
import { StatTile } from '../../primitives/stat-tile'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../primitives/tabs'
import { usePlatform } from '../app-shell/platform-context'
import { LineChart } from '../insights/charts'
import { FIRST_DAY, LAST_DAY, insightsFor } from '../insights/insights-data'
import {
  AREAS,
  GROUPS,
  NEEDS,
  OVERVIEW_ACTIONS,
  RECENT,
  areasFor,
  hrefFor,
  type AreaId,
  type Kind,
  type Need,
} from './overview-data'

type Tab = 'overview' | AreaId

const HIDDEN = '•••'
const card = 'rounded-xl border border-line bg-panel-solid shadow-sm shadow-(color:--shadow-soft)'
const statTone = { good: 'text-success-fg', bad: 'text-danger-fg', warn: 'text-caution' }

/** A key cap, for the band's search and the Sections list. */
function Key({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return (
    <kbd
      aria-hidden="true"
      className={`inline-grid h-5 min-w-5 shrink-0 place-items-center rounded-[5px] border px-1.5 font-sans text-[10.5px] font-extrabold ${
        inverse
          ? 'border-white/25 bg-white/10 text-brand-100'
          : 'border-line bg-tint/4 text-ink-soft'
      }`}
    >
      {children}
    </kbd>
  )
}

/** The round glyph an area wears in the Sections list and on its tab's card. */
function Coin({ id, size = 26 }: { id: AreaId; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center rounded-full border-[1.5px] ${
        id === 'chat'
          ? 'border-brand-solid bg-brand-solid text-on-brand-solid'
          : 'border-line text-ink'
      }`}
    >
      {AREAS[id].icon(size > 30 ? 16 : 13)}
    </span>
  )
}

export type OverviewPageProps = {
  /** The tab the page opens on. Default the Overview. */
  initialTab?: Tab
}

/**
 * A tenant's landing page: a greeting with one field that asks or jumps, the
 * sections as tabs with what waits in each, quick actions, and what you had
 * open. Each tab narrows the page to one section.
 */
export function OverviewPage({ initialTab = 'overview' }: OverviewPageProps) {
  const { tenant, base, tasks, go } = usePlatform()
  const areas = useMemo(() => areasFor(tenant), [tenant])
  const has = (id: AreaId) => areas.some((a) => a.id === id)
  const [tab, setTab] = useState<Tab>(initialTab)
  const current: Tab = tab === 'overview' || has(tab) ? tab : 'overview'
  const [hide, setHide] = useState(false)
  const [filter, setFilter] = useState<'all' | Kind>('all')
  const [query, setQuery] = useState('')
  const first = DEMO_USER.name.split(' ')[0]
  const masked = (value: string) => (hide ? HIDDEN : value)

  // Number keys open a section, as the Sections card says; never while typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"], dialog')) return
      const n = Number(event.key)
      if (!Number.isInteger(n) || n < 1 || n > areas.length) return
      setTab(areas[n - 1].id)
      setFilter('all')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [areas])

  const needs: Need[] = [
    ...(has('workflows') && tasks.length > 0
      ? [
          {
            area: 'workflows' as const,
            pill: 'Approval',
            tone: 'warning' as const,
            title: `${tasks.length === 1 ? 'One run is' : `${tasks.length} runs are`} paused for your approval`,
            meta: 'Workflows Studio · 40 min ago',
            action: 'Review',
          },
        ]
      : []),
    ...NEEDS.filter((n) => has(n.area)),
  ]
  const shownNeeds = needs.filter((n) => (current === 'overview' ? !n.minor : n.area === current))
  const needHref = (n: Need) =>
    n.area === 'workflows' ? `${base}/tasks` : hrefFor(base, AREAS[n.area].path)

  const rows = RECENT.filter((r) => has(r.area))
    .filter((r) => current === 'overview' || r.area === current)
    .filter((r) => filter === 'all' || r.kind === filter)

  // The search: "Ask Acme" first, then any action whose words all match.
  const q = query.trim().toLowerCase()
  const matches = q
    ? areas
        .flatMap((a) => a.actions.map((action) => ({ area: a, action })))
        .filter(({ area, action }) =>
          q
            .split(/\s+/)
            .every((word) =>
              `${action.label} ${area.name} ${area.short}`.toLowerCase().includes(word),
            ),
        )
        .slice(0, 5)
    : []

  const quality = useMemo(() => insightsFor({ id: 'custom', from: FIRST_DAY, to: LAST_DAY }), [])
  const lowest = Math.min(...quality.feedback.helpful)
  const lowestDay = quality.labels[quality.feedback.helpful.indexOf(lowest)]

  const area = current === 'overview' ? null : AREAS[current]
  const group = area ? GROUPS.find((g) => g.ids.includes(area.id))! : null
  const siblings = group?.ids.filter((id) => id !== area?.id && has(id)).map((id) => AREAS[id].name)
  const actions = area
    ? area.actions.map((a) => ({ label: a.label, href: hrefFor(base, a.path) }))
    : OVERVIEW_ACTIONS.filter((a) => has(a.area)).map((a) => ({
        label: a.label,
        href: hrefFor(base, a.path),
      }))

  const pick = (next: Tab) => {
    setTab(next)
    setFilter('all')
  }

  return (
    <div className="@container min-h-full bg-canvas">
      <section className="bg-brand-900 px-6 pt-11 pb-[76px] text-white dark:border-b dark:border-line dark:bg-panel-solid">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-[18px] text-center">
          <span className="text-[10.5px] font-extrabold tracking-[0.08em] text-brand-200 uppercase">
            Home
          </span>
          <h1 className="text-4xl leading-tight font-light tracking-tight">Where to, {first}?</h1>
          <Omnibox
            tone="inverse"
            label={`Ask ${APP_NAME}, or jump to a section`}
            placeholder={`Ask ${APP_NAME}, or jump: “upload”, “audit”, “new workflow”`}
            value={query}
            onValueChange={setQuery}
            shortcut="k"
            suffix={
              <span className="max-sm:hidden">
                <Key inverse>⌘K</Key>
              </span>
            }
            hints={null}
            className="w-full text-left"
            groups={
              q
                ? [
                    {
                      id: 'ask',
                      label: 'Ask',
                      items: [
                        {
                          id: 'ask',
                          label: `Ask ${APP_NAME}: “${query.trim()}”`,
                          onSelect: () => go(`${base}/chat`),
                        },
                      ],
                    },
                    ...(matches.length
                      ? [
                          {
                            id: 'go',
                            label: 'Go to',
                            items: matches.map(({ area: a, action }) => ({
                              id: `${a.id}-${action.label}`,
                              label: action.label,
                              hint: a.name,
                              onSelect: () => go(hrefFor(base, action.path)),
                            })),
                          },
                        ]
                      : []),
                  ]
                : []
            }
          />
        </div>
      </section>

      <Tabs value={current} onValueChange={(v) => v && pick(v as Tab)} activationMode="manual">
        <div className="relative z-[2] -mt-12 flex justify-center px-4">
          <TabsList
            variant="unstyled"
            aria-label="Sections"
            className="flex max-w-full items-stretch gap-[3px] overflow-x-auto rounded-[14px] border border-line bg-panel-solid p-1.5 shadow-[0_14px_36px_-16px_var(--shadow-menu)]"
          >
            {(['overview', ...areas.map((a) => a.id)] as Tab[]).map((id, i, all) => {
              const prev = all[i - 1]
              const newGroup =
                i > 0 &&
                (prev === 'overview' ||
                  GROUPS.find((g) => g.ids.includes(prev as AreaId)) !==
                    GROUPS.find((g) => g.ids.includes(id as AreaId)))
              const waiting = id === 'overview' ? 0 : needs.filter((n) => n.area === id).length
              const label = id === 'overview' ? 'Overview' : AREAS[id].short
              return (
                <Fragment key={id}>
                  {newGroup && (
                    <span aria-hidden="true" className="mx-1 my-2.5 w-px shrink-0 bg-line" />
                  )}
                  <TabsTrigger
                    value={id}
                    controls={false}
                    title={id === 'overview' ? 'Overview' : AREAS[id].name}
                    aria-label={
                      waiting && current !== id ? `${label}, ${waiting} waiting` : undefined
                    }
                    className={`relative flex min-w-[84px] flex-col items-center gap-1.5 rounded-[10px] px-2.5 pt-[11px] pb-[9px] text-[12.5px] font-extrabold transition-colors @max-[1000px]:min-w-[62px] @max-[1000px]:px-1 @max-[1000px]:text-[11.5px] ${
                      current === id
                        ? 'bg-brand-solid text-on-brand-solid'
                        : 'text-ink-soft hover:bg-tint/6 hover:text-ink-strong'
                    }`}
                  >
                    <span aria-hidden="true">
                      {id === 'overview' ? <HomeIcon width={20} height={20} /> : AREAS[id].icon(20)}
                    </span>
                    {label}
                    {waiting > 0 && current !== id && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 right-2.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-notify px-1 text-[10.5px] leading-none font-extrabold text-on-notify"
                      >
                        {waiting}
                      </span>
                    )}
                  </TabsTrigger>
                </Fragment>
              )
            })}
          </TabsList>
        </div>
        <p className="mt-3 text-center text-[12.5px] text-ink-soft">
          {area
            ? `Showing ${area.name} only.`
            : `${areas.length} sections, grouped by what they are for.`}
        </p>

        <TabsContent
          value={current}
          aria-label={area?.name ?? 'Overview'}
          className="!mt-0 outline-none"
        >
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-7 pt-7 pb-18 max-md:px-4">
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((a, i) => (
                <ButtonLink key={a.label} href={a.href} variant={i === 0 ? 'primary' : 'secondary'}>
                  {a.label}
                </ButtonLink>
              ))}
              <span className="flex-1" />
              <Button variant="ghost" aria-pressed={hide} onClick={() => setHide(!hide)}>
                {hide ? <EyeIcon width={14} height={14} /> : <EyeOffIcon width={14} height={14} />}
                {hide ? 'Show numbers' : 'Hide numbers'}
              </Button>
            </div>

            {area && group ? (
              <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start gap-5 @max-[1000px]:grid-cols-1">
                <SectionCard
                  title={
                    <span className="inline-flex items-center gap-2.5">
                      <Coin id={area.id} size={34} />
                      {area.name}
                    </span>
                  }
                  description={area.line}
                  action={
                    <Link href={hrefFor(base, area.path)} className="text-[13px]">
                      Open {area.name} ›
                    </Link>
                  }
                  className="bg-panel-solid"
                >
                  <StatTile
                    className="flex flex-col-reverse gap-1.5 px-5 py-[18px]"
                    label={area.headline.label}
                    labelClassName="text-xs font-semibold text-ink-soft"
                    value={masked(area.headline.value)}
                    unit={hide ? undefined : area.headline.unit}
                    valueClassName="text-[34px] leading-none font-semibold tracking-tight text-ink-strong tabular-nums"
                  />
                  <dl className="grid grid-cols-2 gap-4 border-t border-line px-5 py-4">
                    {area.stats.map((s) => (
                      <div key={s.label} className="flex flex-col gap-1">
                        <dt className="text-xs font-semibold text-ink-soft">{s.label}</dt>
                        <dd
                          className={`text-[17px] font-bold tabular-nums ${s.tone ? statTone[s.tone] : 'text-ink-strong'}`}
                        >
                          {area.id === 'workflows' && s.label === 'Waiting on you'
                            ? masked(String(tasks.length))
                            : masked(s.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </SectionCard>
                <SectionCard
                  title="Needs you"
                  description={`${shownNeeds.length} here`}
                  className="bg-panel-solid"
                  footer={
                    <div className="flex items-center justify-between gap-2 text-ink-soft">
                      <span>
                        Also in {group.label}:{' '}
                        {siblings?.length ? siblings.join(', ') : 'nothing else'}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => pick('overview')}>
                        Overview
                      </Button>
                    </div>
                  }
                >
                  {shownNeeds.length ? (
                    <ul>
                      {shownNeeds.map((n, i) => (
                        <NeedItem key={n.title} need={n} href={needHref(n)} divided={i > 0} />
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-4 text-[13px] text-ink-soft">
                      Nothing in {area.name} is waiting on you.
                    </p>
                  )}
                </SectionCard>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start gap-5 @max-[1000px]:grid-cols-1">
                  {has('insights') ? (
                    <section aria-labelledby="overview-quality" className={`${card} flex flex-col`}>
                      <div className="flex items-start justify-between gap-3 px-[18px] pt-[18px]">
                        <div className="flex flex-col gap-2">
                          <h2
                            id="overview-quality"
                            className="text-[15px] font-extrabold text-ink-strong"
                          >
                            Answer quality
                          </h2>
                          <span className="text-[34px] leading-none font-semibold tracking-tight text-ink-strong tabular-nums">
                            {masked(quality.feedback.helpfulAvg.toFixed(1))}
                            {!hide && <span className="text-[17px]">%</span>}
                          </span>
                        </div>
                        <Link href={`${base}/insights`} className="text-[13px]">
                          Insights ›
                        </Link>
                      </div>
                      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-[18px] pt-2.5 text-[12.5px] font-bold">
                        <span className="text-ink-soft">Rated helpful, last 30 days</span>
                        <span className="text-danger-fg">
                          Lowest {lowestDay}: {masked(`${lowest.toFixed(1)}%`)}
                        </span>
                      </div>
                      <div className="px-[18px] pt-3.5 pb-4">
                        {hide ? (
                          <p className="py-16 text-center text-[13px] text-ink-soft">
                            Numbers are hidden.
                          </p>
                        ) : (
                          <LineChart
                            label={`Answer quality, last 30 days: averaging ${quality.feedback.helpfulAvg.toFixed(1)} percent, lowest on ${lowestDay}`}
                            series={[{ name: 'Rated helpful', values: quality.feedback.helpful }]}
                            labels={quality.labels}
                            min={90}
                            max={96}
                            ticks={[90, 93, 96]}
                            format={(v) => `${v.toFixed(v % 1 ? 1 : 0)}%`}
                            height={150}
                            area
                          />
                        )}
                      </div>
                    </section>
                  ) : (
                    <section aria-labelledby="overview-welcome" className={`${card} p-[18px]`}>
                      <h2
                        id="overview-welcome"
                        className="text-[15px] font-extrabold text-ink-strong"
                      >
                        Answer quality
                      </h2>
                      <p className="mt-2 text-[13px] text-ink-soft">
                        {tenant.name} doesn’t have Insights. Ask your tenant admin to add it to see
                        how answers are rated.
                      </p>
                    </section>
                  )}

                  <section aria-labelledby="overview-sections" className={card}>
                    <div className="flex items-center justify-between gap-3 px-[18px] pt-4">
                      <h2
                        id="overview-sections"
                        className="text-[15px] font-extrabold text-ink-strong"
                      >
                        Sections
                      </h2>
                      <span className="text-xs text-ink-soft">
                        Press <Key>1</Key>–<Key>{areas.length}</Key>
                      </span>
                    </div>
                    <div className="flex flex-col px-[18px] pb-3">
                      {GROUPS.filter((g) => g.ids.some(has)).map((g) => (
                        <Fragment key={g.label}>
                          <span className="pt-2.5 pb-0.5 text-[10.5px] font-extrabold tracking-[0.08em] text-ink-soft uppercase">
                            {g.label}
                          </span>
                          {g.ids.filter(has).map((id) => {
                            const a = AREAS[id]
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => pick(id)}
                                className="-mx-1.5 flex min-h-10 items-center gap-2.5 rounded-control px-1.5 text-left text-ink transition hover:bg-tint/5"
                              >
                                <Key>{areas.findIndex((x) => x.id === id) + 1}</Key>
                                <Coin id={id} />
                                <span className="min-w-0 flex-1 text-[13.5px] font-semibold">
                                  {a.name}
                                  {a.alert && (
                                    <span
                                      role="img"
                                      aria-label="Needs attention"
                                      className="ml-1.5 inline-block size-[7px] rounded-full bg-danger-fg align-middle"
                                    />
                                  )}
                                </span>
                                <span className="text-[13.5px] font-bold whitespace-nowrap text-ink-strong tabular-nums">
                                  {masked(a.value)}
                                  {!hide && (
                                    <small className="ml-1 text-[11.5px] font-semibold text-ink-soft">
                                      {a.unit}
                                    </small>
                                  )}
                                </span>
                              </button>
                            )
                          })}
                        </Fragment>
                      ))}
                    </div>
                  </section>
                </div>

                <section aria-labelledby="overview-needs" className={`${card} overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 px-[18px] pt-4">
                    <h2 id="overview-needs" className="text-[15px] font-extrabold text-ink-strong">
                      Needs you
                    </h2>
                    <span className="text-xs text-ink-soft">
                      {shownNeeds.length} across all sections
                    </span>
                  </div>
                  {shownNeeds.length ? (
                    <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                      {shownNeeds.map((n) => (
                        <NeedItem key={n.title} need={n} href={needHref(n)} tile />
                      ))}
                    </ul>
                  ) : (
                    <p className="px-[18px] py-4 text-[13px] text-ink-soft">
                      Nothing in {tenant.name} is waiting on you.
                    </p>
                  )}
                </section>
              </>
            )}

            <section aria-labelledby="overview-recent" className="mt-2 flex flex-col gap-2.5">
              <h2 id="overview-recent" className="text-lg font-bold text-ink-strong">
                Pick up where you left off
              </h2>
              <SegmentedControl
                label="Filter recent items"
                value={filter}
                onValueChange={(v) => setFilter(v as typeof filter)}
                className="self-start"
                options={[
                  { value: 'all', label: 'Recent' },
                  { value: 'chat', label: 'Conversations' },
                  { value: 'runs', label: 'Runs' },
                  { value: 'drafts', label: 'Drafts' },
                ]}
              />
              <RecordList
                items={rows}
                columns={['Date', 'Item', 'Section', 'Status']}
                className="flex flex-col"
                headerClassName="grid grid-cols-[100px_minmax(0,2.4fr)_minmax(0,1.2fr)_130px] items-center gap-4 border-b border-line py-2 text-xs font-bold text-ink-soft @max-[700px]:hidden"
                getKey={(r) => r.name}
                renderRow={(r) => (
                  <Link
                    variant="plain"
                    key={r.name}
                    href={hrefFor(base, AREAS[r.area].path)}
                    className="grid min-h-12 grid-cols-[100px_minmax(0,2.4fr)_minmax(0,1.2fr)_130px] items-center gap-4 border-b border-line/60 text-[13.5px] text-ink transition hover:bg-tint/4 @max-[700px]:grid-cols-[minmax(0,1fr)_auto] @max-[700px]:py-2"
                  >
                    <span className="text-ink-soft @max-[700px]:hidden">{r.when}</span>
                    <span className="truncate font-bold text-ink-strong">{r.name}</span>
                    <span className="@max-[700px]:hidden">{AREAS[r.area].name}</span>
                    <span className="flex">
                      <Pill tone={r.tone}>{r.status}</Pill>
                    </span>
                  </Link>
                )}
                empty={
                  rows.length === 0 && (
                    <p className="py-4 text-[13px] text-ink-soft">Nothing recent here.</p>
                  )
                }
              />
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NeedItem({
  need,
  href,
  tile = false,
  divided = false,
}: {
  need: Need
  href: string
  tile?: boolean
  divided?: boolean
}) {
  return (
    <li
      className={`flex min-w-0 flex-col gap-2 ${
        tile ? 'px-[18px] py-4 shadow-[-1px_0_0_var(--line)]' : 'px-5 py-3.5'
      } ${divided ? 'border-t border-line' : ''}`}
    >
      <Pill tone={need.tone} className="self-start">
        {need.pill}
      </Pill>
      <span className="text-sm font-extrabold text-ink-strong">{need.title}</span>
      <span className="flex items-center justify-between gap-2 text-xs text-ink-soft">
        {need.meta}
        <Link href={href} className="text-[13px] whitespace-nowrap">
          {need.action} ›
        </Link>
      </span>
    </li>
  )
}
