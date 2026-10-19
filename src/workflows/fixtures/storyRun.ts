import { createStaticRunSource } from '../engine/staticSource'
import type { RunEvent } from '../engine/types'
type Snapshot = Extract<RunEvent, { type: 'snapshot' }>
function snapshot(): Snapshot {
  let value: Snapshot | undefined
  const unsubscribe = createStaticRunSource().subscribe((event) => {
    if (event.type === 'snapshot') value = event
  })
  unsubscribe()
  if (!value) throw new Error('The static run must provide its snapshot immediately')
  return value
}
export const STORY_RUN = snapshot()
export const APPROVAL = STORY_RUN.graph.stepById.get('approve')!
