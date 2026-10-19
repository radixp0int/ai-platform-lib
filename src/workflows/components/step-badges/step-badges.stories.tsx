import type { Meta, StoryObj } from '@storybook/react-vite'
import { APPROVAL, STORY_RUN } from '../../fixtures/storyRun'
import type { StepStatus } from '../types'
import { StepBadges } from './step-badges'
const meta = {
  title: 'Workflows/Components/Step badges',
  component: StepBadges,
  tags: ['autodocs'],
  args: { step: APPROVAL, status: 'waiting' },
} satisfies Meta<typeof StepBadges>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Approved: Story = { args: { status: 'approved' } }

/** An agent's step while it works. */
export const AgentRunning: Story = {
  args: { step: STORY_RUN.graph.stepById.get('risk')!, status: 'running' },
}

/** Every kind of step, each with a status it commonly shows. */
export const EveryKind: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      {(
        [
          ['trigger', 'done'],
          ['intake', 'done'],
          ['bureau', 'failed'],
          ['policy', 'skipped'],
          ['approve', 'changes'],
        ] satisfies [string, StepStatus][]
      ).map(([id, status]) => (
        <StepBadges key={id} step={STORY_RUN.graph.stepById.get(id)!} status={status} />
      ))}
    </div>
  ),
}
