import type { StepNodeProps } from './types'
// One step on the canvas, at three levels of detail.
//
// The icon says who does the work — the orb for an agent, initials for a person,
// a plug for a system call, a diamond for routing. That is what survives all the
// way down to the glyph tier, along with the status marker: at 40% zoom you can
// still see that a person is blocked.
import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'
import { ChevronRightIcon } from '../../../primitives/icons'
import { KindIcon } from '../kind-icon'
import { StageProgress } from '../stage-progress'
import { StatusMark } from '../status-mark'
import type { StepContent, StepKind, StepStatus } from '../types'
import { DEFAULT_STATUS_LABEL, STEP_KIND_LABEL } from '../types'
import { useZoomTier } from '../zoom'

/* One hue, four weights of emphasis. A person's step is the loudest because it
   is the one that stops the run. */
const KIND_CHIP: Record<StepKind, string> = {
  agent: 'bg-chip text-chip-fg',
  human: 'bg-brand-solid text-on-brand-solid',
  tool: 'bg-tint/12 text-ink',
  decision: 'text-ink-soft ring-1 ring-inset ring-line',
  trigger: 'bg-chip text-chip-fg',
  flow: 'bg-chip text-chip-fg',
}

function shellFor(status: StepStatus, selected: boolean) {
  const dim = status === 'queued' || status === 'skipped'
  const base = dim
    ? 'bg-panel border border-dashed border-ink-soft/45'
    : 'bg-panel-solid border border-line shadow-sm shadow-(color:--shadow-soft)'
  const state =
    status === 'waiting'
      ? 'border-notify/60 ring-4 ring-notify/12'
      : status === 'failed'
        ? 'border-danger/40'
        : ''
  return `${base} ${state} ${selected ? 'ring-2 ring-accent' : ''}`
}

const handleStyle = {
  width: 8,
  height: 8,
  background: 'var(--panel-solid)',
  border: '1.5px solid color-mix(in srgb, var(--ink-soft) 55%, transparent)',
}

/**
 * The structured part of a node: facts, branches, progress, tools, a note.
 *
 * Every row here has a fixed height, and `stepHeight` in ../build adds the same
 * numbers up to place the node before it has been measured. A row that wraps
 * would make the node taller than the layout allowed for and run it into the
 * one below, so each one truncates instead.
 */
function StepContentBlock({ content }: { content: StepContent }) {
  const { facts, branches, progress, tools, note } = content
  return (
    <>
      {facts && facts.length > 0 && (
        <dl className="flex flex-col gap-0.5">
          {facts.map(([label, value]) => (
            <div key={label} className="flex h-[18px] items-center gap-2 text-[11.5px]">
              <dt className="w-[58px] shrink-0 truncate text-ink-soft">{label}</dt>
              <dd className="min-w-0 truncate font-semibold text-ink-strong">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {branches && branches.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {branches.map((branch) => (
            <li
              key={`${branch.when}-${branch.to}`}
              className={`flex h-[18px] items-center gap-1.5 text-[11.5px] ${
                branch.taken ? 'text-ink-strong' : 'text-ink-soft'
              }`}
            >
              {/* Filled for the path the run took; hollow for the ones it did not. */}
              <span
                aria-hidden
                className={`size-[7px] shrink-0 rounded-full ${
                  branch.taken ? 'bg-accent' : 'border border-dashed border-ink-soft'
                }`}
              />
              <span className="shrink-0">{branch.when}</span>
              <ChevronRightIcon width={11} height={11} className="shrink-0" />
              <span className={`min-w-0 truncate ${branch.taken ? 'font-bold' : ''}`}>
                {branch.to}
                {branch.taken && <span className="sr-only"> (taken)</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {progress && (
        <div className="flex h-7 flex-col justify-between">
          <StageProgress
            label={progress.label}
            segments={Array.from({ length: progress.total }, (_, i) =>
              i < progress.done ? 'done' : 'upcoming',
            )}
          />
          <span className="truncate text-[11.5px] leading-4 text-ink">{progress.label}</span>
        </div>
      )}
      {tools && tools.length > 0 && (
        <div className="flex h-[22px] gap-1.5 overflow-hidden">
          {tools.map((tool) => (
            <span
              key={tool}
              className="inline-flex h-[22px] shrink-0 items-center rounded-control bg-tint/8 px-1.5 font-mono text-[10.5px] text-ink"
            >
              {tool}
            </span>
          ))}
        </div>
      )}
      {note && <p className="h-4 truncate text-[11.5px] leading-4 text-ink">{note}</p>}
    </>
  )
}

function StepNodeView({ data, selected }: StepNodeProps) {
  const tier = useZoomTier()
  const { kind, title, meta, mono, initials, status, statusLabel, assignee, content } = data
  const dim = status === 'queued' || status === 'skipped'
  const statusText = statusLabel ?? DEFAULT_STATUS_LABEL[status]

  return (
    <div
      className={`relative box-border rounded-surface transition-colors ${shellFor(status, !!selected)} ${
        tier === 'detail' ? 'px-3.5 py-3' : 'px-3.5'
      }`}
      style={tier === 'detail' ? undefined : { height: tier === 'simplified' ? 64 : 48 }}
    >
      <Handle type="target" position={Position.Left} style={handleStyle} />

      {tier === 'detail' ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex h-5 items-center gap-1.5">
            <KindIcon kind={kind} initials={initials} size={20} />
            <span
              className={`inline-flex h-5 items-center rounded-control px-2 text-[11px] font-bold whitespace-nowrap ${KIND_CHIP[kind]}`}
            >
              {STEP_KIND_LABEL[kind]}
            </span>
            <StatusMark status={status} text={statusText} />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={`truncate leading-[18px] ${
                mono ? 'font-mono text-[12.5px] font-medium' : 'text-[13.5px] font-bold'
              } ${dim ? 'text-ink' : 'text-ink-strong'}`}
            >
              {title}
            </span>
            <span className="truncate text-[11.5px] leading-4 text-ink-soft">{meta}</span>
          </div>
          {status === 'waiting' && (
            <div className="mt-0.5 flex items-center gap-2">
              <span className="inline-flex h-[22px] items-center rounded-control bg-notify px-2.5 text-[11px] font-bold whitespace-nowrap text-on-notify">
                Needs approval
              </span>
              {assignee && (
                <span className="truncate text-[11.5px] font-semibold text-ink-soft">
                  {assignee}
                </span>
              )}
            </div>
          )}
          {content && <StepContentBlock content={content} />}
        </div>
      ) : (
        /* Simplified drops the result line and the chip text, and grows the title
           to 17px so it still lands near 10px on screen. Glyph drops text
           entirely — the icon and the marker are the whole node. */
        <div className="flex h-full items-center gap-2.5">
          <KindIcon kind={kind} initials={initials} size={tier === 'simplified' ? 24 : 28} />
          {tier === 'simplified' && (
            <span
              className={`min-w-0 truncate leading-[22px] ${
                mono ? 'font-mono text-[15px] font-medium' : 'text-[17px] font-bold'
              } ${dim ? 'text-ink' : 'text-ink-strong'}`}
            >
              {title}
            </span>
          )}
          <StatusMark status={status} tier={tier} />
        </div>
      )}

      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  )
}

export const StepNode = memo(StepNodeView)
