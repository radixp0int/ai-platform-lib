import type { Meta, StoryObj } from '@storybook/react-vite'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { WorkflowStageList } from './workflow-stage-list'

const meta = {
  title: 'Workflows/Components/Workflow stage list',
  component: WorkflowStageList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-[56rem] p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    stages: COMMERCIAL_LOAN_SPEC.stages,
    timeNote: COMMERCIAL_LOAN_SPEC.timeNote,
  },
  parameters: {
    docs: {
      description: {
        component:
          'What each stage does, one row per stage: number, name, usual time, and the steps in it as chips. A chevron opens the stage to say what it is for and show each step as a card. Any number can be open; Expand all opens them every one.',
      },
    },
  },
} satisfies Meta<typeof WorkflowStageList>
export default meta
type Story = StoryObj<typeof meta>

/** Every stage closed: the whole workflow reads in five lines. */
export const Collapsed: Story = {}

/** The approval stage open: who decides, how long they have, and where a request for changes goes. */
export const ApprovalOpen: Story = { args: { defaultOpenIds: ['approve'] } }

/** Everything open, with the button now offering to close it. */
export const AllOpen: Story = {
  args: { defaultOpenIds: COMMERCIAL_LOAN_SPEC.stages.map((stage) => stage.id) },
}

/** Two stages and no time note. */
export const Short: Story = {
  args: { stages: COMMERCIAL_LOAN_SPEC.stages.slice(0, 2), timeNote: undefined },
}
