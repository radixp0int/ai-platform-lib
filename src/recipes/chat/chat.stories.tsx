import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_TENANT_ID } from '../../fixtures/platform/tenants'
import { SYNC_QUESTION } from '../../fixtures/platform/conversations'
import { AppShell } from '../app-shell/app-shell'
import { PORTRAIT, RECIPE_VIEWPORTS, TABLET } from './story-viewports'

const base = `/t/${DEFAULT_TENANT_ID}`

/**
 * The Finals 2.0 chat page inside the platform shell. Before the first
 * message: the greeting band with the composer lifted over it, today's
 * suggestions and the chats to pick back up. Then the thread under a slim band,
 * follow-ups on the circle rail, and the AI notice docked over the composer.
 * The Chat panel lists the chats by day, with search and New chat.
 */
const meta = {
  title: 'Recipes/Chat',
  component: AppShell,
  parameters: { layout: 'fullscreen', ...RECIPE_VIEWPORTS },
  args: { initialPath: `${base}/chat` },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dark: Story = { globals: { mode: 'dark' } }

/** At 1024 the Chat panel starts closed and slides over the page when opened. */
export const Tablet: Story = { args: { initialPanelOpen: false }, globals: TABLET }

export const Portrait: Story = { args: { initialPanelOpen: false }, globals: PORTRAIT }

/** A past chat opened from the panel or "Pick up where you left off": its thread, a draft quoted, follow-ups on the rail. */
export const Conversation: Story = { args: { initialPath: `${base}/chat/c/failed-syncs` } }

export const ConversationDark: Story = {
  args: { initialPath: `${base}/chat/c/failed-syncs` },
  globals: { mode: 'dark' },
}

/** A question asked on arrival — a follow-up picked on the History page — as it streams. */
export const Answering: Story = {
  args: { initialPath: `${base}/chat/new?q=${encodeURIComponent(SYNC_QUESTION)}` },
}
