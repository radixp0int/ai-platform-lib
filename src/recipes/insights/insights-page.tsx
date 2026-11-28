import { useMemo, useRef, useState, type ReactNode } from 'react'
import { PageBand } from '../../components/page-header'
import { SideDialog } from '../../components/side-dialog'
import { Button, ButtonLink } from '../../primitives/button'
import { Card } from '../../primitives/card'
import { DateRangeField, type DateRange } from '../../primitives/date-field'
import { IconTile } from '../../primitives/icon-tile'
import {
  ChevronDownIcon,
  CircleInfoIcon,
  DownloadIcon,
  InsightsIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  TriangleAlertIcon,
} from '../../primitives/icons'
import { Link } from '../../primitives/link'
import { Pill } from '../../primitives/pill'
import { Popover } from '../../primitives/popover'
import { SegmentedControl } from '../../primitives/segmented-control'
import { StatTile, type StatTileChange } from '../../primitives/stat-tile'
import { Tooltip } from '../../primitives/tooltip'
import { BarList, ColumnChart, LineChart, LineKey, type LineSeries } from './charts'
import {
  COMMENTS,
  ERROR_EXAMPLES,
  FIRST_DAY,
  LAST_DAY,
  SUITES,
  SUITE_TARGET,
  dayIndex,
  fmt,
  insightsFor,
  type ErrorTypeId,
  type InsightsRange,
  type RangeId,
} from './insights-data'

/** The page's sections, by the id the jump links and tile footers scroll to. */
const SECTION = {
  evaluation: 'insights-evaluation',
  feedback: 'insights-feedback',
  errors: 'insights-errors',
} as const

const column = 'mx-auto w-full max-w-[1180px] px-8 max-md:px-4'
const grid4 = 'grid grid-cols-4 gap-4 @max-[900px]:grid-cols-2 @max-[420px]:grid-cols-1'
const grid3 =
  'grid grid-cols-3 items-stretch gap-4 @max-[1100px]:grid-cols-2 @max-[640px]:grid-cols-1'
const span2 = 'col-span-2 @max-[640px]:col-span-1'
const DASHES: LineSeries['dash'][] = ['solid', 'dashed', 'dotted']

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** A tile footer that scrolls to a section further down. */
function JumpLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a
      href={`#${to}`}
      onClick={(event) => {
        event.preventDefault()
        scrollTo(to)
      }}
      className="font-bold text-accent-fg hover:underline hover:underline-offset-3"
    >
      {children} <span aria-hidden="true">↓</span>
    </a>
  )
}

/** A label with a small "i" that explains the figure on hover or focus. */
function Explained({ label, info }: { label: string; info: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <Tooltip content={<span className="block max-w-56 font-semibold">{info}</span>}>
        <button
          type="button"
          aria-label={`About ${label.toLowerCase()}: ${info}`}
          className="inline-grid size-4 place-items-center rounded-full text-ink-soft hover:text-ink-strong"
        >
          <CircleInfoIcon width={14} height={14} />
        </button>
      </Tooltip>
    </span>
  )
}

function SectionHead({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string
  icon: ReactNode
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <IconTile tone="soft" size={40} aria-hidden="true">
          {icon}
        </IconTile>
        <div className="flex min-w-0 flex-col">
          <h2 id={`${id}-title`} className="text-lg font-extrabold tracking-tight text-ink-strong">
            {title}
          </h2>
          <p className="text-[12.5px] text-ink-soft">{description}</p>
        </div>
      </div>
      {children && <div className="flex items-center gap-3.5">{children}</div>}
    </div>
  )
}

