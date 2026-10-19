import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { STORY_RUN } from '../../fixtures/storyRun'
import { EDGE_TOKENS } from '../workflow-canvas'
import { useState } from 'react'
import { StageLanes } from './stage-lanes'
function Canvas({ selected = null }: { selected?: string | null }) {
  const [stage, setStage] = useState<string | null>(selected)
  return (
    <div className={`relative h-[620px] ${EDGE_TOKENS}`}>
      <ReactFlowProvider>
        <ReactFlow nodes={[]}>
          <StageLanes
            stages={STORY_RUN.graph.stages}
            lanes={STORY_RUN.graph.lanes}
            top={0}
            bottom={450}
            selectedStageId={stage}
            onSelectStage={(id) => setStage((current) => (current === id ? null : id))}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
const meta = { title: 'Workflows/Components/Stage lanes', component: Canvas } satisfies Meta<
  typeof Canvas
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** The stage being looked at takes the accent border and a stronger wash. */
export const StageSelected: Story = { args: { selected: 'approve' } }

/** A finished stage selected: selection and progress are separate facts, so it
 *  is highlighted without being marked as where the run is. */
export const FinishedStageSelected: Story = { args: { selected: 'intake' } }
