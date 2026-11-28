import type { ReactNode } from 'react'
import { CheckIcon, MinusIcon, XIcon } from '../../../primitives/icons'
import { Link } from '../../../primitives/link'
import type { GlanceStage, GlanceState, GlanceStep, RunGlanceProps } from './types'
import { chainHeading, currentIndex, windowStages, windowSteps } from './window'
// A live run at a glance, for the row of a runs list that has been opened:
// where it is among its stages, the steps of the stage it is on, what it waits
// on, the last few things it did, and the way into its details.
//
// It scales from three steps to fifty because both lines are windowed around
// the current position (see ./window.ts), so a long run takes the same room as
// a short one. Every chip can be a link into the run's details.

/** The mark before a chip: a tick, a dot, a cross, a ring or a dash. */
function Glyph({ state }: { state: GlanceState }) {
  if (state === 'done') return <CheckIcon width={13} height={13} className="text-success" />
  if (state === 'failed') return <XIcon width={13} height={13} className="text-danger-fg" />
  if (state === 'skipped') return <MinusIcon width={13} height={13} className="text-ink-soft" />
  if (state === 'queued')
    return (
      <span
        aria-hidden
        className="size-2 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink-soft)]"
      />
    )
  return (
    <span
      aria-hidden
      className={`size-2 rounded-full ${state === 'running' ? 'bg-brand-fg' : 'bg-notify'}`}
    />
  )
}

/** What a chip says it is, for someone who cannot see its glyph. */
const STATE_WORD: Record<GlanceState, string> = {
  done: 'done',
  needs: 'needs you',
  waiting: 'waiting',
  running: 'running',
  failed: 'failed',
  queued: 'queued',
  skipped: 'skipped',
}

function Chip({
  href,
  className,
  children,
}: {
  href?: string
  className: string
  children: ReactNode
}) {
  return href ? (
    <Link variant="plain" href={href} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  )
}

const stageText = (stage: GlanceStage, current: boolean) =>
  current
    ? stage.state === 'failed'
      ? 'font-extrabold text-danger-fg'
      : 'font-extrabold text-ink-strong'
    : stage.state === 'done'
      ? 'font-bold text-ink'
      : 'font-bold text-ink-soft'

const stepBox = (step: GlanceStep) =>
  step.state === 'skipped'
    ? 'shadow-[0_0_0_1px_var(--line)] text-ink-soft'
    : 'bg-panel-solid shadow-[0_0_0_1px_var(--line)] text-ink-strong hover:shadow-[0_0_0_1px_var(--brand-fg)]'

const Sep = ({ children }: { children: ReactNode }) => (
  <span aria-hidden className="text-ink-soft">
    {children}
  </span>
)

const caps = 'text-[10.5px] font-extrabold tracking-[0.07em] text-ink-soft uppercase'

export function RunGlance({
  stages,
  steps,
  hrefFor,
  status,
  latest = [],
  meta,
  actions,
  className = '',
}: RunGlanceProps) {
  const at = currentIndex(stages)
  const stage = stages[at]
  const stageId = stage?.id ?? stages[0]?.id ?? ''

  return (
    <div
      className={`flex flex-col gap-3 rounded-[12px] bg-tint/4 px-4 py-3.5 shadow-[0_0_0_1px_var(--line)] ${className}`}
    >
      <ol
        aria-label="Stages"
        className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[12.5px]"
      >
        {windowStages(stages).map((entry, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <Sep>·</Sep>}
            {entry.kind === 'item' ? (
              <Chip
                href={hrefFor?.({ stageId: entry.item.id })}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap hover:underline ${stageText(entry.item, entry.item === stage)}`}
              >
                {entry.item.state !== 'queued' && <Glyph state={entry.item.state} />}
                {entry.item.name}
                <span className="sr-only">, {STATE_WORD[entry.item.state]}</span>
              </Chip>
            ) : entry.kind === 'done' ? (
              <span className="inline-flex items-center gap-1.5 font-extrabold whitespace-nowrap text-success">
                <CheckIcon width={13} height={13} />
                {entry.count} stage{entry.count === 1 ? '' : 's'} done
              </span>
            ) : (
              <Chip
                href={hrefFor?.({ stageId: stages[stages.length - entry.count]?.id ?? stageId })}
                className="font-extrabold whitespace-nowrap text-brand-fg hover:underline"
              >
                +{entry.count} more
              </Chip>
            )}
          </li>
        ))}
      </ol>

      {steps.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={caps}>{chainHeading(stage, steps)}</span>
          <ol aria-label="Steps" className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
            {windowSteps(steps).map((entry, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <Sep>→</Sep>}
                {entry.kind === 'item' ? (
                  <Chip
                    href={hrefFor?.({ stageId, stepId: entry.item.id })}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] font-bold whitespace-nowrap ${stepBox(entry.item)}`}
                  >
                    <Glyph state={entry.item.state} />
                    {entry.item.name}
                    {(entry.item.took || entry.item.state === 'skipped') && (
                      <small className="text-[11.5px] font-semibold text-ink-soft">
                        {entry.item.took ?? 'skipped'}
                      </small>
                    )}
                    {entry.item.state !== 'skipped' && (
                      <span className="sr-only">, {STATE_WORD[entry.item.state]}</span>
                    )}
                  </Chip>
                ) : (
                  <Chip
                    href={hrefFor?.({ stageId })}
                    className="px-1 text-[12.5px] font-bold whitespace-nowrap text-brand-fg hover:underline"
                  >
                    +{entry.count} {entry.kind === 'done' ? 'done' : 'more'}
                  </Chip>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {status}

      {latest.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={caps}>Latest</span>
          <ol className="m-0 flex list-none flex-col gap-1 p-0">
            {latest.map((event, i) => (
              <li
                key={i}
                className="grid grid-cols-[3.25rem_minmax(0,12rem)_minmax(0,1fr)] gap-2 text-[12.5px] text-ink max-md:grid-cols-[3rem_minmax(0,1fr)]"
              >
                <time className="text-ink-soft">{event.at}</time>
                <b className="truncate font-bold text-ink-strong">{event.step}</b>
                <span className="truncate max-md:col-start-2">{event.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(meta || actions) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[12.5px] text-ink-soft">
          {meta && <span>{meta}</span>}
          <span className="flex-1" />
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
    </div>
  )
}
