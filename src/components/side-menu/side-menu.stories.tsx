import type { Meta, StoryObj } from '@storybook/react-vite'
import { buildMenu } from '../../fixtures/platform/menu'
import { INITIAL_TENANTS } from '../../fixtures/platform/tenants'
import { SlidersIcon, WorkflowIcon } from '../../primitives/icons'
import { MenuPanelLabel, MenuPanelRow, MenuPanelSearch } from './panel-parts'
import { SideMenu } from './side-menu'
import { InSideMenu, SideMenuSlotProvider } from './slot'
import type { MenuSection, SideMenuPanel } from './types'

const tenant = INITIAL_TENANTS[0]
const base = `/t/${tenant.id}`

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
      <MenuPanelRow dot="bg-notify" name="Supplier onboarding" sub="Waiting on Marcus L." />
      <MenuPanelRow dot="bg-notify" name="Contract renewal review" sub="Waiting on Dana W." />
    </div>
  ),
  flyout: (
    <>
      <MenuPanelLabel>Recently viewed</MenuPanelLabel>
      <MenuPanelRow dot="bg-notify" name="Supplier onboarding" count="1 day" />
      <MenuPanelRow dot="bg-notify" name="Contract renewal review" count="3h 40m" />
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
    sections: buildMenu(tenant, 2),
    rail: ['home', 'chat', 'workflows', 'tasks'],
    activeId: 'runs',
    panels: { workflows },
    appsHeading: tenant.name,
    places: [
      {
        label: 'Workflows › Contract renewal review',
        href: `${base}/workflows`,
        icon: <WorkflowIcon />,
      },
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
        <MenuPanelRow name="Supplier onboarding checklist" sub="2 days ago" />
        <MenuPanelRow name="Holiday rota questions" sub="3 days ago" />
      </section>
    </InSideMenu>
  )
}

// The Home panel of the Finals 2.0 pages: every area, grouped, each with a line
// on how it is doing. Tenant Admin's pages sit under it.
const homeSections: MenuSection[] = [
  {
    id: 'overview',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        href: `${base}/home`,
        description: 'Everything at a glance',
      },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    items: [
      {
        id: 'ingestion-home',
        label: 'Ingestion',
        href: `${base}/ingestion`,
        description: '13 of 14 sources syncing',
        status: 'warning',
      },
      {
        id: 'chat-config',
        label: 'Chat Config',
        href: `${base}/chat-config`,
        description: 'No changes waiting',
        status: 'idle',
      },
    ],
  },
  {
    id: 'automate',
    label: 'Automate',
    items: [
      {
        id: 'studio',
        label: 'Workflows Studio',
        href: `${base}/studio`,
        description: '4 running',
        status: 'info',
      },
    ],
  },
  {
    id: 'measure',
    label: 'Measure',
    items: [
      {
        id: 'evaluations',
        label: 'Evaluations Manager',
        href: `${base}/evaluations`,
        description: '1 of 5 suites failing',
        status: 'error',
      },
    ],
  },
  {
    id: 'govern',
    label: 'Govern',
    items: [
      {
        id: 'audit',
        label: 'Audit & Compliance',
        href: `${base}/audit`,
        description: 'All checks passing',
        status: 'success',
      },
      {
        id: 'tenant-admin',
        label: 'Tenant Admin',
        href: `${base}/tenant-admin`,
        description: '14 tenants · 1,204 people',
        children: [
          {
            id: 'tenants',
            label: 'Tenants',
            href: `${base}/tenant-admin/tenants`,
            description: '3 waiting on an invite',
          },
          {
            id: 'people',
            label: 'People and roles',
            href: `${base}/tenant-admin/people`,
            description: '1,204 people',
          },
          {
            id: 'usage',
            label: 'Usage and plans',
            href: `${base}/tenant-admin/usage`,
            description: '78% of seats in use',
          },
        ],
      },
    ],
  },
]

const home: SideMenuPanel = { sections: homeSections }

/**
 * A panel that lists destinations (`panel.sections`). Each row can carry a
 * second line (`description`) and a status dot (`status`: warning, error,
 * info, success or idle). Children sit indented behind a thin rule; the page
 * you are on is marked, and its parent is not. Tenants is listed only in the
 * Home panel, so being on it makes Home the app you are in.
 */
export const HomePanel: Story = {
  args: { activeId: 'tenants', panels: { home, workflows } },
}

/** The same panel in dark mode: the dots carry their own dark values. */
export const HomePanelDark: Story = {
  args: HomePanel.args,
  globals: { mode: 'dark' },
}

/**
 * Below 1200px the panel slides over the page instead of pushing it, and
 * starts closed. The Home icon in the rail and the panel's collapse button
 * open and shut it; picking a page in it, or Escape, shuts it.
 */
export const Tablet: Story = {
  args: HomePanel.args,
  globals: { viewport: { value: 'tablet', isRotated: false } },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="flex h-[620px]">
      <SideMenu {...args} />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-extrabold text-ink-strong">Tenants</h1>
        <p className="mt-1 text-sm text-ink-soft">Every organisation, its plan and its seats.</p>
      </main>
    </div>
  ),
}
