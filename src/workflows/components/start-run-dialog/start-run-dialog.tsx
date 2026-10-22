import { useId, useState } from 'react'
import { Button } from '../../../primitives/button'
import { Field, FieldLabel } from '../../../primitives/field'
import { Modal } from '../../../primitives/modal'
import { Notice } from '../../../primitives/notice'
import { Select } from '../../../primitives/select'
import { RunInputsForm } from '../run-inputs-form'
import type { StartRunDialogProps } from './types'
// Starting a run: pick the workflow if there is a choice, fill in what it asks
// for, start it. The dialog owns only which workflow is picked; whether the
// start is in flight, refused or done is the caller's, because only the caller
// hears back from the source.

export function StartRunDialog({
  open,
  onOpenChange,
  workflows,
  workflowId,
  busy = false,
  error,
  started = false,
  onStart,
  onOpenRun,
}: StartRunDialogProps) {
  const pickerId = useId()
  const [picked, setPicked] = useState(workflowId ?? workflows[0]?.id)
  const workflow = workflows.find((w) => w.id === picked) ?? workflows[0]
  const close = () => onOpenChange(false)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={
        started
          ? 'Run started'
          : workflows.length > 1
            ? 'Start a workflow'
            : `Start ${workflow?.name}`
      }
      description={
        started
          ? `${workflow?.name} is running with the inputs you gave it.`
          : 'Fill in what the run needs. Everything else it works out as it goes.'
      }
    >
      {started ? (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
          {onOpenRun && workflow && (
            <Button variant="primary" onClick={() => onOpenRun(workflow.id)}>
              Open live run
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {workflows.length > 1 && (
            <Field>
              <FieldLabel htmlFor={pickerId}>Workflow</FieldLabel>
              <Select
                id={pickerId}
                value={workflow?.id}
                onChange={(next) => setPicked(String(next))}
                options={workflows.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Field>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          {workflow && (
            /* Keyed, so switching workflow starts its form afresh rather than
               carrying one workflow's answers into another's fields. */
            <RunInputsForm
              key={workflow.id}
              inputs={workflow.inputs}
              initialValues={workflow.defaults}
              busy={busy}
              onSubmit={(values) => onStart(workflow.id, values)}
              onCancel={close}
            />
          )}
        </div>
      )}
    </Modal>
  )
}
