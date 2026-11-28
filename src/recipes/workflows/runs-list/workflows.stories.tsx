import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo } from 'react'
import { userEvent, within } from 'storybook/test'
import { DEFAULT_TENANT_ID } from '../../../fixtures/platform/tenants'
import { AppShell, type SpacePageProps } from '../../app-shell'
import { usePlatform } from '../../app-shell/platform-context'
import { RECIPE_VIEWPORTS } from '../../recipe-viewports'
import { linksFor } from '../links'
import { WorkflowsPage, type WorkflowsPageProps } from './workflows-page'

const base = `/t/${DEFAULT_TENANT_ID}`

/** The page inside the shell with props a URL can't give it: rows open, a state. */
function Hosted(props: WorkflowsPageProps) {
  const platform = usePlatform()
  const links = useMemo(() => linksFor(platform.base, platform.go), [platform.base, platform.go])
  return <WorkflowsPage links={links} {...props} />
}
const hosted =
  (props: WorkflowsPageProps) =>
  ({ space, path }: SpacePageProps) =>
    space === 'workflows' && path === '/workflows' ? <Hosted {...props} /> : undefined

// The Finals 2.0 runs list inside the app shell, on the shell's own
// `/workflows` route: PageBand with Show summary, then the DataGrid of every
// workflow and its live run.
const meta = {
  title: 'Recipes/Workflows',
  component: AppShell,
  args: { initialPath: `${base}/workflows` },
  parameters: {
    layout: 'fullscreen',
    viewport: { options: RECIPE_VIEWPORTS },
    docs: {
      description: {
        component:
          'The Finals 2.0 runs list (boards RunsD1 to RunsD4). Each row is a workflow with its live run: the status pill and the run it names, a stage bar that turns into one continuous bar past twelve stages, what is happening now, and Review (where it needs someone), Open live run, View workflow and a More actions menu. The chevron opens a `RunGlance`: the stage line and step chain windowed around the current step, what the run waits on as a square status bar, the latest events, and Open run log / Open run details.',
      },
    },
  },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

/** RunsD1: collapsed rows, newest first. */
export const Default: Story = {}

/** RunsD1Dark: the summary strip open and one row open. */
export const Dark: Story = {
  args: {
    renderSpace: hosted({ defaultSummaryOpen: true, defaultExpanded: ['vendor-contract-review'] }),
  },
  globals: { mode: 'dark' },
}

/** RunsD1Tablet: 1024 wide. The Workflows panel starts shut, and Updated drops out. */
export const Tablet: Story = {
  args: { initialPanelOpen: false },
  globals: { viewport: { value: 'tablet1024', isRotated: false } },
}

/** 834 wide, dark: Live run drops out too. */
export const Portrait: Story = {
  args: { initialPanelOpen: false },
  globals: { mode: 'dark', viewport: { value: 'portrait834', isRotated: false } },
}

/** RunsD2: a run waiting on you, and one that failed in a long workflow, both open. */
export const Expanded: Story = {
  args: {
    renderSpace: hosted({ defaultExpanded: ['vendor-contract-review', 'invoice-processing'] }),
  },
}

/** RunsD4: twelve stages and twenty stages, windowed to the current stage. */
export const LongWorkflows: Story = {
  args: {
    renderSpace: hosted({ defaultExpanded: ['supplier-onboarding', 'docs-link-check'] }),
  },
}

/** RunsD3: a live run's More actions, with Cancel run… in red after the rule. */
export const RowMenuOpen: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: 'More actions for Invoice processing',
      }),
    )
  },
}

/** RunsD3: an idle row open, with its menu. The items that need a live run say "No live run". */
export const IdleRow: Story = {
  args: { renderSpace: hosted({ defaultExpanded: ['supplier-compliance-refresh'] }) },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: 'More actions for Supplier compliance refresh',
      }),
    )
  },
}

/** Waiting for the list: skeleton rows in the same frame. */
export const Loading: Story = { args: { renderSpace: hosted({ state: 'loading' }) } }

/** The list could not be loaded: the grid says so and offers Try again. */
export const Unavailable: Story = {
  args: { renderSpace: hosted({ state: 'unavailable', onRetry: () => undefined }) },
}

/** A tenant with no workflows yet: Start a workflow. */
export const Empty: Story = { args: { renderSpace: hosted({ workflows: [] }) } }
