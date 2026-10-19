// Turning a run into React Flow nodes and edges.
//
// Everything here is driven by what the caller passes in, so a second recipe can
// reuse it by supplying its own steps, stages and edge list.
import { MarkerType, type Edge } from '@xyflow/react'
import type {
  EdgeState,
  FoldNodeType,
  StageSeed,
  StatusMap,
  StepContent,
  StepNodeType,
  StepSeed,
} from './types'

export const NODE_W = 196
export const GATE_W = 170
/** A step that carries `content`: facts and branches need the room to be read. */
export const RICH_W = 248

/** A step with a title and a result line and nothing else, at the detail tier. */
export const STEP_H = 88
/** A folded stage's column of bars. */
export const FOLD_W = 72
export const FOLD_BAR_H = 10
export const FOLD_BAR_GAP = 8
export const FOLD_PAD = 8

const CONTENT_GAP = 6
const LINE_H = 18
const LINE_GAP = 2
const lines = (n: number) => n * LINE_H + (n - 1) * LINE_GAP

/**
 * How tall a step draws at the detail tier, from its content alone.
 *
 * The layout needs this before anything is rendered: a column of nodes with
 * facts and branches is taller than the fixed row pitch allows for, and React
 * Flow only measures a node after it has been placed. So the numbers here are
 * the node's own — every line in `StepNode`'s content block has a fixed height
 * that matches one of these. Change one side and change the other.
 *
 * Status is deliberately not an input. A waiting step grows by its approval
 * row, but statuses change several times a second and positions must not.
 */
export function stepHeight(content?: StepContent): number {
  if (!content) return STEP_H
  const parts: number[] = []
  if (content.facts?.length) parts.push(lines(content.facts.length))
  if (content.branches?.length) parts.push(lines(content.branches.length))
  if (content.progress) parts.push(28)
  if (content.tools?.length) parts.push(22)
  if (content.note) parts.push(16)
  if (parts.length === 0) return STEP_H
  return STEP_H + parts.reduce((sum, h) => sum + h + CONTENT_GAP, 0)
}

/** How tall a folded stage of `n` steps draws. */
export const foldHeight = (n: number) =>
  Math.max(1, n) * FOLD_BAR_H + (Math.max(1, n) - 1) * FOLD_BAR_GAP + FOLD_PAD * 2

/** Where a folded stage sits. Its height follows from how many steps it holds. */
export type FoldRect = { x: number; y: number }

export const foldNodeId = (stageId: string) => `fold-${stageId}`

/**
 * The four line styles, as CSS variables so a host can theme them per mode.
 * Every one is contrast-checked against the canvas it sits on — see docs/workflows/design.md.
 */
export const EDGE_STROKE: Record<EdgeState, string> = {
  done: 'var(--wf-done)',
  active: 'var(--wf-active)',
  pending: 'var(--wf-pending)',
  skipped: 'var(--wf-skipped)',
}

/** Dotted for "not reached", sparser dots for a branch that will never run. */
export const EDGE_DASH: Record<EdgeState, string | undefined> = {
  done: undefined,
  active: '6 5',
  pending: '0.1 5',
  skipped: '0.1 7',
}

export type EdgeSeed = { from: string; to: string; state: (s: StatusMap) => EdgeState }

/** An edge is "active" only while the step it feeds is the one being waited on. */
export const feeds =
  (target: string): EdgeSeed['state'] =>
  (s) => {
    const st = s[target]
    if (st === 'waiting') return 'active'
    if (st === 'skipped') return 'skipped'
    if (st === 'queued') return 'pending'
    return 'done'
  }

/** A branch the run will never take, whatever the statuses say. */
export const never = (): EdgeState => 'skipped'

export function edgeStyle(state: EdgeState, animated: boolean) {
  return {
    stroke: EDGE_STROKE[state],
    strokeWidth: state === 'done' ? 1.5 : 2,
    strokeLinecap: 'round' as const,
    strokeDasharray: animated && state === 'active' ? undefined : EDGE_DASH[state],
  }
}

export function buildStepNodes<D>(
  steps: StepSeed<D>[],
  statuses: StatusMap,
  selectedId: string | null,
): StepNodeType<D>[] {
  return steps.map((s) => ({
    id: s.id,
    type: 'step' as const,
    position: { x: s.x, y: s.y },
    selected: s.id === selectedId,
    style: { width: s.w ?? (s.content ? RICH_W : NODE_W) },
    data: {
      kind: s.kind,
      title: s.title,
      meta: s.meta,
      mono: s.mono,
      initials: s.initials,
      statusLabel: s.statusLabel,
      assignee: s.assignee,
      content: s.content,
      stageId: s.stageId,
      detail: s.detail,
      status: statuses[s.id],
    },
  }))
}

/** One node per folded stage, standing in for all of its steps. */
export function buildFoldNodes<D>(
  stages: StageSeed[],
  steps: StepSeed<D>[],
  folds: Record<string, FoldRect>,
  statuses: StatusMap,
): FoldNodeType[] {
  return stages
    .filter((stage) => folds[stage.id])
    .map((stage) => ({
      id: foldNodeId(stage.id),
      type: 'fold' as const,
      position: folds[stage.id],
      style: { width: FOLD_W },
      // The node is a button of its own; dragging it would only fight the click.
      draggable: false,
      data: {
        stageId: stage.id,
        name: stage.name,
        status: stage.status,
        statuses,
        steps: steps
          .filter((s) => s.stageId === stage.id)
          .map((s) => ({ id: s.id, title: s.title })),
      },
    }))
}

export function buildStepEdges(seeds: EdgeSeed[], statuses: StatusMap, animate: boolean): Edge[] {
  return seeds.map(({ from, to, state }) => {
    const s = state(statuses)
    const active = animate && s === 'active'
    return {
      id: `${from}-${to}`,
      source: from,
      target: to,
      // The dash animation repaints every frame; it is the first thing to drop
      // when zoomed out (see docs/workflows/design.md).
      animated: active,
      style: edgeStyle(s, active),
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: EDGE_STROKE[s] },
    }
  })
}

/** When several edges collapse into one, the busiest state is the one to show. */
const EDGE_RANK: Record<EdgeState, number> = { active: 3, done: 2, pending: 1, skipped: 0 }

/**
 * Edges for a run with folded stages. An edge into or out of a folded stage is re-pointed
 * at that stage's node, edges wholly inside one are dropped, and whatever then
 * shares both ends is drawn once.
 */
export function buildFoldEdges<D>(
  seeds: EdgeSeed[],
  steps: StepSeed<D>[],
  folded: ReadonlySet<string>,
  statuses: StatusMap,
  animate: boolean,
): Edge[] {
  const stageOf = new Map(steps.map((s) => [s.id, s.stageId]))
  const end = (id: string) => {
    const stage = stageOf.get(id)
    return stage !== undefined && folded.has(stage) ? foldNodeId(stage) : id
  }
  const merged = new Map<string, { source: string; target: string; state: EdgeState }>()
  for (const { from, to, state } of seeds) {
    const source = end(from)
    const target = end(to)
    if (source === target) continue
    const s = state(statuses)
    const id = `${source}-${target}`
    const seen = merged.get(id)
    if (!seen || EDGE_RANK[s] > EDGE_RANK[seen.state]) merged.set(id, { source, target, state: s })
  }
  return [...merged].map(([id, { source, target, state }]) => {
    const active = animate && state === 'active'
    return {
      id,
      source,
      target,
      animated: active,
      style: edgeStyle(state, active),
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: EDGE_STROKE[state] },
    }
  })
}
