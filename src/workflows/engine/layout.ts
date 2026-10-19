// Turning a wire run's {column, row} into pixels.
//
// This lives here rather than in ../components because it is a placement *policy*
// over a shape the kit has no concept of — the kit's contract is "you provide
// steps with x/y" (see canvas/README.md), and this is what provides them. The
// dependency runs one way: layout imports the kit's widths, never the reverse.
//
// The constants below are not arbitrary. Fed the loan run's columns they
// reproduce its authored x positions exactly, gate narrowing included:
//
//   col 0  trigger, intake        196 wide   x = 0
//   col 1  bureau, spread, kyc    196        x = 0    + 196 + 104 = 300
//   col 2  risk, memo             196        x = 300  + 196 + 104 = 600
//   col 3  policy (decision)      170        x = 600  + 196 + 104 = 900
//   col 4  approve, senior        196        x = 900  + 170 + 104 = 1174
//   col 5  letter, notify         196        x = 1174 + 196 + 104 = 1474
//
// A step that carries `content` is wider (RICH_W) and taller than that, and its
// column is spaced by the heights of what is in it rather than by the fixed
// pitch — see `stepHeight` in ../components/build.ts.
//
// The y values it derives are NOT the loan run's authored ones: those were
// hand-tuned per node, and a column here is simply centred on the axis. That is
// why /workflow-demo keeps its own positions and only the live routes come
// through this function — see docs/workflows/design.md.
import {
  FOLD_W,
  foldHeight,
  GATE_W,
  NODE_W,
  RICH_W,
  STEP_H,
  stepHeight,
  type FoldRect,
  type StageSeed,
  type StepSeed,
} from '../components/index'
import type { Lane } from './types'
import type { RunDetail, WireStage, WireStep } from './wireProtocol'

/** Horizontal space between one column's right edge and the next column's left. */
export const COLUMN_GUTTER = 104
/** The same, where either side is a folded stage. There is less to keep apart. */
export const FOLD_GUTTER = 56
/** Vertical distance between two nodes in the same column. */
export const ROW_PITCH = 180
/** The line every column is centred on. */
export const ROW_AXIS = 200

/** How far the first and last lanes overhang the run. */
export const LANE_BLEED = 80
/** How far short of the next column an interior lane boundary stops. */
export const LANE_INSET = 50
/** Headroom above the highest node — the lane's own title bar sits in it. */
export const LANE_HEAD = 110
/** Room below the lowest node's top edge, so a node never touches the floor. */
export const LANE_FOOT = 160

export type PlacedRun = {
  /** Every step, placed. In a folded stage they keep a position but are not drawn. */
  steps: StepSeed<RunDetail>[]
  lanes: Record<string, Lane>
  laneTop: number
  laneBottom: number
  /** Where each folded stage's node sits. Empty when nothing is folded. */
  folds: Record<string, FoldRect>
}

export type PlaceOptions = {
  /** Stages to draw as one narrow node each. */
  folded?: ReadonlySet<string>
}

function widthOf(step: WireStep): number {
  return step.w ?? (step.content ? RICH_W : step.kind === 'decision' ? GATE_W : NODE_W)
}

/** One thing that takes up horizontal room: a column of steps, or a folded stage. */
type Slot = { x: number; w: number; fold?: string; columns: number[] }

/**
 * The run's columns from left to right, with every column of a folded stage
 * collapsed into one narrow slot.
 */
function slotGeometry(steps: WireStep[], folded: ReadonlySet<string>): Slot[] {
  const last = steps.reduce((m, s) => Math.max(m, s.column), 0)
  const slots: Slot[] = []
  for (let c = 0; c <= last; c++) {
    const inColumn = steps.filter((s) => s.column === c)
    const stage = inColumn[0]?.stageId
    if (stage !== undefined && folded.has(stage)) {
      const open = slots[slots.length - 1]
      if (open?.fold === stage) open.columns.push(c)
      else slots.push({ x: 0, w: FOLD_W, fold: stage, columns: [c] })
      continue
    }
    // An empty column still occupies its slot, so a gap in the numbering reads
    // as deliberate space rather than silently closing up.
    const w = inColumn.length ? Math.max(...inColumn.map(widthOf)) : NODE_W
    slots.push({ x: 0, w, columns: [c] })
  }
  slots.forEach((slot, i) => {
    if (i === 0) return
    const prev = slots[i - 1]
    slot.x = prev.x + prev.w + (prev.fold || slot.fold ? FOLD_GUTTER : COLUMN_GUTTER)
  })
  return slots
}

/**
 * Places every step, then derives the lanes from where the steps landed. A step
 * with explicit `x`/`y` keeps them, and is ignored when sizing its column — an
 * escape hatch shouldn't move its neighbours.
 *
 * With `folded`, the named stages take one narrow slot each and everything to
 * their right closes up. Nothing else about the placement changes, so folding a
 * stage never moves a node vertically.
 */
