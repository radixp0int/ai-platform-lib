import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { placeRun } from '../../engine/layout'
import { APPROVAL, STORY_RUN } from '../../fixtures/storyRun'
import type { WireStage, WireStep, WireStepContent, WireStepKind } from '../../engine/wireProtocol'
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
// Steps that carry `content`, laid out by the engine so the story also shows the
// spacing `stepHeight` asks for. One of each shape the canvas can draw.
const withContent = (
  id: string,
  kind: WireStepKind,
  title: string,
  column: number,
  row: number,
  content?: WireStepContent,
): WireStep => ({
  id,
  kind,
  stageId: ['gather', 'analyze', 'approve'][Math.min(column, 2)],
  title,
  meta: 'Queued',
  column,
  row,
  content,
  detail: { summary: '', rows: [] },
})
const CONTENT_STAGES: WireStage[] = ['gather', 'analyze', 'approve'].map((id) => ({
  id,
  name: id,
  sub: '',
  status: 'upcoming',
}))
const rich = placeRun(
  [
    withContent('pull', 'tool', 'credit_bureau.pull', 0, 0, {
      facts: [
        ['Request', 'POST /bureau/pull'],
        ['Result', '201 Created'],
      ],
    }),
    withContent('spread', 'agent', 'Spread financials', 0, 1, {
      progress: { done: 2, total: 3, label: '2 of 3 years' },
      tools: ['docs.read', 'ocr.extract'],
    }),
    withContent('policy', 'decision', 'Policy check', 1, 0, {
      branches: [
        { when: 'Exception', to: 'Senior review', taken: true },
        { when: 'Clear', to: 'Approve' },
      ],
    }),
    withContent('kyc', 'flow', 'Verify owners', 1, 1, {
      progress: { done: 1, total: 2, label: '1 of 2 stages' },
    }),
    withContent('approve', 'human', 'Approve credit memo', 2, 0, {
      note: 'Approve with conditions',
    }),
    withContent('senior', 'human', 'Senior officer review', 2, 1),
  ],
  CONTENT_STAGES,
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
      pull: 'done',
      spread: 'running',
      policy: 'done',
      kyc: 'running',
      approve: 'waiting',
      senior: 'skipped',
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
