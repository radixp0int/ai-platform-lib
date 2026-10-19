import type { Meta, StoryObj } from '@storybook/react-vite'
import { APPROVAL } from '../../fixtures/storyRun'
import { Recommendation } from './recommendation'
const meta = {
  title: 'Workflows/Components/Recommendation',
  component: Recommendation,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  args: { rec: APPROVAL.detail.recommendation! },
} satisfies Meta<typeof Recommendation>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** A different verdict, with the figures that led to it. */
export const Decline: Story = {
  args: {
    rec: {
      from: 'Risk scoring agent · 4 sources',
      verdict: 'Decline: coverage is under 1.0x on stressed cash flow',
      figures: [
        ['DSCR', '0.92x'],
        ['Leverage', '5.1x'],
        ['Risk grade', '7'],
      ],
    },
  },
}

/** The heading is the run's to word. */
export const CustomLabel: Story = {
  args: {
    rec: {
      label: 'Triage recommendation',
      from: 'Incident agent · 3 dashboards',
      verdict: 'Roll back release 4.18.2',
      figures: [
        ['p99', '2.4 s'],
        ['Error rate', '3.1%'],
        ['Since', '14:02'],
      ],
    },
  },
}
