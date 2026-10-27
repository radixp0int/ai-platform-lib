import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../../../recipes/app-shell'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { RUN_INPUTS } from '../../fixtures/loanRun'
import { renderWorkflowsSpace } from '../shared/workflows-space'
import { WorkflowDetailPage } from './workflow-detail'

const meta = {
  title: 'Workflows/Recipes/Workflow detail',
  component: WorkflowDetailPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One workflow as a page. The Overview tab shows how every run is built, what a run needs and hands back, what each stage does, who decides and how the last month went; Runs lists the latest runs and opens each one’s trace; Versions holds the drafts. "Start a run" opens the start form, and the live-run banner goes to the run on the canvas. Nothing here loads React Flow.',
      },
    },
  },
  args: { startDefaults: RUN_INPUTS },
} satisfies Meta<typeof WorkflowDetailPage>

export default meta
type Story = StoryObj<typeof meta>

/** The commercial loan review, with a run waiting on its analyst. The Approve stage starts open. */
export const Overview: Story = {}

/** The latest runs. Each opens its trace; one is waiting, two approved, one declined at the approval. */
export const Runs: Story = { args: { initialTab: 'runs' } }

/** Versions, and the one thing to do about them: start a draft. */
export const Versions: Story = { args: { initialTab: 'versions' } }

/** The workflow with no run in progress: no banner, and the same page below it. */
export const NoLiveRun: Story = {
  args: { spec: { ...COMMERCIAL_LOAN_SPEC, liveRun: undefined } },
}

/** A run with nobody to wait for: the banner takes the brand colour, not orange. */
export const Running: Story = {
  args: {
    spec: {
      ...COMMERCIAL_LOAN_SPEC,
      liveRun: {
        state: 'running',
        title: 'Live run · Ridgeline Dental · $220,000',
        sub: 'Stage 2 of 5, Gather · running, no one needed yet',
      },
    },
  },
}

/** A long description wraps beside the buttons and never pushes them off the row. */
export const LongDescription: Story = {
  args: {
    spec: {
      ...COMMERCIAL_LOAN_SPEC,
      description: `${COMMERCIAL_LOAN_SPEC.description} Every application over $500,000 also goes to a senior credit officer, and a run that is declined keeps its memo in the loan file so the decision can be reviewed later.`,
    },
  },
}

/** The page under the Workflows menu: from the list, through "Workflow details", to a run's trace. */
export const InAppShell: Story = {
  render: () => (
    <AppShell
      initialPath="/t/alderfinch-treasury/workflows/loan-review"
      renderSpace={renderWorkflowsSpace}
    />
  ),
}
