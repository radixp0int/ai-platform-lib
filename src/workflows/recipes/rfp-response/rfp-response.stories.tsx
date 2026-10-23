import type { Meta, StoryObj } from '@storybook/react-vite'
import { rfpResponse } from '../../fixtures/rfpResponse'
import { RECENT_RUNS } from '../../fixtures/workflowSummaries'
import { FixtureWorkflow } from '../shared/fixture-workflow'

const meta = {
  title: 'Workflows/Recipes/RFP response',
  component: FixtureWorkflow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A ten-stage run, stopped at a review. It is long enough that it opens folded: the stage the run is on and its neighbours are drawn in full, the rest fold to one bar per step. Its steps carry structured content — facts, a decision’s branches, section progress, the tools an agent called and a step that runs another workflow. The run outline has a Recent tab for changing run. No server is required.',
      },
    },
  },
  args: {
    script: rfpResponse,
    recent: RECENT_RUNS,
    activeRecentId: 'rfp-response',
  },
  argTypes: { script: { control: false }, options: { control: false }, recent: { control: false } },
} satisfies Meta<typeof FixtureWorkflow>

export default meta
type Story = StoryObj<typeof meta>

/** Fold or unfold a stage from its lane header, a folded node, or the eye in the run outline. */
export const AwaitingReview: Story = {}

/** The same run opened with nothing folded: every step drawn. */
export const EveryStep: Story = { args: { folds: 'none' } }

/** Approved: the run carries on through Assemble and Submit, and the current stage unfolds. */
export const Approved: Story = { args: { options: { decisions: { review: 'approved' } } } }
