import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import type { RunInputSpec } from '../../engine/wireProtocol'
import { RUN_CONTRACTS } from '../../fixtures/runContracts'
import { RunInputsForm } from './run-inputs-form'

const loan = RUN_CONTRACTS['loan-review']

/** One input of every type, so each field can be seen in one place. */
const EVERY_TYPE: RunInputSpec[] = [
  { name: 'applicant', type: 'text', required: true, description: 'Free text.' },
  { name: 'term_months', type: 'number', required: true, description: 'A whole number.' },
  { name: 'amount', type: 'money', required: false, description: 'An amount, with its currency.' },
  {
    name: 'due_date',
    type: 'date',
    required: true,
    description: 'Typed, or picked from the calendar.',
  },
  {
    name: 'application',
    type: 'file',
    required: true,
    description: 'Its file name is what is sent.',
  },
  { name: 'guarantors', type: 'list', required: false, description: 'One per line.' },
  { name: 'terms', type: 'object', required: false, description: 'Structured text.' },
  {
    name: 'severity',
    type: 'choice',
    required: true,
    description: 'One of a fixed set.',
    options: ['SEV-1', 'SEV-2', 'SEV-3'],
  },
  {
    name: 'reviewer',
    type: 'person',
    required: true,
    description: 'Someone who can be assigned.',
    options: ['Dana Whitfield', 'Kofi Adeyemi'],
  },
  { name: 'notify_buyer', type: 'boolean', required: false, description: 'On or off.' },
]

const meta = {
  title: 'Workflows/Components/Run inputs form',
  component: RunInputsForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-120">
        <Story />
      </div>
    ),
  ],
  args: { inputs: loan.inputs, onSubmit: fn(), onCancel: fn() },
} satisfies Meta<typeof RunInputsForm>
export default meta
type Story = StoryObj<typeof meta>

/** Nothing filled in yet. Errors wait until the reader tries to start. */
export const Default: Story = {}

/** Opened with what is already known about the run. */
export const Prefilled: Story = { args: { inputs: loan.inputs, initialValues: loan.defaults } }

/** Every input type, and the field each one gets. */
export const EveryType: Story = { args: { inputs: EVERY_TYPE } }

/** A workflow that asks for nothing still needs a way to start. */
export const NothingToFill: Story = { args: { inputs: [] } }

/** The start has been sent: the button is held until the source answers. */
export const Busy: Story = {
  args: { inputs: loan.inputs, initialValues: loan.defaults, busy: true },
}
