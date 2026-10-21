import type { Meta, StoryObj } from '@storybook/react-vite'
import { AssistantAvatar } from './assistant-avatar'
import { AssistantAvatarProvider } from './context'

const meta = {
  title: 'Chat/Components/AssistantAvatar',
  component: AssistantAvatar,
  tags: ['autodocs'],
  args: { size: 48, state: 'idle' },
  parameters: {
    docs: {
      description: {
        component:
          'The assistant’s mark, with what it is doing: idle, thinking or talking. The Orb by default; humanized, Aristotle as a marble bust (today the app gives that to super admins). The host picks the mark with `AssistantAvatarProvider` (and `assistantAvatarFor`), and every surface that shows the assistant goes through it.',
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

/** The humanized assistant: Aristotle as a marble bust. Blinks at rest. */
export const MarbleBust: Story = { args: { kind: 'marble-bust', size: 96 } }

/** Tilts his head and raises his brows while an answer is being worked out. */
export const MarbleBustThinking: Story = {
  args: { kind: 'marble-bust', size: 96, state: 'thinking' },
}

/** Nods along while the answer streams. */
export const MarbleBustTalking: Story = {
  args: { kind: 'marble-bust', size: 96, state: 'talking' },
}

/** Set once by the host for everything inside, rather than per avatar. */
export const FromTheProvider: Story = {
  render: () => (
    <div className="flex gap-10">
      {(['orb', 'marble-bust'] as const).map((kind) => (
        <AssistantAvatarProvider key={kind} value={kind}>
          <div className="flex flex-col items-center gap-2">
            <AssistantAvatar size={48} />
            <code className="text-[11px] text-ink-soft">{kind}</code>
          </div>
        </AssistantAvatarProvider>
      ))}
    </div>
  ),
}

/** The sizes the library draws them at: in the composer, beside an answer, in a greeting. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      {(['orb', 'marble-bust'] as const).map((kind) => (
        <div key={kind} className="flex items-end gap-5">
          {[24, 28, 30, 48].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <AssistantAvatar size={size} kind={kind} />
              <code className="text-[11px] text-ink-soft">{size}</code>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}
