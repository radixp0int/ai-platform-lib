import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { RECENT_RUNS } from '../../fixtures/workflowSummaries'
import { RecentRuns } from './recent-runs'

const meta = {
  title: 'Workflows/Components/Recent runs',
  component: RecentRuns,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: { runs: RECENT_RUNS, activeId: 'rfp-response', onOpen: fn() },
} satisfies Meta<typeof RecentRuns>
export default meta
type Story = StoryObj<typeof meta>

/** Grouped by what each run needs. A waiting one says how long it has left. */
export const Default: Story = {}

/**
 * Nothing needs a person, so that group is left out rather than shown empty,
 * and the run on screen is not one of these, so none is marked.
 */
export const NothingWaiting: Story = {
  args: {
    runs: RECENT_RUNS.filter((run) => run.state !== 'waiting'),
    activeId: null,
  },
}

export const Empty: Story = { args: { runs: [] } }
