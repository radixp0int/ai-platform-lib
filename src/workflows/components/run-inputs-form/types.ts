import type { RunInputSpec } from '../../engine/wireProtocol'

export type RunInputsFormProps = {
  /** One field per input, in this order. */
  inputs: RunInputSpec[]
  /** What the fields start with, by input name. Read once, on mount. */
  initialValues?: Record<string, string>
  /** The start is in flight: the submit button is held. */
  busy?: boolean
  submitLabel?: string
  /** Called only once every required input has a value. */
  onSubmit: (values: Record<string, string>) => void
  /** Present to add a Cancel button beside submit. */
  onCancel?: () => void
}
