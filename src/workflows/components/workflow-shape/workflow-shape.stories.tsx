import type { Meta, StoryObj } from '@storybook/react-vite'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { WorkflowShape } from './workflow-shape'

const meta = {
  title: 'Workflows/Components/Workflow shape',
  component: WorkflowShape,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-[72rem] p-6">
        <Story />
      </div>
    ),
  ],
  args: { name: COMMERCIAL_LOAN_SPEC.name, stages: COMMERCIAL_LOAN_SPEC.stages },
  parameters: {
    docs: {
      description: {
        component:
          'How every run of a workflow is built: numbered lanes, one bar per step, lines for what feeds what. A step that only runs sometimes is dashed. It is a definition, so nothing is done or waiting.',
      },
    },
  },
} satisfies Meta<typeof WorkflowShape>
export default meta
type Story = StoryObj<typeof meta>

/** Five stages, with a branch: the second approval runs only on larger loans. */
export const CommercialLoanReview: Story = {}

/** Two stages: the lanes widen to fill the card. */
export const Short: Story = { args: { stages: COMMERCIAL_LOAN_SPEC.stages.slice(0, 2) } }

/** Narrow: the card scrolls sideways rather than squeezing the lanes. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-[30rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}
