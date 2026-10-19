import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { STORY_RUN } from '../../fixtures/storyRun'
import { StageInspector } from './stage-inspector'
const meta = {
  title: 'Workflows/Components/Stage inspector',
  component: StageInspector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-[720px] w-100 flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    stage: STORY_RUN.graph.stages[3],
    steps: STORY_RUN.graph.steps.filter((s) => s.stageId === STORY_RUN.graph.stages[3].id),
    statuses: STORY_RUN.statuses,
    selectedStepId: 'approve',
    onSelectStep: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof StageInspector>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

const stageArgs = (index: number) => ({
  stage: STORY_RUN.graph.stages[index],
  steps: STORY_RUN.graph.steps.filter((s) => s.stageId === STORY_RUN.graph.stages[index].id),
})

/** A stage the run has finished: every step done, nothing to act on. */
export const FinishedStage: Story = { args: { ...stageArgs(1), selectedStepId: null } }

/** A stage the run has not reached: its steps are listed as queued. */
export const UpcomingStage: Story = { args: { ...stageArgs(4), selectedStepId: null } }

/** The current stage with no step picked yet. */
export const NoStepSelected: Story = { args: { selectedStepId: null } }
