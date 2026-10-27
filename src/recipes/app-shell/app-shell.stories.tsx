import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from './app-shell'
const base = '/t/alderfinch-treasury'
const meta = {
  title: 'Recipes/App shell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>
export const Home: Story = {}
export const PanelFolded: Story = { args: { initialPanelOpen: false } }
export const ChatOnlyTenant: Story = { args: { initialPath: '/t/alderfinch-retail/home' } }
export const Tasks: Story = { args: { initialPath: `${base}/tasks` } }
export const Wizard: Story = { args: { initialPath: `${base}/ingestion/new` } }
export const SpaceUnavailable: Story = { args: { initialPath: '/t/alderfinch-retail/workflows' } }
export const Tenants: Story = { args: { initialPath: '/tenants' } }
