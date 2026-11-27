import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo } from 'react'
import { fn } from 'storybook/test'
import { CitationsProvider } from '../../engine/citations'
import type { Message, QueuedMessage } from '../../engine/types'
import { createCannedResponder } from '../../engine/chatEngine'
import { useChat } from '../../engine/useChat'
import { cannedTurns, messages, queue, suggestions, typeaheadPool } from '../../fixtures/chat'
import { Alert } from '../../../primitives/alert'
import { Greeting } from '../greeting'
import { Conversation } from './conversation'
import type { ConversationProps } from './types'
function Example() {
  const responder = useMemo(() => createCannedResponder(cannedTurns), [])
  const chat = useChat(responder)
  return (
    <div className="flex h-[760px] flex-col">
      <Conversation
        greeting={<Greeting name="Joe" salutation="Good morning" />}
        disclaimer="AI can make mistakes. Verify important details."
        messages={chat.messages}
        busy={chat.busy}
        queue={chat.queue}
        held={chat.held}
        onSubmit={chat.send}
        onStop={chat.stop}
        onSendNow={chat.sendNow}
        onSendQueuedNow={chat.sendQueuedNow}
        onEditQueued={chat.editQueued}
        onMoveQueued={chat.moveQueued}
        onRemoveQueued={chat.removeQueued}
        onHold={chat.hold}
        onResume={chat.resume}
        onClearQueue={chat.clearQueue}
        onRetry={chat.retry}
        chain={chat.chain}
        suggestions={suggestions}
        typeaheadPool={typeaheadPool}
      />
    </div>
  )
}
const meta = {
  title: 'Chat/Components/Conversation',
  component: Example,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Example>
export default meta
type Story = StoryObj<typeof meta>
export const Empty: Story = {}

/** The same component with the transcript handed in, so a state can be shown
 *  without a responder producing it. Every callback is a spy. */
function Static({
  transcript,
  busy = false,
  queued = [],
  held = false,
  extra,
}: {
  transcript: Message[]
  busy?: boolean
  queued?: QueuedMessage[]
  held?: boolean
  /** The optional layout props: `landing`, `notice`, `quote`. */
  extra?: Pick<ConversationProps, 'landing' | 'notice' | 'quote'>
}) {
  return (
    <CitationsProvider value={fn()}>
      <div className="flex h-[760px] flex-col">
        <Conversation
          greeting={<Greeting name="Joe" salutation="Good morning" />}
          disclaimer="AI can make mistakes. Verify important details."
          messages={transcript}
          busy={busy}
          queue={queued}
          held={held}
          onSubmit={fn()}
          onStop={fn()}
          onSendNow={fn()}
          onSendQueuedNow={fn()}
          onEditQueued={fn()}
          onMoveQueued={fn()}
          onRemoveQueued={fn()}
          onHold={fn()}
          onResume={fn()}
          onClearQueue={fn()}
          onRetry={fn()}
          chain={{ state: null, start: fn(), add: fn(), run: fn(), cancel: fn() }}
          suggestions={suggestions}
          typeaheadPool={typeaheadPool}
          {...extra}
        />
      </div>
    </CitationsProvider>
  )
}

/** A finished exchange: the composer has docked to the bottom and the answer
 *  carries its sources, actions and follow-ups. */
export const Answered: Story = {
  render: () => <Static transcript={[messages.question, messages.answer]} />,
}

/** Mid-answer: the reply is still streaming, so the composer offers Stop. */
export const Streaming: Story = {
  render: () => <Static transcript={[messages.question, messages.streaming]} busy />,
}

/** Questions written while an answer runs wait in the dock above the composer. */
export const WithQueuedQuestions: Story = {
  render: () => <Static transcript={[messages.question, messages.streaming]} busy queued={queue} />,
}

/** A turn that failed outright says so in the transcript and offers a retry. */
export const FailedTurn: Story = {
  render: () => <Static transcript={[messages.question, messages.failed]} />,
}

/** `landing` lays out the page before the first message around the composer it
 *  is handed: here a navy band with the composer lifted over its edge. */
export const Landing: Story = {
  render: () => (
    <Static
      transcript={[]}
      extra={{
        landing: (composer) => (
          <>
            <div className="bg-brand-900 px-8 pt-16 pb-20 text-center text-white">
              <h1 className="text-[34px] font-light">What should we work on?</h1>
            </div>
            <div className="relative mx-auto -mt-11 max-w-[760px] px-8">{composer}</div>
          </>
        ),
      }}
    />
  ),
}

const draftQuestion: Message = {
  id: 21,
  role: 'user',
  content: 'Draft a short note asking Dana to renew the API key.',
}
const draftAnswer: Message = {
  id: 22,
  role: 'assistant',
  content:
    'Here is a draft you can send:\n\n> Hi Dana, the pricing sheets API has failed to sync since Nov 23 with an authentication error. Could you renew the key in Ingestion when you have a moment?',
  followups: ['Who else can renew API keys?', 'Check the sync log tomorrow'],
}

/** `notice` docks a standing notice above the composer, in place of the
 *  disclaimer line; `quote` styles the quotes in the answers. */
export const WithNotice: Story = {
  render: () => (
    <Static
      transcript={[draftQuestion, draftAnswer]}
      extra={{
        quote: { quoteRail: 'subtle', quoteFont: 'italic', quoteSpacing: 'snug' },
        notice: (
          <Alert
            variant="bar"
            tone="warning"
            title="Acme can make mistakes."
            secondaryAction={{ label: 'How answers are checked', onClick: fn() }}
            onDismiss={fn()}
            dismissLabel="Dismiss this notice"
          >
            Check the sources under each answer before you act on it.
          </Alert>
        ),
      }}
    />
  ),
}
