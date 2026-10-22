import { useId, useRef, useState } from 'react'
import { Button } from '../../../primitives/button'
import { DateField } from '../../../primitives/date-field'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../../../primitives/field'
import { Select } from '../../../primitives/select'
import { Switch } from '../../../primitives/switch'
import { TextInput } from '../../../primitives/text-input'
import { Textarea } from '../../../primitives/textarea'
import type { RunInputSpec } from '../../engine/wireProtocol'
import { IoTypePill } from '../io-type-pill'
import type { RunInputsFormProps } from './types'
// What a run needs before it can start, as a form whose fields follow the
// inputs' types. Every value is a string on the wire, so it is here too: a
// date is ISO, a switch is 'true' or empty, a file is its name.
//
// Submit stays enabled while required fields are empty. Pressing it is how a
// reader finds out which ones — a disabled button only says "not yet", and
// says it to nobody using a screen reader.

/** `term_months` reads as "Term months". */
const inputLabel = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ')

const REQUIRED_MESSAGE = 'Fill this in to start the run.'

type InputProps = {
  spec: RunInputSpec
  id: string
  value: string
  invalid: boolean
  describedBy: string
  onChange: (value: string) => void
}

function FileInput({ id, value, describedBy, onChange }: InputProps) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <input
        ref={ref}
        id={id}
        type="file"
        aria-describedby={describedBy}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0]?.name ?? '')}
      />
      <Button type="button" variant="secondary" size="sm" onClick={() => ref.current?.click()}>
        Choose file
      </Button>
      <span className={`truncate text-[13px] ${value ? 'text-ink-strong' : 'text-ink-soft'}`}>
        {value || 'No file chosen'}
      </span>
    </span>
  )
}

function InputFor(props: InputProps) {
  const { spec, id, value, invalid, describedBy, onChange } = props
  const common = { id, 'aria-invalid': invalid, 'aria-describedby': describedBy }
  switch (spec.type) {
    case 'file':
      return <FileInput {...props} />
    case 'date':
      return (
        <DateField
          id={id}
          label={inputLabel(spec.name)}
          value={value || null}
          onChange={(next) => onChange(next ?? '')}
        />
      )
    case 'list':
    case 'object':
      return (
        <Textarea
          {...common}
          rows={3}
          value={value}
          placeholder={spec.type === 'list' ? 'One per line' : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'choice':
    case 'person':
      return (
        <Select
          {...common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          options={[
            { value: '', label: spec.type === 'person' ? 'Choose a person' : 'Choose one' },
            ...(spec.options ?? []).map((o) => ({ value: o, label: o })),
          ]}
        />
      )
    case 'boolean':
      return (
        <Switch
          id={id}
          label={inputLabel(spec.name)}
          hideLabel
          checked={value === 'true'}
          onChange={(on) => onChange(on ? 'true' : '')}
        />
      )
    default:
      return (
        <TextInput
          {...common}
          value={value}
          inputMode={
            spec.type === 'number' ? 'numeric' : spec.type === 'money' ? 'decimal' : undefined
          }
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}

export function RunInputsForm({
  inputs,
  initialValues,
  busy = false,
  submitLabel = 'Start run',
  onSubmit,
  onCancel,
}: RunInputsFormProps) {
  const baseId = useId()
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...initialValues }))
  /* Errors wait for the first attempt: a form that opens covered in red has
     told the reader nothing they did wrong. */
  const [tried, setTried] = useState(false)
  const missing = inputs.filter((i) => i.required && !values[i.name]?.trim())

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        setTried(true)
        if (missing.length === 0 && !busy) onSubmit(values)
      }}
    >
      {inputs.length === 0 ? (
        <p className="text-[13px] leading-5 text-ink-soft">This workflow needs nothing to start.</p>
      ) : (
        <FieldGroup>
          {inputs.map((spec) => {
            const id = `${baseId}-${spec.name}`
            const invalid = tried && missing.includes(spec)
            const describedBy = `${id}-description${invalid ? ` ${id}-error` : ''}`
            return (
              <Field key={spec.name} data-invalid={invalid || undefined}>
                <span className="flex items-center gap-1.5">
                  <FieldLabel htmlFor={id}>{inputLabel(spec.name)}</FieldLabel>
                  <IoTypePill type={spec.type} />
                  {!spec.required && <span className="text-[11.5px] text-ink-soft">Optional</span>}
                </span>
                <InputFor
                  spec={spec}
                  id={id}
                  value={values[spec.name] ?? ''}
                  invalid={invalid}
                  describedBy={describedBy}
                  onChange={(value) => setValues((v) => ({ ...v, [spec.name]: value }))}
                />
                <FieldDescription id={`${id}-description`}>{spec.description}</FieldDescription>
                {invalid && <FieldError id={`${id}-error`}>{REQUIRED_MESSAGE}</FieldError>}
              </Field>
            )
          })}
        </FieldGroup>
      )}

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <span aria-live="polite" className="text-[12.5px] text-ink-soft">
          {missing.length === 0
            ? 'Ready to start'
            : `${missing.length} required ${missing.length === 1 ? 'field' : 'fields'} left`}
        </span>
        <span className="flex-1" />
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Starting…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
