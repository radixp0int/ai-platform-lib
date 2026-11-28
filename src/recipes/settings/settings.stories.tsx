import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { DEFAULT_TENANT_ID } from '../../fixtures/platform/tenants'
import { AppShell } from '../app-shell/app-shell'
import { PORTRAIT, RECIPE_VIEWPORTS, TABLET } from '../chat/story-viewports'

/** Opens Settings from the rail's Settings item, on Profile and look. */
async function fromRail({ canvasElement }: { canvasElement: HTMLElement }) {
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(await page.findByRole('button', { name: 'Settings' }))
  await page.findByRole('dialog', { name: 'Settings' })
}

/** Opens Settings from the account menu's Feature toggles, on Answer features. */
async function fromAccountMenu({ canvasElement }: { canvasElement: HTMLElement }) {
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(await page.findByRole('button', { name: /John Ozzo/ }))
  await userEvent.click(await page.findByRole('menuitem', { name: /Feature toggles/ }))
  await page.findByRole('dialog', { name: 'Settings' })
}

/**
 * The one Settings dialog, over the chat page: Profile and look, and Answer
 * features with its live preview. The rail's Settings item opens it on the
 * first; the account menu opens it on either.
 */
const meta = {
  title: 'Recipes/Settings',
  component: AppShell,
  parameters: { layout: 'fullscreen', ...RECIPE_VIEWPORTS },
  args: { initialPath: `/t/${DEFAULT_TENANT_ID}/chat` },
  play: fromRail,
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Answer features, opened from the account menu. */
export const Features: Story = { play: fromAccountMenu }

export const Dark: Story = { globals: { mode: 'dark' } }

export const FeaturesDark: Story = { play: fromAccountMenu, globals: { mode: 'dark' } }

/** Below 1000px the feature preview drops under the switches. */
export const Tablet: Story = { args: { initialPanelOpen: false }, globals: TABLET }

/** Below 900px the sections become tabs on top. */
export const Portrait: Story = { args: { initialPanelOpen: false }, globals: PORTRAIT }
