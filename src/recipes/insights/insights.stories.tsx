import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../app-shell'
import { RECIPE_VIEWPORTS } from '../recipe-viewports'
import { InsightsPage } from './insights-page'

const base = '/t/alderfinch-treasury'

const meta = {
  title: 'Recipes/Insights',
  component: AppShell,
  parameters: { layout: 'fullscreen', viewport: { options: RECIPE_VIEWPORTS } },
  args: { initialPath: `${base}/insights` },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

/**
 * The Insights page in the shell: the band with the date range and Export,
 * the Overview tiles, questions per day and top topics, then Evaluation
 * scores, User feedback and Errors in responses.
 */
export const Default: Story = {}

export const Dark: Story = { globals: { mode: 'dark' } }

/** At 1024 the Home panel slides over the page, closed, and the grids fold. */
export const Tablet: Story = {
  args: { initialPanelOpen: false },
  globals: { viewport: { value: 'tablet1024', isRotated: false } },
}

export const Portrait: Story = {
  args: { initialPanelOpen: false },
  globals: { mode: 'dark', viewport: { value: 'portrait834', isRotated: false } },
}

/** Today by the hour: per-hour charts, and every change line against yesterday by 14:00. */
export const Today: Story = {
  args: {
    renderSpace: ({ space, base: tenantBase }) =>
      space === 'insights' ? (
        <InsightsPage base={tenantBase} initialRange={{ id: 'today' }} />
      ) : undefined,
  },
}

/**
 * A custom range that starts on the first day of the data: there is nothing
 * before it to compare with, so every change line says so.
 */
export const NoEarlierData: Story = {
  args: {
    renderSpace: ({ space, base: tenantBase }) =>
      space === 'insights' ? (
        <InsightsPage
          base={tenantBase}
          initialRange={{ id: 'custom', from: '2026-10-26', to: '2026-11-08' }}
        />
      ) : undefined,
  },
}
