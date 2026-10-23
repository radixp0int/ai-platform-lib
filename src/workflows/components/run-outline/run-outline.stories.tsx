import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { STORY_RUN } from '../../fixtures/storyRun'
import { RECENT_RUNS } from '../../fixtures/workflowSummaries'
import { RunOutline } from './run-outline'
const meta = {
  title: 'Workflows/Components/Run outline',
  component: RunOutline,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // Drawn the way the platform menu holds it: the menu's width and padding.
      <aside className="flex h-[720px] w-62 flex-col border-r border-line bg-panel-solid p-3">
        <Story />
      </aside>
    ),
  ],
  args: {
    header: STORY_RUN.graph.header,
    stages: STORY_RUN.graph.stages,
    needs: [{ stepId: 'approve', title: 'Credit approval', sub: 'Dana Whitfield · due 3h 40m' }],
    selectedStageId: 'decide',
    onSelectStage: fn(),
    variants: [],
    variantId: 'loan-review',
    onVariant: fn(),
    onOpenStep: fn(),
    selectedStepId: 'approve',
  },
} satisfies Meta<typeof RunOutline>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** Nothing is waiting: the section stays, and says so, rather than vanishing. */
export const NothingWaiting: Story = { args: { needs: [], selectedStepId: null } }

/** A run can stop on two people at once. Both are listed, and the count reads 2. */
export const TwoApprovals: Story = {
  args: {
    needs: [
      { stepId: 'approve', title: 'Approve elevated access', sub: 'Security · due today' },
      { stepId: 'senior', title: 'Confirm background check', sub: 'People team · due tomorrow' },
    ],
    selectedStageId: null,
  },
}

/** With more than one workflow to show, a picker appears under the run's own card. */
export const WithVariants: Story = {
  args: {
    variants: [
      { id: 'loan-review', label: 'Commercial loan review', blurb: 'One gate, three answers.' },
      {
        id: 'incident-triage',
        label: 'Incident triage',
        blurb: 'A step fails and the run carries on.',
      },
      { id: 'onboarding', label: 'Employee onboarding', blurb: 'Two approvals open together.' },
    ],
  },
}

/** Given `onToggleFold`, each stage has an eye. A filled one means the canvas draws it in full. */
export const WithFolds: Story = {
  args: { foldedStageIds: ['intake', 'gather'], onToggleFold: fn(), selectedStageId: null },
}

/** Given other runs to switch to, the section splits into Stages and Recent. */
export const WithRecent: Story = {
  args: {
    recent: RECENT_RUNS,
    activeRecentId: 'loan-review',
    onOpenRecent: fn(),
    foldedStageIds: ['intake'],
    onToggleFold: fn(),
    selectedStageId: null,
  },
}
