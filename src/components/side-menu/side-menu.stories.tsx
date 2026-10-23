import type { Meta, StoryObj } from '@storybook/react-vite'
import { buildMenu } from '../../fixtures/platform/menu'
import { INITIAL_TENANTS } from '../../fixtures/platform/tenants'
import { SlidersIcon, WorkflowIcon } from '../../primitives/icons'
import { MenuPanelLabel, MenuPanelRow, MenuPanelSearch } from './panel-parts'
import { SideMenu } from './side-menu'
import { InSideMenu, SideMenuSlotProvider } from './slot'
import type { SideMenuPanel } from './types'

const base = '/t/alderfinch-treasury'

const workflows: SideMenuPanel = {
  action: { label: 'Start a workflow', onSelect: () => {} },
  content: (
    <div className="flex flex-col gap-0.5">
      <MenuPanelSearch label="Jump to a workflow" />
      <MenuPanelLabel>Views</MenuPanelLabel>
      <MenuPanelRow current dot="bg-ink-strong" name="All workflows" count={20} />
      <MenuPanelRow dot="bg-notify" name="Needs a person" count={6} />
      <MenuPanelRow dot="bg-accent" name="Running" count={10} />
      <MenuPanelLabel>Recently viewed</MenuPanelLabel>
      <MenuPanelRow dot="bg-notify" name="RFP response" sub="Waiting on Kofi A." />
      <MenuPanelRow dot="bg-notify" name="Commercial loan review" sub="Waiting on Dana W." />
    </div>
  ),
  flyout: (
    <>
      <MenuPanelLabel>Recently viewed</MenuPanelLabel>
      <MenuPanelRow dot="bg-notify" name="RFP response" count="1 day" />
      <MenuPanelRow dot="bg-notify" name="Commercial loan review" count="3h 40m" />
    </>
  ),
}

const meta = {
  title: 'Components/Side menu',
  component: SideMenu,
  tags: ['autodocs'],
  render: (args) => (
    <div className="flex h-[620px]">
      <SideMenu {...args} />
    </div>
  ),
  args: {
    sections: buildMenu(INITIAL_TENANTS[0], 2),
    rail: ['home', 'chat', 'workflows', 'tasks'],
    activeId: 'runs',
    panels: { workflows },
    appsHeading: 'Alderfinch Treasury',
    places: [
      { label: 'Workflows › RFP response', href: `${base}/workflows`, icon: <WorkflowIcon /> },
    ],
    footLinks: [{ id: 'settings', label: 'Settings', icon: <SlidersIcon />, onSelect: () => {} }],
  },
} satisfies Meta<typeof SideMenu>
export default meta
type Story = StoryObj<typeof meta>

/** The rail, and the panel of the app you are in. Drag the panel's edge to size it. */
export const Default: Story = {}

/** Folded: the rail alone. Rest on the Workflows icon for the short version. */
export const PanelFolded: Story = { args: { defaultPanelOpen: false } }

/** An app with no panel of its own: the rail is the whole menu. */
export const NoPanel: Story = { args: { activeId: 'home' } }

/**
 * A page adds to the panel with `InSideMenu` when what it holds depends on the
 * page's own state. The section keeps that state.
 */
export const WithPageSection: Story = {
  args: { activeId: 'chat', panels: { chat: { title: 'Chat' } } },
  render: function Menu(args) {
    return (
      <SideMenuSlotProvider>
        <div className="flex h-[620px]">
          <SideMenu {...args} />
          <PageSection />
        </div>
      </SideMenuSlotProvider>
    )
  },
}

function PageSection() {
  return (
    <InSideMenu>
      <section aria-label="This page" className="flex flex-col">
        <MenuPanelLabel>Recent chats</MenuPanelLabel>
        <MenuPanelRow name="Positive pay exceptions" sub="2 days ago" />
        <MenuPanelRow name="Mortgage rate lock timing" sub="3 days ago" />
      </section>
    </InSideMenu>
  )
}
