import type { Meta, StoryObj } from '@storybook/react-vite'
import { APPROVAL } from '../../fixtures/storyRun'
import { PolicyException } from './policy-exception'
const meta = {
  title: 'Workflows/Components/Policy exception',
  component: PolicyException,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  args: { exc: APPROVAL.detail.exception! },
} satisfies Meta<typeof PolicyException>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** The heading is the run's to word: another workflow calls its caveat something else. */
export const CustomLabel: Story = {
  args: {
    exc: {
      label: 'Access exception',
      text: 'Production database access is requested before the 30-day mark.',
      mitigant: 'Read-only role, expiring automatically after 14 days.',
    },
  },
}

/** Long text wraps beside the flag; the flag stays at the first line. */
export const LongText: Story = {
  args: {
    exc: {
      text: 'The guarantor score of 672 is under the 680 floor, and revenue is down 18% year over year, which together put the request outside two guidelines at once.',
      mitigant:
        'A first lien on receivables and equipment, quarterly covenant testing, and a cash sweep above 3.5x leverage were offered in return.',
    },
  },
}
