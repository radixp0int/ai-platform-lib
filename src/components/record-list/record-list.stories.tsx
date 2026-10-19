import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pill } from '../../primitives/pill'
import { RecordList } from './record-list'
const meta = {
  title: 'Components/Record list',
  component: RecordList,
  tags: ['autodocs'],
} satisfies Meta<typeof RecordList>
export default meta
type Story = StoryObj
export const Default: Story = {
  render: () => (
    <RecordList
      items={['Commercial loan review']}
      columns={['Run']}
      headerClassName="border-b border-line pb-2 text-xs text-ink-soft"
      getKey={(s) => s}
      renderRow={(s) => <div className="py-4 text-sm">{s}</div>}
    />
  ),
}

type Run = { id: string; title: string; step: string; status: 'waiting' | 'running'; by: string }
const RUNS: Run[] = [
  {
    id: 'loan',
    title: 'Commercial loan review',
    step: 'Approve credit memo',
    status: 'waiting',
    by: 'Dana Whitfield',
  },
  {
    id: 'hire',
    title: 'New hire · Priya Raman',
    step: 'Approve elevated access',
    status: 'waiting',
    by: 'Rachel Okafor',
  },
  {
    id: 'sev',
    title: 'SEV-2 · checkout latency',
    step: 'Detect',
    status: 'running',
    by: 'Sam Raines',
  },
]
const GRID =
  'grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_9.5rem_minmax(0,1fr)] items-center gap-x-4'
const HEAD = `${GRID} border-b border-line px-3 pb-2 text-xs font-semibold text-ink-soft`
const status = (run: Run) =>
  run.status === 'waiting' ? (
    <Pill tone="warning">Needs approval</Pill>
  ) : (
    <Pill tone="brand">Running</Pill>
  )

/** Several columns on one grid: the header and every row share the template,
 *  which is what keeps the columns lined up without a table. */
export const Columns: Story = {
  render: () => (
    <RecordList
      items={RUNS}
      columns={['Run', 'Current step', 'Status', 'Started by']}
      headerClassName={HEAD}
      getKey={(run) => run.id}
      renderRow={(run, index) => (
        <div
          className={`${GRID} min-h-15 px-3 text-sm text-ink ${index > 0 ? 'border-t border-line' : ''}`}
        >
          <span className="truncate font-semibold text-ink-strong">{run.title}</span>
          <span className="truncate">{run.step}</span>
          <span className="flex">{status(run)}</span>
          <span className="truncate">{run.by}</span>
        </div>
      )}
    />
  ),
}

/** Rows as buttons: the caller supplies the selection, the list only lays it out. */
export const SelectableRows: Story = {
  render: function SelectableRowsStory() {
    const [selected, setSelected] = useState<string | null>('loan')
    return (
      <RecordList
        items={RUNS}
        columns={['Run', 'Current step', 'Status', 'Started by']}
        headerClassName={HEAD}
        getKey={(run) => run.id}
        renderRow={(run, index) => (
          <button
            type="button"
            aria-pressed={run.id === selected}
            onClick={() => setSelected(run.id)}
            className={`${GRID} min-h-15 w-full rounded-control px-3 text-left text-sm text-ink transition ${
              run.id === selected ? 'bg-tint/5' : 'hover:bg-tint/5'
            } ${index > 0 && run.id !== selected ? 'border-t border-line' : ''}`}
          >
            <span className="truncate font-semibold text-ink-strong">{run.title}</span>
            <span className="truncate">{run.step}</span>
            <span className="flex">{status(run)}</span>
            <span className="truncate">{run.by}</span>
          </button>
        )}
      />
    )
  },
}

/** With nothing to list, the header stays and `empty` says why. */
export const Empty: Story = {
  render: () => (
    <RecordList
      items={[] as Run[]}
      columns={['Run', 'Current step', 'Status', 'Started by']}
      headerClassName={HEAD}
      getKey={(run) => run.id}
      renderRow={() => null}
      empty={<p className="px-3 py-8 text-sm text-ink-soft">No runs in Alderfinch Retail yet.</p>}
    />
  ),
}
