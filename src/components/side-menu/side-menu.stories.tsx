import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { buildMenu } from '../../fixtures/platform/menu'
import { INITIAL_TENANTS } from '../../fixtures/platform/tenants'
import { SideMenu } from './side-menu'
const meta = {
  title: 'Components/Side menu',
  component: SideMenu,
  tags: ['autodocs'],
  render: function Menu(args) {
    const [open, setOpen] = useState(args.openIds)
    return (
      <div className="flex h-[620px]">
        <SideMenu {...args} openIds={open} onOpenIdsChange={setOpen} />
      </div>
    )
  },
  args: {
    sections: buildMenu(INITIAL_TENANTS[0], 2),
    activeId: 'home',
    openIds: [],
    onOpenIdsChange: () => {},
  },
} satisfies Meta<typeof SideMenu>
export default meta
type Story = StoryObj<typeof meta>
export const Expanded: Story = {}
export const SectionOpen: Story = { args: { openIds: ['workflows'], activeId: 'runs' } }
export const Rail: Story = { args: { mode: 'rail' } }
export const ChatOnly: Story = {
  args: { sections: buildMenu(INITIAL_TENANTS[1], 0), activeId: 'chat' },
}
