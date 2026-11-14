import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '../../primitives/button'
import { SegmentedControl } from '../../primitives/segmented-control'
import { DataGrid } from './data-grid'
import { AddTenant, TenantsGrid } from './data-grid.example'
import { ROWS } from './data-grid.fixtures'

const meta = {
  title: 'Components/DataGrid',
  component: DataGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A table with its search, filters, selection and export, as one component. Click the search box for quick picks; type to see values from the data ("bay" finds Bayshore Financial in Name), the filters that match, and search or narrow. Each pick becomes a chip. The Filters panel docks as the grid\'s first column and is always as tall as the table. `maxSelections` limits how many rows can be picked: `1` is radio buttons, more keeps the latest picks. Export sits right of the search box and becomes a menu when there is a choice. Every story is live: filter, sort, page, select and export.',
      },
    },
  },
} satisfies Meta<typeof DataGrid>

export default meta
type Story = StoryObj<typeof meta>

// The stories render their own host, which owns the state; the grid's props are its.
const render = (node: React.ReactNode) => ({ render: () => <>{node}</> }) as unknown as Story

/**
 * Everything on. Click the search box for quick picks, or type "bay" and press
 * Enter for Bayshore Financial. Select rows and open Export for CSV or JSON of
 * just those, or of every match.
 */
export const Everything: Story = render(
  <TenantsGrid
    bulkActions={
      <>
        <Button variant="inverse" size="sm">
          Change status
        </Button>
        <Button variant="inverse" size="sm">
          Assign owner
        </Button>
      </>
    }
  />,
)

function PickOneHost() {
  const [picked, setPicked] = useState<string[]>([])
  const name = ROWS.find((t) => t.id === picked[0])?.name
  return (
    <div className="flex flex-col gap-3">
      <TenantsGrid
        maxSelections={1}
        exportFormats={['csv']}
        defaultOpen={false}
        onSelected={setPicked}
        bulkActions={
          <Button variant="inverse" size="sm">
            Open
          </Button>
        }
      />
      <p className="text-[13px] text-ink-soft" data-testid="picked">
        Picked: <b className="text-ink-strong">{name ?? 'nothing yet'}</b>
      </p>
    </div>
  )
}

/**
 * `maxSelections={1}`: radio buttons. Picking another row, or clicking anywhere
 * on it, replaces the last pick. One export format, so Export is a plain button.
 */
export const PickOne: Story = render(<PickOneHost />)

/**
 * `maxSelections={3}`: a fourth pick drops the oldest, so the three most recent
 * stay picked. Select-all is gone, because a page of eight does not fit under three.
 * The panel floats here; pin it to dock it beside the table.
 */
export const UpToThree: Story = render(
  <TenantsGrid
    maxSelections={3}
    defaultOpen={false}
    defaultPinned={false}
    bulkActions={
      <Button variant="inverse" size="sm">
        Compare
      </Button>
    }
  />,
)

const STATES = [
  { value: 'rows', label: 'Rows' },
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Nothing yet' },
  { value: 'nomatch', label: 'No match' },
  { value: 'error', label: 'Error' },
] as const

function StatesHost() {
  const [state, setState] = useState<(typeof STATES)[number]['value']>('empty')
  const [retries, setRetries] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="State"
        value={state}
        options={[...STATES]}
        onValueChange={(v) => setState(v as typeof state)}
        className="self-start"
      />
      <TenantsGrid
        // A fresh host for each state, so "No match" starts from its filter.
        key={state}
        rows={state === 'empty' ? [] : undefined}
        loading={state === 'loading'}
        error={state === 'error'}
        onRetry={() => setRetries((n) => n + 1)}
        emptyAction={<AddTenant />}
        initialTerms={
          state === 'nomatch' ? [{ id: 'none', field: null, value: 'zebra' }] : undefined
        }
        initialStatuses={state === 'nomatch' ? ['active'] : undefined}
      />
      {retries > 0 && <p className="text-[12.5px] text-ink-soft">Try again pressed {retries}×</p>}
    </div>
  )
}

/**
 * The states, side by side in one frame: loading, nothing yet, no match and an
 * error all keep the same height (`minBodyHeight`, 22rem by default), so the page
 * never jumps between them. Nothing yet offers the host's action; no match lists
 * the filters to remove; an error offers Try again and is never shown as empty.
 */
export const States: Story = render(<StatesHost />)
