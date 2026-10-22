import type { Meta, StoryObj } from '@storybook/react-vite'
import { resolveStepIO } from '../../engine/io'
import { STORY_RUN } from '../../fixtures/storyRun'
import { StepInputsOutputs } from './step-inputs-outputs'

const at = (stepId: string) => resolveStepIO(STORY_RUN.graph, STORY_RUN.statuses, stepId)!

const meta = {
  title: 'Workflows/Components/Step inputs and outputs',
  component: StepInputsOutputs,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  args: { io: at('approve') },
} satisfies Meta<typeof StepInputsOutputs>
export default meta
type Story = StoryObj<typeof meta>

/** A gate that is waiting: everything it reads is in, and what it decides is not. */
export const Default: Story = {}

/** A step that has finished: its outputs carry the values the run produced. */
export const Produced: Story = { args: { io: at('policy') } }

/** Downstream of the gate: neither its inputs nor its outputs exist yet. */
export const NotReached: Story = { args: { io: at('letter') } }

/** The trigger reads the run's own inputs, from what the run was started with. */
export const FromTheRun: Story = { args: { io: at('trigger') } }
