import type { Meta, StoryObj } from '@storybook/react-vite'
import { COMMERCIAL_LOAN_TRACE } from '../../fixtures/commercialLoanTrace'
import { TraceSequence } from './trace-sequence'

const step = (id: string) => COMMERCIAL_LOAN_TRACE.steps.find((s) => s.id === id)!

const meta = {
  title: 'Workflows/Components/Trace sequence',
  component: TraceSequence,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[40rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: { calls: step('memo').calls!, duration: step('memo').duration! },
  parameters: {
    docs: {
      description: {
        component:
          'The calls inside one step, in order, each with a bar drawn against the step’s own duration. Below `sm` the bar drops and the rest stays.',
      },
    },
  },
} satisfies Meta<typeof TraceSequence>
export default meta
type Story = StoryObj<typeof meta>

/** The credit memo: model calls with two tool lookups between them. */
export const Mixed: Story = {}

/** One long model call and two short ones around it: the bars show where the time went. */
export const OneCallDominates: Story = {
  args: { calls: step('intake').calls!, duration: step('intake').duration! },
}

/** Reading the returns, then spreading them: the tool call comes first and sets the pace. */
export const ToolFirst: Story = {
  args: { calls: step('spread').calls!, duration: step('spread').duration! },
}

export const SingleCall: Story = {
  args: { calls: step('risk').calls!, duration: step('risk').duration! },
}
