import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { buildMenu } from '../../fixtures/platform/menu'
import { INITIAL_TENANTS } from '../../fixtures/platform/tenants'
import { SideMenu } from './side-menu'
import { InSideMenu, SideMenuSlotProvider } from './slot'
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

/**
 * A page adds its own section under the destinations with `InSideMenu`, and a
 * line for the rail. The section keeps the page's own state and callbacks.
 */
export const WithPageSection: Story = {
  args: { openIds: ['workflows'], activeId: 'live' },
  render: function Menu(args) {
    const [open, setOpen] = useState(args.openIds)
    const [picked, setPicked] = useState('Intake')
    return (
      <SideMenuSlotProvider>
        <div className="flex h-[620px]">
          <SideMenu {...args} openIds={open} onOpenIdsChange={setOpen} />
          <InSideMenu rail={<span className="text-xs text-ink-soft">{picked}</span>}>
            <section aria-label="This page" className="mt-3 border-t border-line pt-3">
              {['Intake', 'Gather', 'Analyze'].map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={picked === name}
                  onClick={() => setPicked(name)}
                  className="block w-full rounded-control px-2.5 py-2 text-left text-sm aria-pressed:bg-tint/7 aria-pressed:font-bold"
                >
                  {name}
                </button>
              ))}
            </section>
          </InSideMenu>
        </div>
      </SideMenuSlotProvider>
    )
  },
}

/** The same section in the rail: only what the page gave for it. */
export const PageSectionInRail: Story = {
  ...WithPageSection,
  args: { mode: 'rail', activeId: 'live' },
}
