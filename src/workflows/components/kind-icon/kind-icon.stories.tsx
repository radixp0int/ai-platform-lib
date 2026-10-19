import type { Meta, StoryObj } from '@storybook/react-vite'
import { KindIcon } from './kind-icon'
const meta = {
  title: 'Workflows/Components/Kind icon',
  component: KindIcon,
  tags: ['autodocs'],
  args: { kind: 'agent', size: 34 },
} satisfies Meta<typeof KindIcon>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Person: Story = { args: { kind: 'human', initials: 'DW' } }
export const Unassigned: Story = { args: { kind: 'human' } }
export const Tool: Story = { args: { kind: 'tool' } }
export const Decision: Story = { args: { kind: 'decision' } }
export const Trigger: Story = { args: { kind: 'trigger' } }
