import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { STORY_RUN } from '../../fixtures/storyRun'
import { RunOutlineRail } from './run-outline-rail'

const meta = {
  title: 'Workflows/Components/Run outline rail',
  component: RunOutlineRail,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // Drawn the way the menu's rail holds it: 64px wide, icons centred.
      <aside className="flex h-[560px] w-16 flex-col items-center border-r border-line bg-panel-solid py-3">
        <Story />
      </aside>
    ),
  ],
  args: {
    stages: STORY_RUN.graph.stages,
    needs: [{ stepId: 'approve', title: 'Credit approval', sub: 'Dana Whitfield · due 3h 40m' }],
    selectedStageId: 'decide',
    onSelectStage: fn(),
    onOpenStep: fn(),
    selectedStepId: 'approve',
  },
} satisfies Meta<typeof RunOutlineRail>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** Nothing waiting: the badge goes, and the stages are all there is. */
export const NothingWaiting: Story = { args: { needs: [], selectedStepId: null } }

/** Two approvals open: one badge, counting both. */
export const TwoApprovals: Story = {
  args: {
    needs: [
      { stepId: 'approve', title: 'Approve elevated access', sub: 'Security · due today' },
      { stepId: 'senior', title: 'Confirm background check', sub: 'People team · due tomorrow' },
    ],
    selectedStageId: null,
  },
}
