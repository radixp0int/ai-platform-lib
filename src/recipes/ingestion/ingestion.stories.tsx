import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_TENANT_ID } from '../../fixtures/platform/tenants'
import { AppShell, type AppShellProps } from '../app-shell'
import { IngestionPage, type IngestionPageProps } from './ingestion-page'

// The page as the shell hosts it on `/t/<tenant>/ingestion`. A story that needs
// the page in another state hands the shell that page through `renderSpace`.
const path = `/t/${DEFAULT_TENANT_ID}/ingestion`
const withPage =
  (props: IngestionPageProps): AppShellProps['renderSpace'] =>
  ({ space }) =>
    space === 'ingestion' ? <IngestionPage {...props} /> : undefined

/** The Finals 2.0 tablet widths: a 1024 landscape tablet and the 834 portrait one. */
const viewports = {
  options: {
    tablet1024: { name: 'Tablet 1024', styles: { width: '1024px', height: '768px' } },
    portrait834: { name: 'Tablet 834', styles: { width: '834px', height: '1112px' } },
  },
}

const meta = {
  title: 'Recipes/Ingestion',
  component: AppShell,
  args: { initialPath: path },
  parameters: {
    layout: 'fullscreen',
    viewport: viewports,
    docs: {
      description: {
        component:
          'The Finals 2.0 Ingestion page inside the app shell: `PageBand` with "1 failing · Show details", its figures and the three page actions, then one card holding the sources `DataGrid` — Filters panel, chips in the search box, Export, the bulk bar, pagination and row actions. Upload documents opens the Add a source wizard.',
      },
    },
  },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

/** The page as the board draws it: Details closed, the newest syncs first. */
export const Default: Story = {}

export const Dark: Story = { globals: { mode: 'dark' } }

/** The strip of figures under the title: documents, sources syncing, added this week, last sync. */
export const DetailsOpen: Story = {
  args: { renderSpace: withPage({ defaultDetailsOpen: true }) },
}

/** 1024 wide: the Home panel starts shut, and the grid keeps every column. */
export const Tablet: Story = {
  // Below 1200px the boards start with the Home panel shut, over the page.
  args: { initialPanelOpen: false },
  globals: { viewport: { value: 'tablet1024', isRotated: false } },
}

/** 834 wide, dark: Type and Owner drop out and the figures sit two by two. */
export const Portrait: Story = {
  args: { initialPanelOpen: false },
  globals: { mode: 'dark', viewport: { value: 'portrait834', isRotated: false } },
}

/** A tenant that has connected nothing: the empty state offers Upload documents. */
export const Empty: Story = {
  args: { renderSpace: withPage({ sources: [] }) },
}

/** A search that finds nothing: the chip stays, with Clear all. */
export const NoMatch: Story = {
  args: { renderSpace: withPage({ initialQuery: 'spreadsheets' }) },
}
