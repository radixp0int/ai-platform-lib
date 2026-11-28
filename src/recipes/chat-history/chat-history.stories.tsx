import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_TENANT_ID } from '../../fixtures/platform/tenants'
import { AppShell, type SpacePageProps } from '../app-shell/app-shell'
import { ChatSpace } from '../chat/chat-space'
import { PORTRAIT, RECIPE_VIEWPORTS, TABLET } from '../chat/story-viewports'
import type { HistoryLoad } from './history-page'

const base = `/t/${DEFAULT_TENANT_ID}`

/** The chat space with the History page's list loading one way. */
const loading =
  (historyLoad: HistoryLoad) =>
  ({ space, path, base: tenantBase }: SpacePageProps) =>
    space === 'chat' ? (
      <ChatSpace path={path} base={tenantBase} historyLoad={historyLoad} />
    ) : undefined

/**
 * Chat history, Finals 2.0: the band with New chat; search, when, and the
 * labels to show; the chats grouped by day beside the one picked, with pin,
 * share, rename and delete. Below 900px the list and the preview take turns.
 */
const meta = {
  title: 'Recipes/Chat history',
  component: AppShell,
  parameters: { layout: 'fullscreen', ...RECIPE_VIEWPORTS },
  args: { initialPath: `${base}/chat/history` },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dark: Story = { globals: { mode: 'dark' } }

export const Tablet: Story = { args: { initialPanelOpen: false }, globals: TABLET }

/** One pane at a time: pick a chat to open it, "All chats" to go back. */
export const Portrait: Story = { args: { initialPanelOpen: false }, globals: PORTRAIT }

/** Skeleton rows and preview while the chats load; the filters wait. */
export const Loading: Story = { args: { renderSpace: loading('loading') } }

/** The list could not load: Retry loads it again. */
export const LoadError: Story = { args: { renderSpace: loading('error') } }

/** No chats yet: start one, with suggestions. */
export const Empty: Story = { args: { renderSpace: loading('empty') } }
