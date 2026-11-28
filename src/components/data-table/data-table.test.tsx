import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTable } from './data-table'
import type { DataTableProps } from './types'

type Row = { id: string; name: string }
const props: DataTableProps<Row> = {
  caption: 'Rows',
  columns: [{ id: 'name', header: 'Name', cell: (r) => r.name }],
  rows: [{ id: 'a', name: 'Bayshore Foods' }],
  rowId: (r) => r.id,
  rowActions: (r) => <button type="button">Open {r.name}</button>,
}

const wrapperOf = () => screen.getByRole('button', { name: 'Open Bayshore Foods' }).parentElement!

describe('DataTable row actions', () => {
  it('reveal on hover by default', () => {
    render(<DataTable {...props} />)
    expect(wrapperOf().className).toContain('opacity-0')
  })

  it('show on every row with rowActionsVisible="always"', () => {
    render(<DataTable {...props} rowActionsVisible="always" />)
    expect(wrapperOf().className).not.toContain('opacity-0')
  })
})

describe('DataTable actionsHeader', () => {
  const header = () => screen.getByRole('columnheader', { name: 'Actions' })

  it('keeps the name for screen readers only by default', () => {
    render(<DataTable {...props} />)
    const name = within(header()).getByText('Actions')
    expect(name.className).toContain('sr-only')
  })

  it('"hidden" is the same as the default', () => {
    render(<DataTable {...props} actionsHeader="hidden" />)
    expect(within(header()).getByText('Actions').className).toContain('sr-only')
  })

  it('"visible" draws the name, right-aligned, and it is still the column header', () => {
    render(<DataTable {...props} actionsHeader="visible" />)
    const th = header()
    expect(th.tagName).toBe('TH')
    expect(th).toHaveAttribute('scope', 'col')
    expect(within(th).getByText('Actions').className).not.toContain('sr-only')
    expect(th.className).toContain('text-right')
    // One header per column: Name and Actions.
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
  })

  it('has no actions header without row actions, whichever is asked for', () => {
    render(<DataTable {...props} rowActions={undefined} actionsHeader="visible" />)
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).toBeNull()
  })
})
