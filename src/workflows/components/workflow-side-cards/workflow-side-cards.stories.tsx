import type { Meta, StoryObj } from '@storybook/react-vite'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { WorkflowApprovers, WorkflowStats, WorkflowSystems } from './workflow-side-cards'

const spec = COMMERCIAL_LOAN_SPEC

const meta = {
  title: 'Workflows/Components/Workflow side cards',
  component: WorkflowApprovers,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[22rem] max-w-full p-6">
        <Story />
      </div>
    ),
  ],
  args: { approvers: spec.approvers },
  parameters: {
    docs: {
      description: {
        component:
          'The three small cards beside a workflow’s stages. Who decides names the approval steps and who answers them, a named person with their initials and a role with a dashed outline. Connected systems lists what the workflow reaches. Last 30 days gives four numbers and a line on what they mean.',
      },
    },
  },
} satisfies Meta<typeof WorkflowApprovers>
export default meta
type Story = StoryObj<typeof meta>

/** A named analyst, and a role that only applies to larger loans. */
export const Approvers: Story = {}

/** Nobody is named: every approval is a role. */
export const ApproversByRole: Story = {
  args: { approvers: spec.approvers.map((a) => ({ ...a, initials: undefined })) },
}

export const Systems: Story = {
  render: () => <WorkflowSystems systems={spec.systems} />,
}

/** Many systems wrap onto more lines rather than overflowing. */
export const ManySystems: Story = {
  render: () => (
    <WorkflowSystems
      systems={[
        ...spec.systems,
        'core.book_loan',
        'esign.send',
        'appraisal.order',
        'tax.transcript',
        'sanctions.screen',
      ]}
    />
  ),
}

export const Stats: Story = {
  render: () => <WorkflowStats stats={spec.stats} note={spec.statsNote} />,
}

/** Without a note, the numbers stand alone. */
export const StatsWithoutNote: Story = {
  render: () => <WorkflowStats stats={spec.stats} heading="Last 7 days" />,
}
