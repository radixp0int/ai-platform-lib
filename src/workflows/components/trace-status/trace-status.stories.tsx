import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StepKind, StepStatus } from '../types'
import { TraceKindTag, TraceStatusIcon } from './trace-status'
import { TRACE_STATUS_LABEL } from './vocabulary'

const meta = {
  title: 'Workflows/Components/Trace status',
  component: TraceStatusIcon,
  tags: ['autodocs'],
  args: { status: 'done', size: 20 },
  parameters: {
    docs: {
      description: {
        component:
          'The marker beside a step on the trace page, and the tag for who does its work. Each status has its own shape, so none of them depends on colour alone.',
      },
    },
  },
} satisfies Meta<typeof TraceStatusIcon>
export default meta
type Story = StoryObj<typeof meta>

export const Done: Story = {}
export const Failed: Story = { args: { status: 'failed' } }
export const Running: Story = { args: { status: 'running' } }

/** Orange is reserved for a step waiting on a person. */
export const Waiting: Story = { args: { status: 'waiting' } }

/** A step that has not started: a dashed ring, not a filled one. */
export const Queued: Story = { args: { status: 'queued' } }

/** Every status next to its word. */
export const EveryStatus: Story = {
  render: () => (
    <ul className="flex w-56 flex-col gap-2">
      {(Object.keys(TRACE_STATUS_LABEL) as StepStatus[]).map((status) => (
        <li key={status} className="flex items-center gap-2.5 text-sm text-ink">
          <TraceStatusIcon status={status} />
          {TRACE_STATUS_LABEL[status]}
        </li>
      ))}
    </ul>
  ),
}

/** The tag names who does the work; an agent and a person are tinted, the rest stay plain. */
export const KindTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['trigger', 'agent', 'tool', 'decision', 'human', 'flow'] satisfies StepKind[]).map(
        (kind) => (
          <TraceKindTag key={kind} kind={kind} />
        ),
      )}
    </div>
  ),
}
