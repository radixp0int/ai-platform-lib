import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusMark } from './status-mark'
const meta = {
  title: 'Workflows/Components/Status mark',
  component: StatusMark,
  tags: ['autodocs'],
  args: { status: 'waiting', text: '3h 40m' },
} satisfies Meta<typeof StatusMark>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Running: Story = { args: { status: 'running', text: 'Running' } }
export const Failed: Story = { args: { status: 'failed', text: 'Failed' } }
export const Done: Story = { args: { status: 'done', text: 'Done' } }
export const Glyph: Story = { args: { tier: 'glyph' } }
