import type { Meta, StoryObj } from '@storybook/react-vite'
import { APPROVAL } from '../../fixtures/storyRun'
import { HowItGotHere } from './how-it-got-here'
const meta = {
  title: 'Workflows/Components/How it got here',
  component: HowItGotHere,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  args: { trace: APPROVAL.detail.trace! },
} satisfies Meta<typeof HowItGotHere>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** One entry is still a list: the step may gain more as the run goes on. */
export const SingleEntry: Story = {
  args: { trace: [['0:04', 'Started by the loan portal', '12 ms']] },
}

/** A long trail, as a step that was retried leaves behind. */
export const LongTrail: Story = {
  args: {
    trace: [
      ['0:04', 'Classified the application', '1.2 s'],
      ['0:48', 'Pulled the business credit file', '3.4 s'],
      ['2:00', 'Spread three years of financials', '41 s'],
      ['3:27', 'Checked policy: one exception found', '0.8 s'],
      ['3:32', 'KYC failed on beneficial owner #3', '2.1 s'],
      ['4:20', 'Sent back: re-run KYC on owner #3', '—'],
      ['6:05', 'KYC passed on the second attempt', '2.4 s'],
      ['6:10', 'Routed to Dana Whitfield for approval', '—'],
    ],
  },
}
