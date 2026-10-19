import type { Meta, StoryObj } from '@storybook/react-vite'
import { STORY_RUN } from '../../fixtures/storyRun'
import { NextIfApproved } from './next-if-approved'
const meta = {
  title: 'Workflows/Components/Next if approved',
  component: NextIfApproved,
  tags: ['autodocs'],
  args: { steps: STORY_RUN.graph.steps.filter((s) => ['letter', 'notify'].includes(s.id)) },
} satisfies Meta<typeof NextIfApproved>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** One step left: the list is still drawn, so the reader knows it is the last. */
export const SingleStep: Story = {
  args: { steps: STORY_RUN.graph.steps.filter((s) => s.id === 'notify') },
}

/** Approving early in a run sets a lot going, and the list says how much. */
export const ManySteps: Story = {
  args: {
    steps: STORY_RUN.graph.steps.filter((s) =>
      ['risk', 'memo', 'policy', 'letter', 'notify'].includes(s.id),
    ),
  },
}
