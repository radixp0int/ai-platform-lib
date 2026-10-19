import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { placeRun } from '../../engine/layout'
import { rfpResponse } from '../../fixtures/rfpResponse'
import { APPROVAL, STORY_RUN } from '../../fixtures/storyRun'
import { buildStepNodes } from '../build'
import type { StatusMap, StepStatus } from '../types'
import { EDGE_TOKENS } from '../workflow-canvas'
import { MAX_ZOOM, MIN_ZOOM } from '../zoom'
import { StepNode } from './step-node'
const nodeTypes = { step: StepNode }
const KINDS = ['trigger', 'intake', 'bureau', 'policy', 'approve']
const STATUSES: StepStatus[] = [
  'queued',
  'running',
  'waiting',
  'done',
  'approved',
  'changes',
  'failed',
  'skipped',
]
const agent = STORY_RUN.graph.stepById.get('risk')!
// The steps of the RFP run that carry content, laid out by the engine so the
// story also shows the spacing `stepHeight` asks for.
const RICH = ['price', 'quote', 'margin', 'size', 'review', 'legal', 'vendor', 'assemble']
const rich = placeRun(
  rfpResponse.steps.filter((s) => RICH.includes(s.id)),
  rfpResponse.stages,
).steps
const SETS = {
  approval: {
    steps: [{ ...APPROVAL, x: 0, y: 0 }],
    statuses: STORY_RUN.statuses,
    selected: 'approve' as string | null,
  },
  kinds: {
    steps: KINDS.map((id, index) => ({
      ...STORY_RUN.graph.stepById.get(id)!,
      x: (index % 3) * 300,
      y: Math.floor(index / 3) * 140,
    })),
    statuses: STORY_RUN.statuses,
    selected: null,
  },
  statuses: {
    steps: STATUSES.map((status, index) => ({
      ...agent,
      id: `risk-${status}`,
      statusLabel: undefined,
      x: (index % 3) * 300,
      y: Math.floor(index / 3) * 140,
    })),
    statuses: Object.fromEntries(STATUSES.map((status) => [`risk-${status}`, status])) as StatusMap,
    selected: null,
  },
  content: {
    steps: rich.map((s) => ({ ...s, x: s.x - rich[0].x })),
    statuses: {
      price: 'done',
      quote: 'done',
      margin: 'done',
      size: 'done',
      review: 'waiting',
      legal: 'skipped',
      vendor: 'done',
      assemble: 'queued',
    } as StatusMap,
    selected: null,
  },
}
function Canvas({ set = 'approval', zoom = 1 }: { set?: keyof typeof SETS; zoom?: number }) {
  const { steps, statuses, selected } = SETS[set]
  return (
    <div className={`relative h-[620px] ${EDGE_TOKENS}`}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={buildStepNodes(steps, statuses, selected)}
          nodeTypes={nodeTypes}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          defaultViewport={{ x: 100, y: 100, zoom }}
        />
      </ReactFlowProvider>
    </div>
  )
}
const meta = { title: 'Workflows/Components/Step node', component: Canvas } satisfies Meta<
  typeof Canvas
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** Who does the work is the icon: trigger, agent, system call, decision, person. */
export const EveryKind: Story = { args: { set: 'kinds' } }

/** One agent step at each status the marker can show. */
export const EveryStatus: Story = { args: { set: 'statuses' } }

/** Zoomed out, a node drops its result line and keeps icon, title and marker. */
export const Simplified: Story = { args: { set: 'kinds', zoom: 0.6 } }

/** Further out, only the icon and the marker are left. */
export const GlyphOnly: Story = { args: { set: 'kinds', zoom: 0.4 } }

/**
 * Steps that carry `content`: facts, the tools an agent called, a decision’s
 * branches, section progress, a note on an approval, and a step that runs
 * another workflow. They are wider, and the column is spaced by their height.
 */
export const WithContent: Story = { args: { set: 'content', zoom: 0.8 } }
