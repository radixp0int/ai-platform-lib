import type { Meta, StoryObj } from '@storybook/react-vite'
import { RUN_CONTRACTS } from '../../fixtures/runContracts'
import { RunContract } from './run-contract'

const meta = {
  title: 'Workflows/Components/Run contract',
  component: RunContract,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="@container max-w-240">
        <Story />
      </div>
    ),
  ],
  args: {
    inputs: RUN_CONTRACTS['loan-review'].inputs,
    outputs: RUN_CONTRACTS['loan-review'].outputs,
  },
} satisfies Meta<typeof RunContract>
export default meta
type Story = StoryObj<typeof meta>

/** Side by side once the container is wide enough. */
export const Default: Story = {}

/** In a narrow column, outputs follow inputs. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="@container max-w-100">
        <Story />
      </div>
    ),
  ],
}

/** A workflow started by a monitor: every input is optional. */
export const AllOptional: Story = {
  args: {
    inputs: RUN_CONTRACTS['loan-review'].inputs.map((i) => ({ ...i, required: false })),
    outputs: RUN_CONTRACTS['loan-review'].outputs,
  },
}
