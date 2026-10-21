import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  networkArgTypes,
  useSimulatedResponder,
  type NetworkCondition,
} from '../shared/simulatedNetwork'
import { WidgetDemoPage } from './widget-on-host-page'

// The /widget-demo route: a fictional host site that mounts the widget with the
// same init() its script tag calls — into a shadow root, with its own
// stylesheet. The one story where the widget does NOT follow Storybook's
// toolbar: across the shadow boundary it takes only what init() is given,
// which is the proof this page exists for.
const meta = {
  title: 'Chat/Recipes/Widget on a host page',
  component: WidgetDemoPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WidgetDemoPage>

export default meta
type Story = StoryObj<typeof meta>

export const AlderAndFinch: Story = { name: 'Alder & Finch' }

/** The same site with a super admin signed in: the launcher and the panel show the marble bust. */
export const SuperAdmin: Story = { args: { superAdmin: true } }

function OverTheWire({ network }: { network: NetworkCondition }) {
  return <WidgetDemoPage responder={useSimulatedResponder(network)} />
}

type NetworkStory = StoryObj<Meta<typeof OverTheWire>>

const overTheWire = {
  render: (args) => <OverTheWire {...args} />,
  argTypes: networkArgTypes,
} satisfies NetworkStory

/**
 * The embedded widget streaming over the WebSocket responder from a simulated
 * server. Open the launcher and ask about the “market” to see tool calls.
 */
export const SimulatedNetwork: NetworkStory = { ...overTheWire, args: { network: 'healthy' } }

/** The widget on a site whose chat server is down: the failure stays inside the panel. */
export const ServerUnreachable: NetworkStory = { ...overTheWire, args: { network: 'offline' } }
