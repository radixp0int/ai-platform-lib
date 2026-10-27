import type { Meta, StoryObj } from '@storybook/react-vite'
import type { IoType } from '../../engine/wireProtocol'
import { IoTypePill } from './io-type-pill'

const TYPES: IoType[] = [
  'text',
  'number',
  'money',
  'date',
  'file',
  'list',
  'object',
  'choice',
  'person',
  'boolean',
]

const meta = {
  title: 'Workflows/Components/IO type pill',
  component: IoTypePill,
  tags: ['autodocs'],
  args: { type: 'file' },
} satisfies Meta<typeof IoTypePill>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every type an input or output can carry. */
export const EveryType: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((type) => (
        <IoTypePill key={type} type={type} />
      ))}
    </div>
  ),
}

/** Beside the name it describes, as the panels set it. */
export const BesideAName: Story = {
  render: () => (
    <span className="flex items-center gap-1.5">
      <span className="font-mono text-[12.5px] font-medium text-ink-strong">credit_memo</span>
      <IoTypePill type="file" />
    </span>
  ),
}
