import type { Meta, StoryObj } from '@storybook/react-vite'
import { WorkflowSkeleton } from './loading-skeleton'
const meta = {
  title: 'Workflows/Recipes/Loading skeleton',
  component: WorkflowSkeleton,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkflowSkeleton>
export default meta
type Story = StoryObj<typeof meta>
export const Loading: Story = {}
