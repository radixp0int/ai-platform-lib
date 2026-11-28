import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { AppShell } from '../app-shell'
import { TenantsPage } from './tenants-page'

/** The Finals 2.0 tablet widths: a 1024 landscape tablet and the 834 portrait one. */
const viewports = {
  options: {
    tablet1024: { name: 'Tablet 1024', styles: { width: '1024px', height: '768px' } },
    portrait834: { name: 'Tablet 834', styles: { width: '834px', height: '1112px' } },
  },
}

// The page as the shell hosts it on `/tenants`, outside any one tenant.
// `/tenants?details` opens the strip and `/tenants?q=…` starts with a search.
const meta = {
  title: 'Recipes/Tenants',
  component: AppShell,
  args: { initialPath: '/tenants' },
  parameters: {
    layout: 'fullscreen',
    viewport: viewports,
    docs: {
      description: {
        component:
          'The Finals 2.0 Tenants page inside the app shell: `PageBand` with Show details and its figures (Tenants, Seats in use, Plans, New in the last 90 days) and Import from CSV / Add a tenant, then the `DataGrid` of every organisation — plan and region under the name, Active on the tenant you are in and a dash on the rest, the primary contact, a seats bar that says "nearly full", and View details, Edit and a More actions menu on every row.',
      },
    },
  },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

/** The page as the board draws it, sorted by name. */
export const Default: Story = {}

export const Dark: Story = { globals: { mode: 'dark' } }

/** The figures: Tenants, Seats in use, Plans, New in the last 90 days. */
export const DetailsOpen: Story = { args: { initialPath: '/tenants?details' } }

/** 1024 wide: the Home panel starts shut, and Created drops out. */
export const Tablet: Story = {
  // Below 1200px the boards start with the Home panel shut, over the page.
  args: { initialPanelOpen: false },
  globals: { viewport: { value: 'tablet1024', isRotated: false } },
}

/** 834 wide, dark: Primary contact drops out too. */
export const Portrait: Story = {
  args: { initialPanelOpen: false },
  globals: { mode: 'dark', viewport: { value: 'portrait834', isRotated: false } },
}

/** Opens Crestview Builders' More actions: Switch, Copy tenant ID, Manage people, Delete. */
const openRowMenu: Story['play'] = async ({ canvasElement }) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'More actions for Crestview Builders' }),
  )
}

/** A row's More actions, open — the TenantsA2Menu board. */
export const RowMenuOpen: Story = { play: openRowMenu }

export const RowMenuOpenDark: Story = { globals: { mode: 'dark' }, play: openRowMenu }

/**
 * A platform with no tenants yet, shown as the page alone: the shell's
 * `/tenants` route always lists the demo's organisations.
 */
export const Empty: Story = {
  render: () => (
    <div className="min-h-dvh bg-canvas">
      <TenantsPage orgs={[]} />
    </div>
  ),
}

/** A search that finds nothing: the chip stays, with Clear all. */
export const NoMatch: Story = { args: { initialPath: '/tenants?q=nobody-here' } }
