import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { APPROVAL, APPROVAL_IO } from '../../fixtures/storyRun'
import { StepInspector } from './step-inspector'
const meta = {
  title: 'Workflows/Components/Step inspector',
  component: StepInspector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-[720px] w-100 flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    step: APPROVAL,
    status: 'waiting',
    io: APPROVAL_IO,
    decisions: ['approved', 'changes', 'declined'],
    busy: false,
    onClose: fn(),
    onExpand: fn(),
    onDecide: fn(),
  },
} satisfies Meta<typeof StepInspector>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Empty: Story = { args: { step: null } }
export const Busy: Story = { args: { busy: true } }
