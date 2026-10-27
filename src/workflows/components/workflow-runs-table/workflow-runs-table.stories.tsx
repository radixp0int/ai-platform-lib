import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { WorkflowRunsTable } from './workflow-runs-table'

const spec = COMMERCIAL_LOAN_SPEC

const meta = {
  title: 'Workflows/Components/Workflow runs table',
  component: WorkflowRunsTable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-[72rem] p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    runs: spec.runs,
    stageCount: spec.stages.length,
    total: spec.runsTotal,
    hrefFor: (run) => `#${run.id}`,
    onShowAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'A workflow’s latest runs: name, result in a word and a dot, progress through the stages, when it started and how long it took. Each row is a link to that run’s trace.',
      },
    },
  },
} satisfies Meta<typeof WorkflowRunsTable>
export default meta
type Story = StoryObj<typeof meta>

/** One run waiting on its analyst, two approved and one declined at the approval. */
export const Default: Story = {}

/** A run still going with nobody to wait for. */
export const Running: Story = {
  args: {
    runs: [
      {
        id: 'ridgeline',
        name: 'Ridgeline Dental · $220,000',
        startedBy: 'Dana Whitfield',
        result: 'Running',
        state: 'running',
        stagesDone: 1,
        progress: 'Stage 2 of 5 · Gather',
        started: 'Today 09:40',
      },
      ...spec.runs.slice(1),
    ],
  },
}

/** A workflow that has only just started: its one run, and no history. */
export const FirstRun: Story = { args: { runs: spec.runs.slice(0, 1), total: 1 } }
