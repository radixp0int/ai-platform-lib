import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardIconOptions, WarningIconOptions } from './card-icon-options'
const meta = {
  title: 'Recipes/Card icon options',
  component: CardIconOptions,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CardIconOptions>
export default meta
type Story = StoryObj<typeof meta>
export const Comparison: Story = {}
export const WarningIcon: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl px-6 pb-6">
      <WarningIconOptions />
    </div>
  ),
}
