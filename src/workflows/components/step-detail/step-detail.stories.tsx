import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { APPROVAL, STORY_RUN } from '../../fixtures/storyRun'
import { StepDetail } from './step-detail'
const meta = {
  title: 'Workflows/Components/Step detail',
  component: StepDetail,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="relative h-[720px] w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    step: APPROVAL,
    status: 'waiting',
    runTitle: STORY_RUN.graph.title,
    next: STORY_RUN.graph.steps.filter((s) => ['letter', 'notify'].includes(s.id)),
    decisions: ['approved', 'changes', 'declined'],
    busy: false,
    onClose: fn(),
    onDecide: fn(),
  },
} satisfies Meta<typeof StepDetail>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** A decision is on its way to the server: the form is held until it answers. */
export const Deciding: Story = { args: { busy: true } }

/** A gate that only takes yes or no drops the middle button. */
export const YesOrNo: Story = { args: { decisions: ['approved', 'declined'] } }

/** Once decided there is nothing to answer, so the form and "next" are gone. */
export const Decided: Story = { args: { status: 'approved', decisions: [] } }

/** An agent's step: the same page, with no decision to make. */
export const AgentStep: Story = {
  args: { step: STORY_RUN.graph.stepById.get('risk')!, status: 'done', decisions: [], next: [] },
}
