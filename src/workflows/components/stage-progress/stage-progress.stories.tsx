import type { Meta, StoryObj } from '@storybook/react-vite'
import { StageProgress } from './stage-progress'

const meta = {
  title: 'Workflows/Components/Stage progress',
  component: StageProgress,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Stage 4 of 5, Approve',
    segments: ['done', 'done', 'done', 'current', 'upcoming'],
  },
} satisfies Meta<typeof StageProgress>
export default meta
type Story = StoryObj<typeof meta>

/** The current stage is working: it takes the brand fill. */
export const Running: Story = {}

/** The current stage has stopped for a person: the one place the bar turns orange. */
export const Waiting: Story = { args: { current: 'waiting' } }

/** Ten stages take the same width as five, so a column of bars lines up. */
export const TenStages: Story = {
  args: {
    label: 'Stage 8 of 10, Review',
    current: 'waiting',
    segments: [...Array(7).fill('done'), 'current', 'upcoming', 'upcoming'],
  },
}

/** A workflow with no live run: every stage is an outline. */
export const NotStarted: Story = {
  args: { label: 'Not started, 8 stages', segments: Array(8).fill('upcoming') },
}

/** A step failed: the current stage turns the danger red. */
export const Failed: Story = {
  args: {
    label: 'Stage 5 of 8, Exceptions',
    current: 'failed',
    segments: [...Array(4).fill('done'), 'current', 'upcoming', 'upcoming', 'upcoming'],
  },
}

/** With room to spare, each segment carries its stage's name. */
export const Named: Story = {
  decorators: [
    (Story) => (
      <div className="w-[30rem]">
        <Story />
      </div>
    ),
  ],
  args: {
    current: 'waiting',
    names: ['Intake', 'Gather', 'Analyze', 'Approve', 'Decide & notify'],
  },
}

/** On the navy band over a run. */
export const NamedOnNavy: Story = {
  decorators: [
    (Story) => (
      <div className="w-[30rem] bg-brand-900 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    current: 'waiting',
    tone: 'inverse',
    names: ['Intake', 'Gather', 'Analyze', 'Approve', 'Decide & notify'],
  },
}
