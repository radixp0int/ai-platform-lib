import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { STORY_RUN } from '../../fixtures/storyRun'
import { buildStepEdges, buildStepNodes } from '../build'
import { StepNode } from '../step-node'
import { EDGE_TOKENS } from '../workflow-canvas'
import { ZoomCluster } from '../zoom-cluster'
import { CanvasLegend } from './canvas-legend'
const nodeTypes = { step: StepNode }
function Canvas({ run = false, zoom = false }: { run?: boolean; zoom?: boolean }) {
  return (
    <div className={`relative h-[620px] ${EDGE_TOKENS}`}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={run ? buildStepNodes(STORY_RUN.graph.steps, STORY_RUN.statuses, null) : []}
          edges={run ? buildStepEdges(STORY_RUN.graph.edges, STORY_RUN.statuses, false) : []}
          nodeTypes={nodeTypes}
          fitView={run}
        >
          <CanvasLegend />
          {zoom && <ZoomCluster />}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
const meta = { title: 'Workflows/Components/Canvas legend', component: Canvas } satisfies Meta<
  typeof Canvas
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** Over a run, where each line style in the key can be found on the canvas. */
export const OverARun: Story = { args: { run: true } }

/** With the zoom cluster: the legend takes the bottom-left corner, the zoom the bottom-right. */
export const BesideTheZoomCluster: Story = { args: { run: true, zoom: true } }
