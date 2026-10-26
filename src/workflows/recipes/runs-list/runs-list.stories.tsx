import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from '../../../recipes/app-shell'
import { StartRunDialog } from '../../components/start-run-dialog'
import { STARTABLE_WORKFLOWS } from '../../fixtures/runContracts'
import { WORKFLOW_SUMMARIES } from '../../fixtures/workflowSummaries'
import { renderWorkflowsSpace } from '../shared/workflows-space'
import { RunsListPage } from './runs-list'

const meta = {
  title: 'Workflows/Recipes/Runs list',
  component: RunsListPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every workflow in a tenant and where its live run stands. `DataTable` inside a `FilterBar` for search and the status filter, with `Pagination` underneath; each row carries a `StageProgress`, and opening one shows the run as a `FlowBlueprint`. "Open live view" goes to the live page through `hrefFor`, and a workflow with a page of its own offers "Workflow details" through `detailHrefFor`. Nothing here loads React Flow.',
      },
    },
  },
} satisfies Meta<typeof RunsListPage>

export default meta
type Story = StoryObj<typeof meta>

/** Ten workflows: open a row, focus the search field to pick a status, sort by name. */
export const Runs: Story = {
  args: {
    detailHrefFor: (workflow) => (workflow.id === 'loan-review' ? '#loan-review' : undefined),
  },
}

/**
 * The list as the Workflows space of the platform shell, under the Workflows
 * menu. Open the commercial loan review's row, then "Workflow details", then its
 * Runs tab, to walk down to a run's trace.
 */
export const InAppShell: Story = {
  render: () => (
    <AppShell initialPath="/t/alderfinch-treasury/workflows" renderSpace={renderWorkflowsSpace} />
  ),
}

/** A tenant with nothing running. */
export const Empty: Story = { args: { workflows: [] } }

/** Only what is waiting on someone, as the Tasks badge would link to it. */
export const NeedsAPerson: Story = {
  args: { workflows: WORKFLOW_SUMMARIES.filter((w) => w.state === 'waiting') },
}

/** "Start a workflow" opens the start form: pick a workflow, fill in what it asks for. */
function WithStartForm() {
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  return (
    <>
      <RunsListPage
        onStart={() => {
          setStarted(false)
          setOpen(true)
        }}
      />
      {open && (
        <StartRunDialog
          open
          onOpenChange={setOpen}
          workflows={STARTABLE_WORKFLOWS}
          started={started}
          onStart={() => setStarted(true)}
          onOpenRun={() => setOpen(false)}
        />
      )}
    </>
  )
}

export const StartAWorkflow: Story = { render: () => <WithStartForm /> }
