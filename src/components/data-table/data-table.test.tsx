import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTable } from './data-table'
import { ROW_TONE_EDGE, type RowTone } from './row-tone'
import type { Column, DataTableProps } from './types'

type ActionRow = { id: string; name: string }
const actionProps: DataTableProps<ActionRow> = {
  caption: 'Rows',
  columns: [{ id: 'name', header: 'Name', cell: (r) => r.name }],
  rows: [{ id: 'a', name: 'Bayshore Foods' }],
  rowId: (r) => r.id,
  rowActions: (r) => <button type="button">Open {r.name}</button>,
}

const wrapperOf = () => screen.getByRole('button', { name: 'Open Bayshore Foods' }).parentElement!

describe('DataTable row actions', () => {
  it('reveal on hover by default', () => {
    render(<DataTable {...actionProps} />)
    expect(wrapperOf().className).toContain('opacity-0')
  })

  it('show on every row with rowActionsVisible="always"', () => {
    render(<DataTable {...actionProps} rowActionsVisible="always" />)
    expect(wrapperOf().className).not.toContain('opacity-0')
  })
})

type Row = { id: string; name: string; tone?: RowTone }

const ROWS: Row[] = [
  { id: 'a', name: 'Failed run', tone: 'error' },
  { id: 'b', name: 'Waiting run', tone: 'warning' },
  { id: 'c', name: 'Plain run' },
]
const COLUMNS: Column<Row>[] = [{ id: 'name', header: 'Run', cell: (r) => r.name }]

const table = (props: Partial<DataTableProps<Row>> = {}) =>
  render(<DataTable caption="Runs" columns={COLUMNS} rows={ROWS} rowId={(r) => r.id} {...props} />)

/** The `<tr>` a run's name sits in. */
const rowOf = (name: string) => screen.getByText(name).closest('tr')!

describe('DataTable rowTone', () => {
  it('marks each toned row with its tone and its edge', () => {
    table({ rowTone: (r) => r.tone })
    expect(rowOf('Failed run')).toHaveAttribute('data-tone', 'error')
    expect(rowOf('Failed run').className).toContain(ROW_TONE_EDGE.error)
    expect(rowOf('Waiting run')).toHaveAttribute('data-tone', 'warning')
    expect(rowOf('Waiting run').className).toContain(ROW_TONE_EDGE.warning)
  })

  it('leaves a row with no tone exactly as a table without rowTone draws it', () => {
    const { unmount } = table()
    const before = [...screen.getAllByRole('row')].map((r) => r.outerHTML)
    unmount()
    table({ rowTone: () => undefined })
    const after = [...screen.getAllByRole('row')].map((r) => r.outerHTML)
    expect(after).toEqual(before)
  })

  it('a plain row beside toned ones has no tone and no edge', () => {
    table({ rowTone: (r) => r.tone })
    const plain = rowOf('Plain run')
    expect(plain).not.toHaveAttribute('data-tone')
    expect(plain.className).not.toContain('shadow-')
  })

  it('a selected row keeps its tone', () => {
    table({
      rowTone: (r) => r.tone,
      selectedIds: ['b'],
      onSelectionChange: () => {},
      rowLabel: (r) => r.name,
    })
    const row = rowOf('Waiting run')
    expect(within(row).getByRole('checkbox', { name: /Waiting run/ })).toBeChecked()
    expect(row).toHaveAttribute('data-selected', 'true')
    expect(row).toHaveAttribute('data-tone', 'warning')
    expect(row.className).toContain(ROW_TONE_EDGE.warning)
  })

  it('an open toned row carries its tone down through the expanded detail', () => {
    table({
      rowTone: (r) => r.tone,
      expandedIds: ['a'],
      onExpandedChange: () => {},
      renderExpanded: (r) => <p>Detail for {r.name}</p>,
    })
    const row = rowOf('Failed run')
    expect(row.className).toContain(ROW_TONE_EDGE.error)
    expect(row.className).not.toContain('var(--brand-solid)]')
    const panel = screen.getByText('Detail for Failed run').closest('tr')!
    expect(panel.className).toContain(ROW_TONE_EDGE.error)
  })

  it('an open row with no tone keeps the brand rail', () => {
    table({
      expandedIds: ['c'],
      onExpandedChange: () => {},
      renderExpanded: (r) => <p>Detail for {r.name}</p>,
    })
    expect(rowOf('Plain run').className).toContain('shadow-[inset_3px_0_0_var(--brand-solid)]')
    const panel = screen.getByText('Detail for Plain run').closest('tr')!
    expect(panel.className).toContain('shadow-[inset_3px_0_0_var(--brand-solid)]')
  })
})
