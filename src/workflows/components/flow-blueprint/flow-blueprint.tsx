import type { BlueprintStep, FlowBlueprintProps } from './types'
// A run's whole shape, with nothing to read: one bar per step, one column per
// lane, lines for what feeds what.
//
// It is what a list of runs shows instead of the canvas. Ten of these on a page
// cost ten small DOM trees; ten React Flow instances would not be a page. So it
// imports nothing from React Flow, and nothing from ../build, which does.
//
// Widths are fractions of the container rather than pixels, so a five-stage run
// and a ten-stage run both fill the row they are given.
import { StageMarker } from '../stage-marker'
import type { StepStatus } from '../types'

const LABEL_H = 30
const BAR_H = 10
const BAR_GAP = 9
const PAD_Y = 16
/** A bar's left edge and width within its column, out of 100. */
const BAR_X = 22
const BAR_W = 56

const BAR: Record<StepStatus, string> = {
  done: 'bg-accent',
  approved: 'bg-accent',
  running: 'bg-brand-solid ring-2 ring-accent/30',
  waiting: 'bg-notify ring-2 ring-notify/25',
  failed: 'bg-danger-solid',
  changes: 'bg-ink-soft',
  queued: 'border border-dashed border-ink-soft/70 bg-panel-solid',
  skipped: 'border border-dashed border-ink-soft/45 bg-panel-solid',
}

type Line = 'done' | 'active' | 'pending' | 'skipped'

/* The canvas's own line vocabulary, read straight from the brand tokens: this
   component is drawn outside the canvas, where `EDGE_TOKENS` is not in scope. */
const STROKE: Record<Line, { stroke: string; strokeDasharray?: string; strokeWidth: number }> = {
  done: { stroke: 'var(--workflow-edge-done)', strokeWidth: 1.5 },
  active: { stroke: 'var(--workflow-edge-active)', strokeDasharray: '4 3', strokeWidth: 1.5 },
  pending: { stroke: 'var(--workflow-edge-pending)', strokeDasharray: '0.1 4', strokeWidth: 1.75 },
  skipped: { stroke: 'var(--workflow-edge-skipped)', strokeDasharray: '0.1 6', strokeWidth: 1.75 },
}

/** A line is drawn for the step it leads to — the same rule as `feeds()`. */
function lineFor(status: StepStatus): Line {
  if (status === 'waiting' || status === 'running') return 'active'
  if (status === 'skipped') return 'skipped'
  if (status === 'queued') return 'pending'
  return 'done'
}

type Placed = BlueprintStep & { column: number; y: number }

export function FlowBlueprint({ stages, edges, label, className = '' }: FlowBlueprintProps) {
  const columns = stages.flatMap((stage) => stage.columns)
  const total = Math.max(1, columns.length)
  const rows = Math.max(1, ...columns.map((column) => column.length))
  const bodyH = PAD_Y * 2 + rows * BAR_H + (rows - 1) * BAR_GAP
  const height = LABEL_H + bodyH
  const mid = LABEL_H + bodyH / 2

  const placed: Placed[] = columns.flatMap((column, c) => {
    const blockH = column.length * BAR_H + (column.length - 1) * BAR_GAP
    return column.map((step, i) => ({
      ...step,
      column: c,
      y: mid - blockH / 2 + i * (BAR_H + BAR_GAP),
    }))
  })
  const byId = new Map(placed.map((step) => [step.id, step]))

  // With no edges given, join each column to the next: like for like, and the
  // last of the shorter column fans out to whatever is left of the longer one.
  const pairs: [Placed, Placed][] = edges
    ? edges.flatMap(({ from, to }) => {
        const a = byId.get(from)
        const b = byId.get(to)
        return a && b && a.column !== b.column ? [[a, b] as [Placed, Placed]] : []
      })
    : columns.slice(0, -1).flatMap((column, c) => {
        const next = columns[c + 1]
        return column.flatMap((a, i) =>
          next.flatMap((b, j) => {
            const joined =
              column.length === 1 ||
              next.length === 1 ||
              i === j ||
              (i === column.length - 1 && j > i) ||
              (j === next.length - 1 && i > j)
            return joined ? [[byId.get(a.id)!, byId.get(b.id)!] as [Placed, Placed]] : []
          }),
        )
      })

  const paths: Record<Line, string> = { done: '', active: '', pending: '', skipped: '' }
  for (const [a, b] of pairs) {
    const x1 = a.column * 100 + BAR_X + BAR_W
    const x2 = b.column * 100 + BAR_X
    const y1 = a.y + BAR_H / 2
    const y2 = b.y + BAR_H / 2
    const dx = (x2 - x1) / 2
    paths[lineFor(b.status)] += `M${x1} ${y1}C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`
  }

  let before = 0
  return (
    <div role="img" aria-label={label} className={`relative ${className}`} style={{ height }}>
      {stages.map((stage) => {
        const left = before
        before += stage.columns.length
        return (
          <div
            key={stage.id}
            aria-hidden
            className={`absolute inset-y-0 border-l border-dashed border-ink-soft/30 ${
              stage.status === 'current' ? 'bg-chip/50' : ''
            }`}
            style={{
              left: `${(left / total) * 100}%`,
              width: `${(stage.columns.length / total) * 100}%`,
            }}
          >
            <div className="flex items-center gap-1.5 px-2" style={{ height: LABEL_H }}>
              <StageMarker status={stage.status} size={12} />
              <span className="min-w-0 truncate text-xs font-bold text-ink-strong">
                {stage.name}
              </span>
            </div>
          </div>
        )
      })}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        viewBox={`0 0 ${total * 100} ${height}`}
        preserveAspectRatio="none"
        fill="none"
      >
        {(Object.keys(paths) as Line[]).map(
          (line) =>
            paths[line] && (
              <path
                key={line}
                d={paths[line]}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                {...STROKE[line]}
              />
            ),
        )}
      </svg>
      {placed.map((step) => (
        <span
          key={step.id}
          aria-hidden
          className={`absolute rounded-[4px] ${BAR[step.status]}`}
          style={{
            top: step.y,
            height: BAR_H,
            left: `${((step.column * 100 + BAR_X) / (total * 100)) * 100}%`,
            width: `${(BAR_W / (total * 100)) * 100}%`,
          }}
        />
      ))}
    </div>
  )
}
