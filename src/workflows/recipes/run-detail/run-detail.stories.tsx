import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../../../recipes/app-shell'
import { COMMERCIAL_LOAN_TRACE_BUREAU_FAILED } from '../../fixtures/commercialLoanTrace'
import { renderWorkflowsSpace } from '../shared/workflows-space'
import { RunDetailPage } from './run-detail'

const meta = {
  title: 'Workflows/Recipes/Run detail',
  component: RunDetailPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One run’s trace. A row of stage tiles says where the run is; the steps of the chosen stage sit beside one step opened up, with its calls against the clock, the agent’s reasoning, its input and output, and the raw record. The trace comes in as data, so nothing here loads React Flow.',
      },
    },
  },
} satisfies Meta<typeof RunDetailPage>

export default meta
type Story = StoryObj<typeof meta>

/** A commercial loan review waiting on its analyst: it opens on the stage and step the run is at. */
export const WaitingOnAPerson: Story = {}

/** An agent's step: its calls against the clock, and what it concluded. Pick another stage or step to move. */
export const AnAgentAtWork: Story = { args: { initialStageId: 'analyze', initialStepId: 'memo' } }

/** The credit pull timed out and the run carried on; the notice says so. */
export const AFailureThatDidNotStopTheRun: Story = {
  args: { trace: COMMERCIAL_LOAN_TRACE_BUREAU_FAILED, initialStageId: 'gather' },
}

/** The page inside the platform shell, reached from the workflow's Runs tab, with its own trail back. */
export const InsideAppShell: Story = {
  render: () => (
    <AppShell
      initialPath="/t/alderfinch-treasury/workflows/runs/harbor-street"
      renderSpace={renderWorkflowsSpace}
    />
  ),
}
