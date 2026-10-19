import type { Meta, StoryObj } from '@storybook/react-vite'
import { RunUnavailable } from './run-unavailable'
const meta = {
  title: 'Workflows/Recipes/Run unavailable',
  component: RunUnavailable,
  parameters: { layout: 'fullscreen' },
  args: { message: 'The run is unavailable. The connection closed before a snapshot arrived.' },
} satisfies Meta<typeof RunUnavailable>
export default meta
type Story = StoryObj<typeof meta>
export const Unavailable: Story = {}
