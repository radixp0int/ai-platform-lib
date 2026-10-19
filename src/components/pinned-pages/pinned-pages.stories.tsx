import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { buildMenu } from '../../fixtures/platform/menu'
import { INITIAL_TENANTS } from '../../fixtures/platform/tenants'
import { flattenMenu } from '../side-menu'
import { PinnedPages } from './pinned-pages'
import type { PinnedPage } from './types'
const pages = flattenMenu(buildMenu(INITIAL_TENANTS[0], 2)).filter((p) =>
  ['chat', 'tasks', 'runs', 'home'].includes(p.id),
)
const meta = {
  title: 'Components/Pinned pages',
  component: PinnedPages,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-15 items-center bg-brand-900 px-3 dark:bg-panel-solid">
        <Story />
      </div>
    ),
  ],
  render: function Pins(args) {
    const [pinned, setPinned] = useState<PinnedPage[]>(args.pages)
    return <PinnedPages {...args} pages={pinned} onPagesChange={setPinned} />
  },
  args: { pages: pages.slice(0, 3), activeId: 'chat', onPagesChange: () => {} },
} satisfies Meta<typeof PinnedPages>
export default meta
type Story = StoryObj<typeof meta>
export const ThreePinned: Story = {}
export const RoomForOneMore: Story = { args: { pages: pages.slice(0, 2), current: pages[2] } }
export const Full: Story = { args: { current: pages[3] } }
export const Empty: Story = { args: { pages: [], current: pages[0] } }
