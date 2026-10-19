import type { Meta, StoryObj } from '@storybook/react-vite'
import { StageMarker } from './stage-marker'
const meta = {
  title: 'Workflows/Components/Stage marker',
  component: StageMarker,
  tags: ['autodocs'],
  args: { status: 'current' },
} satisfies Meta<typeof StageMarker>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Done: Story = { args: { status: 'done' } }
export const Upcoming: Story = { args: { status: 'upcoming' } }
