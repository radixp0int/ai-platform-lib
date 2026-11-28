import type { GlanceStage, GlanceState, GlanceStep } from './types'

// Which stages and steps the runs list shows when a run is too long to list
// them all. Plain functions, so the rules can be read and tested on their own.

/** A stage line or step chain past this many entries is windowed. */
export const STAGE_WINDOW = 6
export const STEP_WINDOW = 7

export type Windowed<T> =
  | { kind: 'item'; item: T }
  /** "✓ 3 stages done", or "+2 done". */
  | { kind: 'done'; count: number }
  /** "+4 more". */
  | { kind: 'more'; count: number }

const ACTIVE: GlanceState[] = ['needs', 'waiting', 'running', 'failed']

/** The stage the run is on: the first one that is neither done nor still to come. */
export function currentIndex(items: { state: GlanceState }[]): number {
  return items.findIndex((item) => ACTIVE.includes(item.state))
}

/**
 * Up to six stages, every one. Past that: how many are done before the
 * previous stage, then the previous, current and next stages, and how many
 * more follow.
 */
export function windowStages(stages: GlanceStage[]): Windowed<GlanceStage>[] {
  const all = stages.map((item) => ({ kind: 'item' as const, item }))
  if (stages.length <= STAGE_WINDOW) return all
  const at = currentIndex(stages)
  if (at < 0) return all.slice(0, STAGE_WINDOW)
  const from = Math.max(0, at - 1)
  const to = Math.min(stages.length, at + 2)
  const out: Windowed<GlanceStage>[] = []
  if (from > 0) out.push({ kind: 'done', count: from })
  out.push(...all.slice(from, to))
  if (to < stages.length) out.push({ kind: 'more', count: stages.length - to })
  return out
}

/**
 * Up to seven steps, every one. Past that: how many are done before the last
 * done step, that step, every current step (parallel ones all show), the next
 * two, and how many more follow.
 */
export function windowSteps(steps: GlanceStep[]): Windowed<GlanceStep>[] {
  const all = steps.map((item) => ({ kind: 'item' as const, item }))
  if (steps.length <= STEP_WINDOW) return all
  const current = steps.flatMap((step, i) => (ACTIVE.includes(step.state) ? [i] : []))
  if (current.length === 0) return all.slice(0, STEP_WINDOW)
  const first = current[0]
  const last = current[current.length - 1]
  const from = Math.max(0, first - 1)
  const to = Math.min(steps.length, last + 3)
  const out: Windowed<GlanceStep>[] = []
  if (from > 0) out.push({ kind: 'done', count: from })
  out.push(...all.slice(from, to))
  if (to < steps.length) out.push({ kind: 'more', count: steps.length - to })
  return out
}

/** "Approve · 2 of 3 steps" when one step holds the stage; "Diagnose · 3 steps" while several run. */
export function chainHeading(stage: GlanceStage | undefined, steps: GlanceStep[]): string {
  const n = `${steps.length} step${steps.length === 1 ? '' : 's'}`
  const current = steps.flatMap((step, i) => (ACTIVE.includes(step.state) ? [i] : []))
  const lead = stage ? `${stage.name} · ` : ''
  if (current.length === 1 && steps[current[0]].state !== 'running') {
    return `${lead}${current[0] + 1} of ${n}`
  }
  return `${lead}${n}`
}
