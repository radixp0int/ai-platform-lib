import type { Meta, StoryObj } from '@storybook/react-vite'
import { APPROVAL, STORY_RUN } from '../../fixtures/storyRun'
import { StepDetails } from './step-details'
const meta = {
  title: 'Workflows/Components/Step details',
  component: StepDetails,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  args: { step: APPROVAL },
} satisfies Meta<typeof StepDetails>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** A system call has no person to lead with: the box is the facts alone. */
export const FactsOnly: Story = { args: { step: STORY_RUN.graph.stepById.get('bureau')! } }

/** An agent's step: the figures it produced, with nobody to lead with. */
export const AgentStep: Story = { args: { step: STORY_RUN.graph.stepById.get('risk')! } }

/** A named person without a deadline: the name stands on its own line. */
export const AssigneeWithoutDue: Story = {
  args: { step: { ...APPROVAL, detail: { ...APPROVAL.detail, due: undefined } } },
}
