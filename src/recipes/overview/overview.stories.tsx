import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../app-shell'
import { RECIPE_VIEWPORTS } from '../recipe-viewports'

const meta = {
  title: 'Recipes/Overview',
  component: AppShell,
  parameters: { layout: 'fullscreen', viewport: { options: RECIPE_VIEWPORTS } },
  args: { initialPath: '/t/alderfinch-treasury/home' },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

/**
 * The landing page in the shell: the greeting with the "Ask Acme, or jump"
 * field, the section tabs with what waits in each, quick actions, Answer
 * quality, Sections, Needs you, and what you had open. Pick a tab, or press
 * 1–8, to narrow the page to one section.
 */
export const Default: Story = {}

export const Dark: Story = { globals: { mode: 'dark' } }

/** At 1024 the Home panel slides over the page, closed, and the tabs tighten. */
export const Tablet: Story = {
  args: { initialPanelOpen: false },
  globals: { viewport: { value: 'tablet1024', isRotated: false } },
}

export const Portrait: Story = {
  args: { initialPanelOpen: false },
  globals: { mode: 'dark', viewport: { value: 'portrait834', isRotated: false } },
}

/**
 * A tenant with Chat only: Overview, Chat, and Audit and Admin (which every
 * tenant has). No Answer quality chart, and nothing from the other spaces.
 */
export const ChatOnlyTenant: Story = {
  args: { initialPath: '/t/alderfinch-retail/home' },
}
