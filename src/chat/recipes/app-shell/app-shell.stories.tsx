import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../../../recipes/app-shell/app-shell'
import { BrandingProvider } from '../../engine/branding'
import type { Responder } from '../../engine/chatEngine'
import { acmeBranding } from '../../fixtures/config'
import { Chat } from '../full-chat-app/full-chat-app'
import {
  networkArgTypes,
  useSimulatedResponder,
  type NetworkCondition,
} from '../shared/simulatedNetwork'

/** The platform shell with the chat as its chat space. The shell imports
 *  nothing from chat: the page arrives through `renderSpace`. */
function ChatInShell({ responder }: { responder?: Responder }) {
  return (
    <AppShell
      initialPath="/t/alderfinch-treasury/chat"
      renderSpace={({ space, onOpenUserSettings, onOpenFeatureToggles }) =>
        space === 'chat' ? (
          <BrandingProvider value={acmeBranding}>
            <Chat
              embedded
              responder={responder}
              onOpenUserSettings={onOpenUserSettings}
              onOpenFeatureToggles={onOpenFeatureToggles}
            />
          </BrandingProvider>
        ) : undefined
      }
    />
  )
}

const meta = {
  title: 'Chat/Recipes/Chat inside app shell',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ChatPage: Story = { render: () => <ChatInShell /> }

function OverTheWire({ network }: { network: NetworkCondition }) {
  return <ChatInShell responder={useSimulatedResponder(network)} />
}

type NetworkStory = StoryObj<Meta<typeof OverTheWire>>

const overTheWire = {
  render: (args) => <OverTheWire {...args} />,
  argTypes: networkArgTypes,
} satisfies NetworkStory

/** The chat page streaming over the WebSocket responder from a simulated server. */
export const SimulatedNetwork: NetworkStory = { ...overTheWire, args: { network: 'healthy' } }

/** A slow handshake and stream, inside the shell: the rest of the platform stays usable. */
export const SlowConnection: NetworkStory = { ...overTheWire, args: { network: 'slow' } }