export function placeRun(
  steps: WireStep[],
  stages: WireStage[],
  options: PlaceOptions = {},
): PlacedRun {
  const folded = options.folded ?? new Set<string>()
  const auto = steps.filter((s) => s.x === undefined || s.y === undefined)
  const slots = slotGeometry(auto, folded)
  const slotOf = new Map<number, Slot>()
  for (const slot of slots) for (const c of slot.columns) slotOf.set(c, slot)

  /** Where each column's nth step sits, centred on the axis. */
  const yByColumn = new Map<number, Map<string, number>>()
  for (const c of new Set(auto.map((s) => s.column))) {
    // `row` orders; it is not an index. A script numbering rows 0/2/5 still gets
    // three evenly spaced nodes rather than two gaps.
    const ordered = auto.filter((s) => s.column === c).sort((a, b) => a.row - b.row)
    const heights = ordered.map((s) => stepHeight(s.content))
    // The gap between two plain nodes is what the fixed pitch always left. Kept
    // as a gap rather than a pitch, a column of taller nodes spreads by exactly
    // their extra height — and a column of plain ones lands where it always did.
    const gap = ROW_PITCH - STEP_H
    const total = heights.reduce((sum, h) => sum + h, 0) + gap * (ordered.length - 1)
    const ys = new Map<string, number>()
    let y = ROW_AXIS + STEP_H / 2 - total / 2
    ordered.forEach((s, i) => {
      ys.set(s.id, y)
      y += heights[i] + gap
    })
    yByColumn.set(c, ys)
  }

  const placed: StepSeed<RunDetail>[] = steps.map((s) => ({
    id: s.id,
    kind: s.kind,
    stageId: s.stageId,
    title: s.title,
    meta: s.meta,
    mono: s.mono,
    initials: s.initials,
    statusLabel: s.statusLabel,
    assignee: s.assignee,
    content: s.content,
    detail: s.detail,
    w: s.w ?? (s.content ? RICH_W : s.kind === 'decision' ? GATE_W : undefined),
    x: s.x ?? slotOf.get(s.column)?.x ?? 0,
    y: s.y ?? yByColumn.get(s.column)?.get(s.id) ?? ROW_AXIS,
  }))

  // Only what is drawn decides how tall the lanes are: a folded stage is a
  // short stack of bars however many rows it would take unfolded.
  const drawn = placed.filter((s) => !folded.has(s.stageId))
  const tops = drawn.map((s) => s.y)
  const bottoms = drawn.map((s) => s.y + stepHeight(s.content) - STEP_H)
  const laneTop = (tops.length ? Math.min(...tops) : ROW_AXIS) - LANE_HEAD
  const laneBottom = (bottoms.length ? Math.max(...bottoms) : ROW_AXIS) + LANE_FOOT

  // A stage spans the slots its steps occupy. Lanes butt up against each other;
  // only the outermost two bleed past the run.
  const spans = stages.map((stage) => {
    const mine = slots.filter((slot) =>
      slot.fold !== undefined
        ? slot.fold === stage.id
        : auto.some((s) => s.stageId === stage.id && slot.columns.includes(s.column)),
    )
    return { id: stage.id, first: mine[0], last: mine[mine.length - 1] }
  })

  const lanes: Record<string, Lane> = {}
  spans.forEach((span, i) => {
    if (!span.first || !span.last) return
    const isFirst = i === 0
    const isLast = i === spans.length - 1
    const next = spans[i + 1]?.first
    // Half the gutter belongs to each lane. Between two open columns that is
    // LANE_INSET, the value the authored runs were drawn against.
    const inset = (a: Slot, b: Slot) => (a.fold || b.fold ? FOLD_GUTTER / 2 : LANE_INSET)
    const prevLast = spans[i - 1]?.last
    const start = isFirst
      ? span.first.x - LANE_BLEED
      : span.first.x - (prevLast ? inset(prevLast, span.first) : LANE_INSET)
    const end =
      isLast || !next ? span.last.x + span.last.w + LANE_BLEED : next.x - inset(span.last, next)
    lanes[span.id] = { x: start, w: end - start }
  })

  const folds: Record<string, FoldRect> = {}
  for (const slot of slots) {
    if (slot.fold === undefined) continue
    const count = steps.filter((s) => s.stageId === slot.fold).length
    // Centred on the same line the step nodes are.
    folds[slot.fold] = { x: slot.x, y: ROW_AXIS + STEP_H / 2 - foldHeight(count) / 2 }
  }

  return { steps: placed, lanes, laneTop, laneBottom, folds }
}

/**
 * Re-places a run that has already been laid out, with some of its stages
 * folded.
 *
 * A `RunGraph` carries pixels, not the `{column, row}` it was placed from, and
 * the hard-coded loan run never had any. So the grid is read back off the
 * positions: steps that share an x share a column, and y orders them within it.
 * That is exact for anything `placeRun` produced and close enough for a run
 * placed by hand, whose columns are still columns.
 */
export function foldRun(
  graph: { steps: StepSeed<RunDetail>[]; stages: StageSeed[] },
  folded: ReadonlySet<string>,
): PlacedRun {
  const xs = [...new Set(graph.steps.map((s) => s.x))].sort((a, b) => a - b)
  const wire: WireStep[] = graph.steps.map((s) => ({
    id: s.id,
    kind: s.kind,
    stageId: s.stageId,
    title: s.title,
    meta: s.meta,
    mono: s.mono,
    initials: s.initials,
    statusLabel: s.statusLabel,
    assignee: s.assignee,
    content: s.content,
    detail: s.detail,
    w: s.w,
    column: xs.indexOf(s.x),
    row: s.y,
  }))
  return placeRun(wire, graph.stages, { folded })
}
