import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import {
  COMMERCIAL_LOAN_TRACE,
  COMMERCIAL_LOAN_TRACE_BUREAU_FAILED,
} from '../../fixtures/commercialLoanTrace'
import { TraceInspector } from './trace-inspector'

const step = (id: string, trace = COMMERCIAL_LOAN_TRACE) => trace.steps.find((s) => s.id === id)!
const stageName = (id: string) =>
  COMMERCIAL_LOAN_TRACE.stages.find((s) => s.id === step(id).stageId)!.name

const meta = {
  title: 'Workflows/Components/Trace inspector',
  component: TraceInspector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[52rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    step: step('memo'),
    stageName: stageName('memo'),
    runId: COMMERCIAL_LOAN_TRACE.id,
    onTabChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'One step opened up. A step that called a model shows its calls against the clock and the model’s own account of its reasoning; a tool or a person shows what it was asked and what it returned. Three tabs: the trace, the input and output side by side, and the raw record.',
      },
    },
  },
} satisfies Meta<typeof TraceInspector>
export default meta
type Story = StoryObj<typeof meta>

/** The credit memo: model calls mixed with two lookups, and the agent's reasoning. */
export const AgentStep: Story = {}

/** A tool that timed out. The notice says the run went on, because that is what a reader came to find out. */
export const FailedTool: Story = {
  args: {
    step: step('bureau', COMMERCIAL_LOAN_TRACE_BUREAU_FAILED),
    stageName: stageName('bureau'),
  },
}

/** The analyst the run is waiting on: how long so far, and who was asked. */
export const WaitingOnAPerson: Story = {
  args: { step: step('approve'), stageName: stageName('approve') },
}

/** A review this loan is too small to need. */
export const Skipped: Story = {
  args: { step: step('senior'), stageName: stageName('senior') },
}

/** A step that has not started has nothing to measure yet. */
export const NotStarted: Story = {
  args: { step: step('notify'), stageName: stageName('notify') },
}

/** What the step saw and what it returned, side by side. */
export const InputAndOutput: Story = { args: { defaultTab: 'io' } }

export const RawSpan: Story = { args: { defaultTab: 'raw' } }
