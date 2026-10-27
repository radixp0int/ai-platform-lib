import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import {
  COMMERCIAL_LOAN_TRACE,
  COMMERCIAL_LOAN_TRACE_BUREAU_FAILED,
} from '../../fixtures/commercialLoanTrace'
import { summarizeStages } from '../run-trace'
import { TraceStageStrip } from './trace-stage-strip'
import type { TraceStageStripProps } from './types'

const stages = summarizeStages(COMMERCIAL_LOAN_TRACE)

// The page holds the choice; here the story does, so a click moves it.
function Held(args: TraceStageStripProps) {
  const [selectedId, setSelectedId] = useState(args.selectedId)
  return (
    <TraceStageStrip
      {...args}
      selectedId={selectedId}
      onSelect={(id) => {
        setSelectedId(id)
        args.onSelect(id)
      }}
    />
  )
}

const meta = {
  title: 'Workflows/Components/Trace stage strip',
  component: TraceStageStrip,
  tags: ['autodocs'],
  args: { stages, selectedId: 'approve', onSelect: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'A run’s stages as a row of tiles: state in words, one bar per step, step count and time taken. Picking one opens its steps.',
      },
    },
  },
  render: (args) => <Held {...args} />,
} satisfies Meta<typeof TraceStageStrip>
export default meta
type Story = StoryObj<typeof meta>

/** A run waiting on its analyst: the Approve tile turns orange, and the stage after it is an outline. */
export const WaitingOnAPerson: Story = {}

/** A stage with a failed step shows how many, even though the run went on past it. */
export const FailedStepInAStage: Story = {
  args: { stages: summarizeStages(COMMERCIAL_LOAN_TRACE_BUREAU_FAILED), selectedId: 'gather' },
}

/** Three stages: the tiles share the row. */
export const Short: Story = {
  args: { stages: stages.slice(0, 3), selectedId: 'gather' },
}

/** Nothing has begun: every stage is queued. */
export const NotStarted: Story = {
  args: {
    stages: stages.map((stage) => ({
      ...stage,
      state: 'queued',
      stateLabel: 'Queued',
      duration: undefined,
      marks: stage.marks.map(() => 'queued' as const),
    })),
    selectedId: 'intake',
  },
}
