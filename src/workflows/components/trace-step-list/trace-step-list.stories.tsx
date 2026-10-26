import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import {
  COMMERCIAL_LOAN_TRACE,
  COMMERCIAL_LOAN_TRACE_BUREAU_FAILED,
} from '../../fixtures/commercialLoanTrace'
import { TraceStepList } from './trace-step-list'
import type { TraceStepListProps } from './types'

// The page holds the choice; here the story does, so a click moves it.
function Held(args: TraceStepListProps) {
  const [selectedId, setSelectedId] = useState(args.selectedId)
  return (
    <TraceStepList
      {...args}
      selectedId={selectedId}
      onSelect={(id) => {
        setSelectedId(id)
        args.onSelect(id)
      }}
    />
  )
}

const inStage = (stageId: string, trace = COMMERCIAL_LOAN_TRACE) =>
  trace.steps.filter((step) => step.stageId === stageId)

const meta = {
  title: 'Workflows/Components/Trace step list',
  component: TraceStepList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[26rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    steps: inStage('approve'),
    selectedId: 'approve',
    heading: 'Approve · 3 steps',
    onSelect: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'The steps of one stage as cards: status, name, who does the work, a line on what it came to, and how long it took.',
      },
    },
  },
  render: (args) => <Held {...args} />,
} satisfies Meta<typeof TraceStepList>
export default meta
type Story = StoryObj<typeof meta>

/** A decision, the analyst the run is waiting on, and a review this loan is too small to need. */
export const WaitingOnAPerson: Story = {}

/** The credit pull timed out and the run carried on: the failure is a finding, not a stop. */
export const AFailedStep: Story = {
  args: {
    steps: inStage('gather', COMMERCIAL_LOAN_TRACE_BUREAU_FAILED),
    selectedId: 'bureau',
    heading: 'Gather · 3 steps',
  },
}

/** Parallel work: an agent reading documents beside two system calls. */
export const AgentsAndTools: Story = {
  args: { steps: inStage('gather'), selectedId: undefined, heading: 'Gather · 3 steps' },
}

/** The stage the run has not reached: nothing has begun, so no times. */
export const NotReachedYet: Story = {
  args: { steps: inStage('decide'), selectedId: undefined, heading: 'Decide & notify · 2 steps' },
}

export const Empty: Story = {
  args: {
    steps: [],
    heading: 'Nothing here · 0 steps',
    empty: <p className="m-0 text-sm text-ink-soft">No steps in this stage.</p>,
  },
}
