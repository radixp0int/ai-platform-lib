import type { Meta, StoryObj } from '@storybook/react-vite'
import { AssistantAvatar } from './assistant-avatar'

const meta = {
  title: 'Chat/Components/AssistantAvatar',
  component: AssistantAvatar,
  tags: ['autodocs'],
  args: { size: 48, state: 'idle' },
  parameters: {
    docs: {
      description: {
        component:
          'The assistant’s mark, with what it is doing: idle, thinking or talking. It draws the Orb until the Aristotle avatar is chosen, and every surface that shows the assistant goes through it.',
      },
    },
  },
} satisfies Meta<typeof AssistantAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {}

/** Drifting, while an answer is being worked out. */
export const Thinking: Story = { args: { state: 'thinking' } }

/** A gentle pulse, while it types — in the composer, or as an answer streams. */
export const Talking: Story = { args: { state: 'talking' } }

/** The sizes the library draws it at: in the composer, beside an answer, in a greeting. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-5">
      {[24, 28, 30, 48].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <AssistantAvatar size={size} />
          <code className="text-[11px] text-ink-soft">{size}</code>
        </div>
      ))}
    </div>
  ),
}
