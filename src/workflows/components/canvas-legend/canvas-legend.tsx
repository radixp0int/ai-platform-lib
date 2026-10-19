import { LegendLine } from './legend-line'
// The two floating clusters on the canvas: what the symbols mean, and where the
// zoom is. The zoom readout names the tier, so a node shedding its subtitle
// never looks like a bug.
import { Panel } from '@xyflow/react'
import { KindIcon } from '../kind-icon'
import type { EdgeState, StepKind } from '../types'

const KINDS: [StepKind, string][] = [
  ['agent', 'Agent'],
  ['human', 'Person'],
  ['tool', 'System call'],
  ['decision', 'Decision'],
]

const EDGES: [EdgeState, string][] = [
  ['done', 'Done'],
  ['active', 'Waiting on this step'],
  ['pending', 'Not reached yet'],
  ['skipped', 'Skipped branch'],
]

export function CanvasLegend() {
  return (
    <Panel position="bottom-left">
      <div className="glass grid grid-cols-2 gap-x-7 gap-y-2.5 rounded-surface px-4 py-3.5">
        {KINDS.map(([kind, label], i) => (
          <div key={kind} className="contents">
            <div className="flex items-center gap-2.5 text-xs whitespace-nowrap text-ink">
              <KindIcon kind={kind} size={16} />
              {label}
            </div>
            <div className="flex items-center gap-2.5 text-xs whitespace-nowrap text-ink">
              <LegendLine state={EDGES[i][0]} />
              {EDGES[i][1]}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
