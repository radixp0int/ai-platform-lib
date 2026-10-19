import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../../../recipes/app-shell'
const meta = {
  title: 'Workflows/Recipes/Runs list',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>
export const Runs: Story = { args: { initialPath: '/t/alderfinch-treasury/workflows' } }
export const Empty: Story = { args: { initialPath: '/t/harbor-street/workflows' } }
