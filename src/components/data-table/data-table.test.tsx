import { render, screen } from '@testing-library/react'
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