function Section({
  id,
  banded = false,
  children,
}: {
  id: string
  banded?: boolean
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-4 ${banded ? 'border-y border-line bg-tint/3' : ''}`}
    >
      <div className={`${column} flex flex-col gap-4 pt-10 pb-11`}>{children}</div>
    </section>
  )
}

function ExportButton({ what }: { what: string }) {
  return (
    <Button variant="secondary" aria-label={`Export ${what}`}>
      <DownloadIcon width={14} height={14} />
      Export
    </Button>
  )
}

const RANGE_OPTIONS: { value: RangeId; label: string }[] = [
  { value: '14d', label: '14 days' },
  { value: '7d', label: '7 days' },
  { value: 'today', label: 'Today' },
  { value: 'custom', label: 'Custom range' },
]

/** The date range in the band: three presets and a custom range in a popover. */
function RangePicker({
  range,
  customLabel,
  onChange,
}: {
  range: InsightsRange
  customLabel: string
  onChange: (range: InsightsRange) => void
}) {
  const anchor = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>({
    from: range.from ?? '2026-11-02',
    to: range.to ?? '2026-11-15',
  })
  const [error, setError] = useState('')
  const apply = () => {
    if (!draft.from || !draft.to) return setError('Pick both dates.')
    const from = dayIndex(draft.from)
    const to = dayIndex(draft.to)
    if (from < 0 || to < 0) return setError('Data goes back to Oct 26 and up to today.')
    if (to - from < 1) return setError('Pick at least two days, the first before the last.')
    setOpen(false)
    onChange({ id: 'custom', from: draft.from, to: draft.to })
  }
  return (
    <div ref={anchor}>
      <SegmentedControl
        label="Date range"
        tone="inverse"
        value={range.id}
        options={RANGE_OPTIONS.map((o) =>
          o.value === 'custom' && range.id === 'custom' ? { ...o, label: customLabel } : o,
        )}
        onValueChange={(value) => {
          if (value === 'custom') {
            setError('')
            setOpen(true)
          } else onChange({ id: value as RangeId })
        }}
      />
      <Popover
        anchor={anchor.current}
        open={open}
        onClose={() => setOpen(false)}
        label="Custom date range"
        width={340}
        align="end"
        className="flex flex-col gap-3 p-4"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-extrabold text-ink-strong">Custom range</span>
          <span className="text-[11.5px] text-ink-soft">Back to Oct 26</span>
        </div>
        <DateRangeField
          label="Dates"
          value={draft}
          min={FIRST_DAY}
          max={LAST_DAY}
          error={error || undefined}
          onChange={(value) => {
            setDraft(value)
            setError('')
          }}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={apply}>
            Apply
          </Button>
        </div>
      </Popover>
    </div>
  )
}

export type InsightsPageProps = {
  /** `/t/<tenant>`, for the links out of the page. */
  base: string
  /** The range the page opens on. Default the last 14 days. */
  initialRange?: InsightsRange
}

/**
 * How the assistant is doing in one tenant: usage at the top, then the three
 * views of a retrieval-augmented answer — how well it was grounded, what
 * people thought of it, and what went wrong.
 */
export function InsightsPage({ base, initialRange = { id: '14d' } }: InsightsPageProps) {
  const [range, setRange] = useState<InsightsRange>(initialRange)
  const w = useMemo(() => insightsFor(range), [range])
  const [hiddenScores, setHiddenScores] = useState<number[]>([])
  const [openSuite, setOpenSuite] = useState<number | null>(1)
  const [commentFilter, setCommentFilter] = useState<'all' | 'down' | 'up'>('all')
  const [reason, setReason] = useState<string | null>(null)
  const [hotType, setHotType] = useState<ErrorTypeId | null>(null)
  const [drawer, setDrawer] = useState<ErrorTypeId | null>(null)

  const { questions, small, evaluation, feedback, errors } = w
  const vs = w.hours ? 'vs yesterday' : 'vs before'
  const comments = COMMENTS.filter(
    (c) =>
      (commentFilter === 'all' || (commentFilter === 'down' ? !c.helpful : c.helpful)) &&
      (!reason || c.reason === reason),
  )
  const hot = errors.types.find((t) => t.id === hotType)
  const drawn = errors.types.find((t) => t.id === drawer)
  const errorPeriod = `${fmt(errors.total)} of ${fmt(questions.total)} answers (${errors.rate}%) had an error in ${w.noun}`
  const by = w.hours ? 'hour' : 'day'

  return (
    <div className="@container min-h-full bg-canvas">
      <PageBand
        title="Insights"
        description="How closely answers stick to the sources, what people think of them, and what went wrong."
        breadcrumbs={[{ label: 'Overview', href: `${base}/home` }, { label: 'Measure' }]}
        actions={
          <>
            <RangePicker
              range={range}
              customLabel={w.short}
              onChange={(next) => {
                setRange(next)
                setHotType(null)
              }}
            />
            <Button variant="inverse" aria-label="Export this page">
              <DownloadIcon width={14} height={14} />
              Export
            </Button>
          </>
        }
        footer={
          <>
            <div className="flex min-w-0 items-center gap-3">
              <IconTile size={36} aria-hidden="true" className="bg-white/12 text-white">
                <InsightsIcon width={18} height={18} />
              </IconTile>
              <div className="flex flex-col">
                <h2 className="text-lg font-extrabold text-white">Overview</h2>
                <p className="text-[12.5px] text-brand-200">Every section at a glance, {w.short}</p>
              </div>
            </div>
            <nav
              aria-label="Sections on this page"
              className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-[13px] font-bold"
            >
              {(
                [
                  [SECTION.evaluation, 'Evaluation scores'],
                  [SECTION.feedback, 'User feedback'],
                  [SECTION.errors, 'Errors in responses'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="inline-flex items-center gap-1.5 text-brand-100 hover:text-white hover:underline hover:underline-offset-3"
                >
                  {id === SECTION.errors && (
                    <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-white/14 px-1.5 text-[11px] font-extrabold text-white">
                      {errors.total}
                    </span>
                  )}
                  {label} <span aria-hidden="true">↓</span>
                </button>
              ))}
            </nav>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div role="group" aria-label={`Overview, ${w.short}`} className={grid4}>
            <StatTile
              size="large"
              className="shadow-[0_14px_36px_-16px_var(--shadow-menu)]"
              label="Questions asked"
              value={fmt(questions.total)}
              change={questions.change}
              sparkline={questions.values}
            />
            <StatTile
              size="large"
              className="shadow-[0_14px_36px_-16px_var(--shadow-menu)]"
              label="Groundedness"
              value={evaluation.scores[0].average.toFixed(1)}
              unit="%"
              change={evaluation.scores[0].change}
              sparkline={evaluation.scores[0].values}
              footer={<JumpLink to={SECTION.evaluation}>Evaluation scores</JumpLink>}
            />
            <StatTile
              size="large"
              className="shadow-[0_14px_36px_-16px_var(--shadow-menu)]"
              label="Rated helpful"
              value={feedback.helpfulAvg.toFixed(1)}
              unit="%"
              change={feedback.helpfulChange}
              sparkline={feedback.helpful}
              footer={<JumpLink to={SECTION.feedback}>User feedback</JumpLink>}
            />
            <StatTile
              size="large"
              className="shadow-[0_14px_36px_-16px_var(--shadow-menu)]"
              label="Responses with errors"
              value={errors.total}
              change={{
                ...errors.change,
                text: (
                  <>
                    {errors.change.text} · {errors.rate}%
                  </>
                ),
              }}
              sparkline={errors.totals}
              footer={<JumpLink to={SECTION.errors}>Errors in responses</JumpLink>}
            />
          </div>
          <div
            role="group"
            aria-label="More numbers"
            className="grid grid-cols-6 gap-4 @max-[1100px]:grid-cols-3 @max-[560px]:grid-cols-2"
          >
            <StatTile
              size="small"
              label="Active users"
              value={w.people.active}
              unit={`of ${w.people.seats}`}
              change={
                w.people.joined == null
                  ? { text: 'No earlier data' }
                  : { text: `${w.people.joined} people`, direction: 'up' }
              }
            />
            <StatTile
              size="small"
              label="Conversations"
              value={fmt(small.conversations)}
              change={questions.change}
            />
            <StatTile
              size="small"
              label="Questions per person"
              value={small.perPerson}
              change={{ text: `${w.people.active} people` }}
            />
            <StatTile
              size="small"
              label="Median response"
              value={small.median.toFixed(1)}
              unit="s"
              change={{ text: small.medianChange, direction: 'down', upIsGood: false }}
            />
            <StatTile
              size="small"
              label="Flagged questions"
              value={small.flagged}
              change={small.flaggedChange}
            />
            <StatTile
              size="small"
              label="Sent to a person"
              value={fmt(small.escalated)}
              change={{
                text: `${((small.escalated / Math.max(1, questions.total)) * 100).toFixed(1)}% of questions`,
              }}
            />
          </div>
          <div className={grid3}>
            <Card
              className={span2}
              headingLevel={3}
              title={w.hours ? 'Questions per hour' : 'Questions per day'}
              description={
                w.hours
                  ? `${fmt(questions.total)} so far today`
                  : `Average ${fmt(questions.average ?? 0)} a day`
              }
            >
              <QuestionsChart w={w} />
            </Card>
            <Card headingLevel={3} title="Top topics" description={`Questions, ${w.short}`}>
              <BarList label="Questions by topic" rows={w.topics} />
            </Card>
          </div>
        </div>
      </PageBand>

      {/* ── Evaluation scores ─────────────────────────────────────────── */}
      <Section id={SECTION.evaluation} banded>
        <SectionHead
          id={SECTION.evaluation}
          icon={<InsightsIcon width={18} height={18} />}
          title="Evaluation scores"
          description="How closely answers stick to the sources, scored on a sample by a second model"
        >
          <Link href={`${base}/evaluations`} className="text-[13px]">
            Open Evaluations Manager ›
          </Link>
          <ExportButton what="evaluation scores" />
        </SectionHead>
        <div role="group" aria-label={`Evaluation scores, ${w.short}`} className={grid4}>
          <StatTile
            size="large"
            label={
              <Explained
                label="Groundedness"
                info="Share of the claims in an answer that the retrieved passages back up."
              />
            }
            value={evaluation.scores[0].average.toFixed(1)}
            unit="%"
            change={evaluation.scores[0].change}
            sparkline={evaluation.scores[0].values}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Answer relevance"
                info="How directly the answer addresses the question, scored by a second model."
              />
            }
            value={evaluation.scores[1].average.toFixed(1)}
            unit="%"
            change={evaluation.scores[1].change}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Retrieval hit rate"
                info="How often the passage holding the answer was in the top five results."
              />
            }
            value={evaluation.hitRate.toFixed(1)}
            unit="%"
            change={{ text: 'Right passage in the top 5' }}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Test suites passing"
                info={`Suites at or above the ${SUITE_TARGET}% pass target in the last run.`}
              />
            }
            value={SUITES.filter((s) => s.passing >= SUITE_TARGET).length}
            unit={`of ${SUITES.length}`}
            change={{
              text: `${SUITES.filter((s) => s.passing < SUITE_TARGET)
                .map((s) => s.name)
                .join(', ')} below target`,
            }}
          />
        </div>
        <div className={grid3}>
          <Card
            className={span2}
            headingLevel={3}
            title="Scores over time"
            description="Hover for the day · press a score to hide it"
          >
            <div role="group" aria-label="Show or hide a score" className="flex flex-wrap gap-2">
              {evaluation.scores.map((score, i) => {
                const hidden = hiddenScores.includes(i)
                return (
                  <button
                    key={score.name}
                    type="button"
                    aria-pressed={!hidden}
                    onClick={() =>
                      setHiddenScores((all) =>
                        hidden
                          ? all.filter((x) => x !== i)
                          : all.length + 1 >= evaluation.scores.length
                            ? all
                            : [...all, i],
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-panel-solid py-1 pr-2.5 pl-2 text-xs text-ink transition hover:bg-tint/6 ${hidden ? 'opacity-45' : ''}`}
                  >
                    <LineKey dash={DASHES[i]} />
                    {score.name}
                    <b className="font-extrabold text-ink-strong tabular-nums">
                      {score.average.toFixed(1)}%
                    </b>
                  </button>
                )
              })}
            </div>
            <LineChart
              label={`Evaluation scores, ${w.short}: ${evaluation.scores
                .map((s) => `${s.name} ${s.average.toFixed(1)} percent`)
                .join(', ')}`}
              series={evaluation.scores
                .map((s, i) => ({ name: s.name, values: s.values, dash: DASHES[i] }))
                .filter((_, i) => !hiddenScores.includes(i))}
              labels={w.labels}
              min={76}
              max={100}
              ticks={[80, 90, 100]}
              format={(v) => `${v.toFixed(v % 1 ? 1 : 0)}%`}
            />
            <p className="text-xs text-ink-soft">{evaluation.note}</p>
          </Card>
          <Card
            headingLevel={3}
            title="Low-scoring answers by source"
            description="Groundedness under 80%"
            footer={
              <p className="text-[12.5px] text-ink-soft">
                One answer in ten is graded. A second model splits each answer into claims and
                checks every claim against the passages retrieved for it.
              </p>
            }
          >
            <BarList label="Low-scoring answers by source" rows={evaluation.lowScoring} />
            <dl className="mt-auto flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-3">
              {[
                ['Answers graded', fmt(evaluation.graded)],
                ['Claims checked', fmt(evaluation.claims)],
                ['Retrieval hit rate', `${evaluation.hitRate.toFixed(1)}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="text-[12.5px] font-bold text-ink-soft">{label}</dt>
                  <dd className="text-2xl font-semibold text-ink-strong tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card
            className="col-span-full"
            headingLevel={3}
            title="Test suites"
            description={`Last run Nov 24, 06:00 · target ${SUITE_TARGET}% · open a suite for its failing cases`}
          >
            <SuiteList
              open={openSuite}
              onToggle={(i) => setOpenSuite(openSuite === i ? null : i)}
            />
          </Card>
        </div>
      </Section>

      {/* ── User feedback ─────────────────────────────────────────────── */}
      <Section id={SECTION.feedback}>
        <SectionHead
          id={SECTION.feedback}
          icon={<ThumbUpIcon width={18} height={18} />}
          title="User feedback"
          description="Thumbs up and down, the reasons people pick, and what they write"
        >
          <ExportButton what="user feedback" />
        </SectionHead>
        <div role="group" aria-label={`User feedback, ${w.short}`} className={grid4}>
          <StatTile
            size="large"
            label={
              <Explained
                label="Rated helpful"
                info="Thumbs up as a share of all thumbs up and down."
              />
            }
            value={feedback.helpfulAvg.toFixed(1)}
            unit="%"
            change={feedback.helpfulChange}
            sparkline={feedback.helpful}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Answers rated"
                info="Share of answers that got a thumbs up or down."
              />
            }
            value={feedback.ratedPct}
            unit="%"
            change={{ text: `${fmt(feedback.up + feedback.down)} ratings` }}
          />
          <StatTile
            size="large"
            label={<Explained label="Not helpful" info="Answers that got a thumbs down." />}
            value={fmt(feedback.down)}
            change={feedback.downChange}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Written comments"
                info="Ratings that came with a written comment."
              />
            }
            value={fmt(feedback.comments)}
            change={{ text: 'Mostly on thumbs-down answers' }}
          />
        </div>
        <div className={grid3}>
          <Card
            className={span2}
            headingLevel={3}
            title="Rated helpful over time"
            description="Share of rated answers"
          >
            <LineChart
              label={`Rated helpful, ${w.short}: averaging ${feedback.helpfulAvg.toFixed(1)} percent`}
              series={[{ name: 'Rated helpful', values: feedback.helpful }]}
              labels={w.labels}
              min={90}
              max={96}
              ticks={[90, 92, 94, 96]}
              format={(v) => `${v.toFixed(v % 1 ? 1 : 0)}%`}
              height={140}
              endMarker
            />
            <p className="text-xs text-ink-soft">{feedback.note}</p>
          </Card>
          <Card
            headingLevel={3}
            title="Ratings"
            description={`${feedback.ratedPct}% of answers rated`}
          >
            <RatingsBar up={feedback.up} down={feedback.down} unrated={feedback.unrated} />
            <p className="text-[12.5px] text-ink-soft">
              {Math.round((feedback.up / Math.max(1, feedback.up + feedback.down)) * 100)}% of rated
              answers were helpful.
            </p>
          </Card>
          <Card
            headingLevel={3}
            title="Why answers weren’t helpful"
            description="Press one to read its comments"
          >
            <BarList
              label="Reasons picked with a thumbs down"
              rows={feedback.reasons.map((r, i) => ({
                ...r,
                rest: i === feedback.reasons.length - 1,
              }))}
              nameWidth="minmax(0,11rem)"
              selected={reason}
              onSelect={(name) => {
                if (reason === name) setReason(null)
                else {
                  setReason(name)
                  setCommentFilter('down')
                }
              }}
            />
          </Card>
          <Card
            className={span2}
            headingLevel={3}
            title="Latest comments"
            headerAction={
              <div className="flex flex-wrap items-center gap-2">
                {reason && (
                  <Pill
                    tone="brand"
                    onClose={() => setReason(null)}
                    closeLabel={`Clear the reason filter: ${reason}`}
                  >
                    {reason}
                  </Pill>
                )}
                <SegmentedControl
                  label="Show comments"
                  value={commentFilter}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'down', label: 'Not helpful' },
                    { value: 'up', label: 'Helpful' },
                  ]}
                  onValueChange={(value) => {
                    setCommentFilter(value as typeof commentFilter)
                    if (value !== 'down') setReason(null)
                  }}
                />
              </div>
            }
          >
            {comments.length > 0 ? (
              <ul
                aria-label="Comments"
                className="grid grid-cols-2 gap-x-7 @max-[900px]:grid-cols-1"
              >
                {comments.map((c) => (
                  <li
                    key={c.text}
                    className="flex min-w-0 items-start gap-3 border-t border-line py-3"
                  >
                    <IconTile
                      size={28}
                      tone={c.helpful ? 'soft' : 'danger'}
                      role="img"
                      aria-label={c.helpful ? 'Helpful' : 'Not helpful'}
                    >
                      {c.helpful ? (
                        <ThumbUpIcon width={15} height={15} />
                      ) : (
                        <ThumbDownIcon width={15} height={15} />
                      )}
                    </IconTile>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="text-[13.5px] text-ink">“{c.text}”</p>
                      <span className="text-xs text-ink-soft">{c.meta}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12.5px] text-ink-soft">
                No comments match.{' '}
                <button
                  type="button"
                  className="font-bold text-accent-fg hover:underline"
                  onClick={() => {
                    setReason(null)
                    setCommentFilter('all')
                  }}
                >
                  Show all
                </button>
              </p>
            )}
          </Card>
        </div>
      </Section>

      {/* ── Errors in responses ───────────────────────────────────────── */}
      <Section id={SECTION.errors} banded>
        <SectionHead
          id={SECTION.errors}
          icon={<TriangleAlertIcon width={18} height={18} />}
          title="Errors in responses"
          description="Answers that went wrong, caught by checks or reported by people"
        >
          <Link href={`${base}/audit`} className="text-[13px]">
            Review queue ›
          </Link>
          <ExportButton what="errors in responses" />
        </SectionHead>
        <div role="group" aria-label={`Errors in responses, ${w.short}`} className={grid4}>
          <StatTile
            size="large"
            label={
              <Explained
                label="Responses with errors"
                info="Answers a check or a person marked as wrong."
              />
            }
            value={errors.total}
            change={errors.change}
            sparkline={errors.totals}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Error rate"
                info="Responses with errors as a share of all answers."
              />
            }
            value={errors.rate.toFixed(1)}
            unit="%"
            change={errors.rateChange}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Most common"
                info="The error type with the most answers in this range."
              />
            }
            value={errors.commonest.name}
            valueClassName="text-xl leading-tight font-bold text-ink-strong"
            change={{
              text: `${errors.commonest.count} answers · ${errors.commonest.share}% of errors`,
            }}
          />
          <StatTile
            size="large"
            label={
              <Explained
                label="Rising fastest"
                info="The error type that grew most against the range before."
              />
            }
            value={errors.rising?.name ?? 'Nothing rising'}
            valueClassName="text-xl leading-tight font-bold text-ink-strong"
            change={
              errors.rising
                ? {
                    text: `${errors.rising.pct}% on ${w.priorNoun}`,
                    direction: 'up',
                    upIsGood: false,
                  }
                : { text: w.hasPrior ? 'Every type held or fell' : 'No earlier data to compare' }
            }
          />
        </div>
        <p className="-mt-1 text-[12.5px] text-ink-soft">{errorPeriod}.</p>
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch gap-4 @max-[900px]:grid-cols-1">
          <Card
            headingLevel={3}
            title={`Errors by ${by}`}
            description={
              hot ? `${hot.name}, against all errors` : `Hover a ${by}, or a type to see its share`
            }
          >
            <div className="@container">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 @max-[680px]:grid-cols-1">
                <ColumnChart
                  label={`Responses with errors by ${by}, ${w.short}: ${w.labels
                    .map((l, j) => `${l} ${errors.totals[j]}`)
                    .join(', ')}`}
                  labels={w.labels}
                  values={errors.totals}
                  part={hot?.series}
                  describe={(j) => (
                    <>
                      <div className="flex justify-between gap-3 font-bold text-ink-strong">
                        <span>{w.hours ? `Today, ${w.labels[j]}` : w.labels[j]}</span>
                        <span className="tabular-nums">{errors.totals[j]}</span>
                      </div>
                      {errors.types.map((t) => (
                        <div key={t.id} className="flex justify-between gap-3 text-ink-soft">
                          <span>{t.name}</span>
                          <span className="tabular-nums">{t.series[j]}</span>
                        </div>
                      ))}
                    </>
                  )}
                />
                <table className="w-full border-collapse text-[13px]">
                  <caption className="sr-only">Errors by type</caption>
                  <thead>
                    <tr className="border-b border-line text-[10.5px] font-extrabold tracking-[0.07em] whitespace-nowrap text-ink-soft uppercase">
                      <th className="px-2 py-2 text-left">Type</th>
                      <th className="px-2 py-2 text-right">Answers</th>
                      <th className="px-2 py-2 text-right">{vs}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.types.map((t) => (
                      <tr
                        key={t.id}
                        onPointerEnter={() => setHotType(t.id)}
                        onPointerLeave={() => setHotType(null)}
                        className={`border-b border-line/60 transition-colors ${hotType === t.id ? 'bg-tint/5' : ''}`}
                      >
                        <td className="px-2 py-2.5">
                          <button
                            type="button"
                            onClick={() => setDrawer(t.id)}
                            onFocus={() => setHotType(t.id)}
                            onBlur={() => setHotType(null)}
                            className="flex flex-col text-left"
                          >
                            <b className="font-bold text-ink-strong hover:underline">{t.name}</b>
                            <span className="text-xs text-ink-soft">{t.note}</span>
                          </button>
                        </td>
                        <td className="px-2 py-2.5 text-right font-bold text-ink-strong tabular-nums">
                          {t.count}
                          <span className="block text-xs font-normal text-ink-soft">
                            {t.share}%
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <ChangeText change={t.change} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
          <div className="grid gap-4 @max-[900px]:grid-cols-2 @max-[420px]:grid-cols-1">
            <StatTile
              size="small"
              label="Waiting for review"
              value={errors.pending}
              change={{ text: w.hours ? 'Oldest is 5 hours old' : 'Oldest is 2 days old' }}
              footer={
                <Link href={`${base}/audit`} className="text-xs">
                  Review ›
                </Link>
              }
            />
            <StatTile
              size="small"
              label="Caught before sending"
              value={errors.caught}
              change={{ text: 'Held back and answered again' }}
            />
            <StatTile
              size="small"
              label="Reported by people"
              value={errors.reported}
              change={{ text: 'Came in with a thumbs down' }}
            />
            <StatTile
              size="small"
              label="Fixed at the source"
              value={errors.fixed}
              change={{ text: 'Documents updated or synced again' }}
            />
          </div>
        </div>
      </Section>

      <SideDialog
        open={drawn != null}
        onClose={() => setDrawer(null)}
        title={drawn?.name ?? 'Examples'}
        description={drawn?.note}
        width="30rem"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDrawer(null)}>
              Close
            </Button>
            <ButtonLink variant="primary" href={`${base}/audit`}>
              Open in review queue
            </ButtonLink>
          </div>
        }
      >
        {drawn && (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-3 gap-3">
              {[
                ['Answers', String(drawn.count)],
                ['Share of errors', `${drawn.share}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="text-xs font-bold text-ink-soft">{label}</dt>
                  <dd className="text-2xl font-semibold text-ink-strong tabular-nums">{value}</dd>
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-bold text-ink-soft">{vs}</dt>
                <dd className="pt-1.5">
                  <ChangeText change={drawn.change} />
                </dd>
              </div>
            </dl>
            <h3 className="text-[13.5px] font-extrabold text-ink-strong">Examples</h3>
            <ul className="flex flex-col">
              {ERROR_EXAMPLES[drawn.id].map((x) => (
                <li key={x.question} className="flex flex-col gap-1 border-t border-line py-3">
                  <p className="text-[13.5px] font-bold text-ink-strong">{x.question}</p>
                  <p className="text-[13px] text-ink">“{x.answer}”</p>
                  <p className="text-[12.5px] text-ink-soft">{x.why}</p>
                  <span className="text-xs text-ink-soft">{x.source}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SideDialog>
    </div>
  )
}

function QuestionsChart({ w }: { w: ReturnType<typeof insightsFor> }) {
  const step = w.hours ? 20 : 100
  const peak = Math.max(
    step * 2,
    Math.ceil((Math.max(...w.questions.values) * 1.08) / (step * 2)) * step * 2,
  )
  return (
    <LineChart
      label={`${w.hours ? 'Questions per hour today' : `Questions per day, ${w.short}`}, ${fmt(w.questions.total)} in all`}
      series={[{ name: 'Questions', values: w.questions.values }]}
      labels={w.labels}
      min={0}
      max={peak}
      ticks={[0, peak / 2, peak]}
      format={(v) => fmt(v)}
      area
    />
  )
}

/** A change in the tile's words and colours, outside a tile: the by-type table, the drawer. */
function ChangeText({ change }: { change: StatTileChange }) {
  const tone = !change.direction
    ? 'text-ink-soft'
    : (change.direction === 'up') === (change.upIsGood ?? true)
      ? 'text-success-fg'
      : 'text-danger-fg'
  return (
    <span className={`text-xs font-bold whitespace-nowrap ${tone}`}>
      {change.direction && (
        <>
          <span aria-hidden="true">{change.direction === 'up' ? '↑' : '↓'} </span>
          <span className="sr-only">{change.direction === 'up' ? 'Up ' : 'Down '}</span>
        </>
      )}
      {change.text}
    </span>
  )
}

/** Helpful, not helpful and not rated, as one bar: accent, a lighter accent, the line colour. */
function RatingsBar({ up, down, unrated }: { up: number; down: number; unrated: number }) {
  const total = Math.max(1, up + down + unrated)
  const parts = [
    { label: 'Helpful', value: up, fill: 'bg-accent' },
    { label: 'Not helpful', value: down, fill: 'bg-accent/45', min: 1.5 },
    { label: 'Not rated', value: unrated, fill: 'bg-line' },
  ]
  return (
    <>
      <div
        role="img"
        aria-label={parts.map((p) => `${fmt(p.value)} ${p.label.toLowerCase()}`).join(', ')}
        className="flex h-3.5 gap-[2px] overflow-hidden rounded-[4px]"
      >
        {parts.map((p) => (
          <span
            key={p.label}
            className={`block h-full ${p.fill}`}
            style={{ width: `${Math.max(p.min ?? 0, (p.value / total) * 100)}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-ink">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${p.fill}`} />
            <b className="font-extrabold text-ink-strong tabular-nums">{fmt(p.value)}</b> {p.label}
          </li>
        ))}
      </ul>
    </>
  )
}

/** The suites as rows that open onto their last six runs and failing cases. */
function SuiteList({ open, onToggle }: { open: number | null; onToggle: (i: number) => void }) {
  const cols =
    'grid grid-cols-[minmax(0,1.4fr)_70px_minmax(0,1.3fr)_110px_28px] items-center gap-3.5 @max-[700px]:grid-cols-[minmax(0,1fr)_60px_90px_28px]'
  return (
    <div className="flex flex-col">
      <div
        aria-hidden="true"
        className={`${cols} border-b border-line px-2.5 py-2 text-[10.5px] font-extrabold tracking-[0.07em] text-ink-soft uppercase`}
      >
        <span>Suite</span>
        <span className="text-right">Cases</span>
        <span className="@max-[700px]:hidden">Passing</span>
        <span className="text-right">vs last run</span>
        <span />
      </div>
      <ul aria-label="Test suites">
        {SUITES.map((s, i) => {
          const below = s.passing < SUITE_TARGET
          const isOpen = open === i
          return (
            <li key={s.name} className="border-b border-line/60">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => onToggle(i)}
                className={`${cols} w-full px-2.5 py-2.5 text-left text-[13px] text-ink transition hover:bg-tint/5 ${isOpen ? 'bg-tint/5' : ''}`}
              >
                <span className="flex min-w-0 flex-col">
                  <b className="font-bold text-ink-strong">{s.name}</b>
                  {below && (
                    <span className="text-[11.5px] font-bold text-danger-fg">
                      Below the {SUITE_TARGET}% target
                    </span>
                  )}
                </span>
                <span className="text-right tabular-nums">{s.cases}</span>
                <span className="flex items-center gap-2 @max-[700px]:hidden">
                  <span className="relative h-1.5 min-w-15 flex-1 overflow-hidden rounded-full bg-tint/8">
                    <span
                      className={`absolute inset-y-0 left-0 rounded-r-full ${below ? 'bg-accent/45' : 'bg-accent'}`}
                      style={{ width: `${s.passing}%` }}
                    />
                  </span>
                  <span className="w-9 text-right text-xs font-bold text-ink-strong tabular-nums">
                    {s.passing}%
                  </span>
                </span>
                <span className="text-right">
                  <ChangeText
                    change={
                      s.change === 0
                        ? { text: 'No change' }
                        : {
                            text: `${Math.abs(s.change)} pts`,
                            direction: s.change > 0 ? 'up' : 'down',
                          }
                    }
                  />
                </span>
                <ChevronDownIcon
                  width={16}
                  height={16}
                  className={`text-ink-soft transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-6 px-2.5 pt-2 pb-4 @max-[700px]:grid-cols-1">
                  <div className="flex flex-col gap-2">
                    <span className="text-[12.5px] font-bold text-ink-soft">Last six runs</span>
                    <div
                      role="img"
                      aria-label={`Pass rate in the last six runs: ${s.runs.map((r) => `${r.date} ${r.passing}%`).join(', ')}`}
                      className="flex h-24 items-end gap-2"
                    >
                      {s.runs.map((r) => (
                        <div
                          key={r.date}
                          className="flex h-full flex-1 flex-col items-center gap-1"
                        >
                          <span className="text-[10.5px] font-bold text-ink-strong tabular-nums">
                            {r.passing}%
                          </span>
                          <span className="flex w-full flex-1 items-end">
                            <span
                              className={`block w-full rounded-t-[4px] ${r.passing < SUITE_TARGET ? 'bg-accent/45' : 'bg-accent'}`}
                              style={{ height: `${Math.max(6, ((r.passing - 70) / 30) * 100)}%` }}
                            />
                          </span>
                          <span className="text-[10.5px] text-ink-soft">
                            {r.date.replace('Nov ', '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12.5px] font-bold text-ink-soft">Failing cases</span>
                      <span className="text-[12.5px] text-ink-soft">
                        {Math.round((s.cases * (100 - s.passing)) / 100)} in the last run
                      </span>
                    </div>
                    <ul>
                      {s.failing.map((c) => (
                        <li
                          key={c.question}
                          className="flex flex-col gap-0.5 border-t border-line py-2"
                        >
                          <p className="text-[13px] font-bold text-ink-strong">{c.question}</p>
                          <span className="text-[12.5px] text-ink-soft">{c.why}</span>
                          <Pill tone="neutral" size="sm" className="self-start">
                            {c.kind}
                          </Pill>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1.5 flex gap-2">
                      <Button size="sm">Run this suite again</Button>
                      <Button size="sm" variant="ghost">
                        Open all cases
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
