import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../../../recipes/app-shell'
import { WorkflowRoute } from '../loan-review-run/workflow-route'
const meta = {
  title: 'Workflows/Recipes/Run inside app shell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>
export const LoanReview: Story = {
  args: {
    initialPath: '/t/alderfinch-treasury/workflows/demo',
    renderSpace: ({ space, path }) =>
      space === 'workflows' && path.includes('/demo') ? <WorkflowRoute /> : undefined,
  },
}
