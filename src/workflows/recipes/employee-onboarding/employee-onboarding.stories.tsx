import type { Meta, StoryObj } from '@storybook/react-vite'
import { onboarding } from '../../fixtures/onboarding'
import { FixtureWorkflow } from '../shared/fixture-workflow'
const meta = {
  title: 'Workflows/Recipes/Employee onboarding',
  component: FixtureWorkflow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Static onboarding fixture from the mock API. Provisioning work is already complete, with manager and HR approvals open together. Answer them in either order; day-one setup needs both, and a decline holds it. No server is required.',
      },
    },
  },
  args: { script: onboarding },
  argTypes: { script: { control: false }, options: { control: false } },
} satisfies Meta<typeof FixtureWorkflow>
export default meta
type Story = StoryObj<typeof meta>
export const TwoApprovals: Story = {}
export const ManagerApproved: Story = {
  args: { options: { decisions: { 'manager-approve': 'approved' } } },
}
export const ReadyForDayOne: Story = {
  args: { options: { decisions: { 'manager-approve': 'approved', 'hr-approve': 'approved' } } },
}
export const AccessDeclined: Story = {
  args: { options: { decisions: { 'manager-approve': 'declined' } } },
}
