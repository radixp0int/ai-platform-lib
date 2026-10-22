import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { STARTABLE_WORKFLOWS } from '../../fixtures/runContracts'
import { StartRunDialog } from './start-run-dialog'
import type { StartRunDialogProps } from './types'

const LOAN = STARTABLE_WORKFLOWS.filter((w) => w.id === 'loan-review')

/** Starting really starts: the dialog moves on to "Run started" once submitted. */
function Live(props: StartRunDialogProps) {
  const [open, setOpen] = useState(true)
  const [started, setStarted] = useState(props.started ?? false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <StartRunDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        started={started}
        onStart={(id, values) => {
          props.onStart(id, values)
          setStarted(true)
        }}
      />
    </>
  )
}

const meta = {
  title: 'Workflows/Components/Start run dialog',
  component: StartRunDialog,
  tags: ['autodocs'],
  render: (args) => <Live {...args} />,
  args: {
    open: true,
    onOpenChange: fn(),
    workflows: LOAN,
    onStart: fn(),
    onOpenRun: fn(),
  },
} satisfies Meta<typeof StartRunDialog>
export default meta
type Story = StoryObj<typeof meta>

/** One workflow: the form is the whole dialog. */
export const Default: Story = {}

/** From the workflows table: pick which one first. */
export const PickAWorkflow: Story = {
  args: { workflows: STARTABLE_WORKFLOWS, workflowId: 'rfp-response' },
}

/** The source refused the start — a server that found a required input missing. */
export const Refused: Story = {
  args: { error: 'The run could not start: “analyst” is required.' },
}

/** Started: what is left to do is go and watch it. */
export const Started: Story = { args: { started: true } }
