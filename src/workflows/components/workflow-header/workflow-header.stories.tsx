import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { shapeLine } from '../workflow-spec'
import { WorkflowHeader } from './workflow-header'

const spec = COMMERCIAL_LOAN_SPEC

const meta = {
  title: 'Workflows/Components/Workflow header',
  component: WorkflowHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-[72rem] p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    name: spec.name,
    description: spec.description,
    meta: [
      ['Owner', spec.owner],
      ['Starts when', spec.startsWhen],
      ['Version', spec.version],
      ['Shape', shapeLine(spec)],
    ],
    liveRun: spec.liveRun,
    onEdit: fn(),
    onStart: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'The top of a workflow’s page: its name and purpose, the two things you do to it, the facts that identify it, and a banner that opens the run in progress.',
      },
    },
  },
} satisfies Meta<typeof WorkflowHeader>
export default meta
type Story = StoryObj<typeof meta>

/** A run waiting on a person: the banner is orange and says who. */
export const WaitingOnAPerson: Story = {}

/** A run with nobody to wait for: the banner takes the brand colour. */
export const Running: Story = {
  args: {
    liveRun: {
      state: 'running',
      title: 'Live run · Ridgeline Dental · $220,000',
      sub: 'Stage 2 of 5, Gather · running, no one needed yet',
    },
  },
}

/** No run in progress: no banner. */
export const NoLiveRun: Story = { args: { liveRun: undefined } }

/** A long description wraps beside the buttons and never pushes them off the row. */
export const LongDescription: Story = {
  args: {
    description: `${spec.description} Every application over $500,000 also goes to a senior credit officer, and a run that is declined keeps its memo in the loan file so the decision can be reviewed later.`,
  },
}
