import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { STORY_RUN } from '../../fixtures/storyRun'
import { buildStepNodes } from '../build'
import { StepNode } from '../step-node'
import { EDGE_TOKENS } from '../workflow-canvas'
import { MAX_ZOOM, MIN_ZOOM } from '../zoom'
import { ZoomCluster } from './zoom-cluster'
const nodeTypes = { step: StepNode }
function Canvas({ zoom = 1, run = false }: { zoom?: number; run?: boolean }) {
  return (
    <div className={`relative h-[620px] ${EDGE_TOKENS}`}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={run ? buildStepNodes(STORY_RUN.graph.steps, STORY_RUN.statuses, null) : []}
          nodeTypes={nodeTypes}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          defaultViewport={{ x: 40, y: 40, zoom }}
        >
          <ZoomCluster />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
const meta = { title: 'Workflows/Components/Zoom cluster', component: Canvas } satisfies Meta<
  typeof Canvas
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** Zoomed out, the readout names the tier, so a node shedding its subtitle
 *  reads as intended rather than as a fault. */
export const ZoomedOut: Story = { args: { zoom: 0.55, run: true } }

/** At the floor: icons only. The cluster still says where you are. */
export const AtTheFloor: Story = { args: { zoom: 0.35, run: true } }

/** Over a run at full size, the state the canvas opens in. */
export const OverARun: Story = { args: { run: true } }
