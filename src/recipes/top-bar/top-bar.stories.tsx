import type { Meta, StoryObj } from '@storybook/react-vite'
import { TopBarRecipe } from './top-bar'
const meta = {
  title: 'Recipes/Top bar',
  component: TopBarRecipe,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TopBarRecipe>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Wizard: Story = { args: { wizard: true } }
export const PlatformAdmin: Story = { args: { admin: true } }
