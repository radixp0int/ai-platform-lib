import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DecisionForm } from './decision-form'
const meta = {
  title: 'Workflows/Components/Decision form',
  component: DecisionForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  args: {
    id: 'decision-note',
    decisions: ['approved', 'changes', 'declined'],
    busy: false,
    onDecide: fn(),
  },
} satisfies Meta<typeof DecisionForm>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Busy: Story = { args: { busy: true } }
export const ApproveOrDecline: Story = { args: { decisions: ['approved', 'declined'] } }
