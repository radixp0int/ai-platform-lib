import type { Meta, StoryObj } from '@storybook/react-vite'
import { WorkflowSkeleton } from '../loading-skeleton'
import { InAppShell } from '../shared/in-app-shell'
import { WorkflowRoute } from './workflow-route'

// The workflow demo as stories. `WorkflowRoute` keeps the page's own lazy
// boundary: React Flow and the loan fixture arrive in a chunk of their own,
// behind the skeleton, exactly as on /workflow-demo.
const meta = {
  title: 'Workflows/Recipes/Loan review run',
  component: WorkflowRoute,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A multi-step agentic run on a React Flow canvas with a human in the loop: the graph, the selected step and a log drawer, with the run outline in the platform menu beside them. The page draws whatever its `RunSource` emits — here the hard-coded loan run, which needs no server.',
      },
    },
  },
} satisfies Meta<typeof WorkflowRoute>

export default meta
type Story = StoryObj<typeof meta>

/** Pick a stage, open the gate in “Needs you”, approve or request changes, fold a stage from its eye. */
export const Run: Story = {
  render: () => (
    <InAppShell>
      <WorkflowRoute />
    </InAppShell>
  ),
}

/** The first paint while React Flow's chunk loads — it lives outside the lazy chunk. */
export const Skeleton: Story = { render: () => <WorkflowSkeleton /> }
