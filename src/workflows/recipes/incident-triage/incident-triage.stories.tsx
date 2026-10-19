import type { Meta, StoryObj } from '@storybook/react-vite'
import { incidentTriage } from '../../fixtures/incidentTriage'
import { FixtureWorkflow } from '../shared/fixture-workflow'
const meta = {
  title: 'Workflows/Recipes/Incident triage',
  component: FixtureWorkflow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Static incident-triage fixture from the mock API. Work completes immediately; rollback approval remains interactive. The failed probe is a finding, and verification can fail before a successful retry. No server is required.',
      },
    },
  },
  args: { script: incidentTriage },
  argTypes: { script: { control: false }, options: { control: false } },
} satisfies Meta<typeof FixtureWorkflow>
export default meta
type Story = StoryObj<typeof meta>
export const AwaitingRollback: Story = {}
export const VerificationFailed: Story = {
  args: {
    options: {
      decisions: { 'rollback-approve': 'approved' },
      stopAt: { stepId: 'verify', status: 'failed' },
    },
  },
}
export const RetryingVerification: Story = {
  args: {
    options: {
      decisions: { 'rollback-approve': 'approved' },
      stopAt: { stepId: 'verify', status: 'running' },
    },
  },
}
export const Resolved: Story = {
  args: { options: { decisions: { 'rollback-approve': 'approved' } } },
}
export const RollbackDeclined: Story = {
  args: { options: { decisions: { 'rollback-approve': 'declined' } } },
}
