import type { Meta, StoryObj } from '@storybook/react-vite'
import { WORKFLOW_SUMMARIES } from '../../fixtures/workflowSummaries'
import { FlowBlueprint } from './flow-blueprint'

const stagesOf = (id: string) => WORKFLOW_SUMMARIES.find((w) => w.id === id)!.stages

const meta = {
  title: 'Workflows/Components/Flow blueprint',
  component: FlowBlueprint,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="rounded-surface border border-line bg-canvas">
        <Story />
      </div>
    ),
  ],
  args: { stages: stagesOf('loan-review'), label: 'Commercial loan review: stage 4 of 5, Approve' },
} satisfies Meta<typeof FlowBlueprint>
export default meta
type Story = StoryObj<typeof meta>

/** Five stages, stopped at an approval. The second approval is a branch this run skips. */
export const WaitingOnAPerson: Story = {}

/** Ten stages in the same width: the lanes narrow, the bars stay readable. */
export const TenStages: Story = {
  args: {
    stages: stagesOf('loan-origination'),
    label: 'Commercial loan origination: stage 7 of 10, Approve',
  },
}

/** Two steps in progress; the lines into them are dashed. */
export const Running: Story = {
  args: { stages: stagesOf('incident-triage'), label: 'Incident triage: stage 4 of 9, Diagnose' },
}

/** No live run: the shape the next run will take. */
export const NotStarted: Story = {
  args: { stages: stagesOf('kyc-refresh'), label: 'KYC refresh: not started, 9 stages' },
}
