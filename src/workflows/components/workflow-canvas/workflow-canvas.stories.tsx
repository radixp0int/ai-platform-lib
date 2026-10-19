import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useState } from 'react'
import { STORY_RUN } from '../../fixtures/storyRun'
import { EDGE_TOKENS } from '../workflow-canvas'
import { WorkflowCanvas } from './workflow-canvas'
function Canvas({
  step = 'approve',
  stage = null,
  folded = [],
}: {
  step?: string | null
  stage?: string | null
  folded?: string[]
}) {
  const [selected, setSelected] = useState<string | null>(step)
  const [selectedStage, setSelectedStage] = useState<string | null>(stage)
  const [foldedIds, setFoldedIds] = useState(folded)
  const [foldFocus, setFoldFocus] = useState<{ stageId: string | null; seq: number }>({
    stageId: null,
    seq: 0,
  })
  return (
    <div className={`relative h-[620px] ${EDGE_TOKENS}`}>
      <ReactFlowProvider>
        <WorkflowCanvas
          graph={STORY_RUN.graph}
          statuses={STORY_RUN.statuses}
          selectedId={selected}
          onSelect={setSelected}
          selectedStageId={selectedStage}
          onSelectStage={(id) => setSelectedStage((current) => (current === id ? null : id))}
          stageFocusSeq={0}
          foldedStageIds={foldedIds}
          onToggleFold={(id) => {
            setFoldedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
            setFoldFocus((f) => ({ stageId: id, seq: f.seq + 1 }))
          }}
          foldFocus={foldFocus}
        />
      </ReactFlowProvider>
    </div>
  )
}
const meta = { title: 'Workflows/Components/Workflow canvas', component: Canvas } satisfies Meta<
  typeof Canvas
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
/** The finished stages folded to their bars; the stage the run is on stays open. */
export const Folded: Story = { args: { folded: ['intake', 'gather'] } }

/** Nothing picked: the canvas as it is before anyone clicks. */
export const NothingSelected: Story = { args: { step: null } }

/** A stage picked from its lane header: the lane is highlighted. */
export const StageSelected: Story = { args: { step: null, stage: 'analyze' } }
