import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../../../recipes/app-shell'
import { WORKFLOW_SUMMARIES } from '../../fixtures/workflowSummaries'
import { WorkflowsTablePage } from './workflows-table'

const meta = {
  title: 'Workflows/Recipes/Workflows table',
  component: WorkflowsTablePage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every workflow in a tenant and where its live run stands. `DataTable` inside a `FilterBar` for search and the status filter, with `Pagination` underneath; each row carries a `StageProgress`, and opening one shows the run as a `FlowBlueprint`. Nothing here loads React Flow.',
      },
    },
  },
} satisfies Meta<typeof WorkflowsTablePage>

export default meta
type Story = StoryObj<typeof meta>

/** Ten workflows: open a row, focus the search field to pick a status, sort by name. */
export const Default: Story = {}

/** A tenant with nothing running. */
export const Empty: Story = { args: { workflows: [] } }

/** Only what is waiting on someone, as the Tasks badge would link to it. */
export const NeedsAPerson: Story = {
  args: { workflows: WORKFLOW_SUMMARIES.filter((w) => w.state === 'waiting') },
}

/** The table as the Workflows space of the platform shell, through `renderSpace`. */
export const InsideAppShell: Story = {
  render: () => (
    <AppShell
      initialPath="/t/alderfinch-treasury/workflows"
      renderSpace={({ space, base }) =>
        space === 'workflows' ? (
          <WorkflowsTablePage hrefFor={() => `${base}/workflows/live`} />
        ) : undefined
      }
    />
  ),
}
