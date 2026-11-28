import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTable } from './data-table'
import type { DataTableProps, RowAction } from './types'

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

describe('DataTable rowActions as a list', () => {
  const rows: Row[] = [
    { id: 'a', name: 'Bayshore Foods' },
    { id: 'b', name: 'Crestview Builders' },
  ]
  const make = (onSelect = vi.fn()): RowAction<Row>[] => [
    { id: 'view', label: 'View details', icon: <i />, onSelect },
    { id: 'edit', label: 'Edit', icon: <i />, onSelect },
    { id: 'copy', label: 'Copy ID', icon: <i />, onSelect },
    { id: 'archive', label: 'Archive', onSelect },
    {
      id: 'delete',
      label: 'Delete…',
      tone: 'danger',
      separatorBefore: true,
      disabled: (r) => r.id === 'b',
      hint: (r) => (r.id === 'b' ? 'Not this one' : undefined),
      onSelect,
    },
  ]
  const table = (extra: Partial<DataTableProps<Row>> = {}) => (
    <DataTable {...props} rows={rows} rowLabel={(r) => r.name} rowActions={make()} {...extra} />
  )
  const more = (name: string) => screen.getByRole('button', { name: `More actions for ${name}` })

  it('draws the first two as icon buttons and the ⋯ for the rest, by default', () => {
    render(table())
    const row = screen.getByRole('row', { name: /Bayshore Foods/ })
    expect(
      within(row)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual([
      'View details for Bayshore Foods',
      'Edit for Bayshore Foods',
      'More actions for Bayshore Foods',
    ])
    expect(within(row).getByRole('button', { name: /^View details/ })).toHaveAttribute(
      'title',
      'View details',
    )
  })

  it('showVisible says how many are buttons, and enough of them leaves no ⋯', () => {
    const { rerender } = render(table({ showVisible: 3 }))
    expect(screen.getAllByRole('button', { name: /^Copy ID for / })).toHaveLength(2)
    rerender(table({ showVisible: 5 }))
    expect(screen.queryByRole('button', { name: /^More actions/ })).toBeNull()
    rerender(table({ showVisible: 0 }))
    expect(screen.queryByRole('button', { name: /^Edit for / })).toBeNull()
    expect(more('Bayshore Foods')).toBeInTheDocument()
  })

  it('an action with no icon is a small text button', () => {
    render(table({ showVisible: 4 }))
    const row = screen.getByRole('row', { name: /Bayshore Foods/ })
    expect(
      within(row).getByRole('button', { name: 'Archive for Bayshore Foods' }),
    ).toHaveTextContent('Archive')
  })

  it('the ⋯ opens a menu of the rest, with the rule and a disabled item that says why', async () => {
    const user = userEvent.setup()
    render(table())
    await user.click(more('Crestview Builders'))
    expect(more('Crestview Builders')).toHaveAttribute('aria-expanded', 'true')
    const menu = await screen.findByRole('menu', { name: 'More actions for Crestview Builders' })
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((i) => i.textContent),
    ).toEqual(['Copy ID', 'Archive', 'Delete…Not this one'])
    expect(within(menu).getAllByRole('separator')).toHaveLength(1)
    expect(within(menu).getByRole('menuitem', { name: /Delete/ })).toBeDisabled()
  })

  it('choosing an item calls onSelect with the row, and closes the menu', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(table({ rowActions: make(onSelect) }))
    await user.click(more('Bayshore Foods'))
    await user.click(await screen.findByRole('menuitem', { name: 'Copy ID' }))
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(rows[0])
    expect(screen.queryByRole('menu')).toBeNull()
    expect(more('Bayshore Foods')).toHaveFocus()
  })

  it('a button calls onSelect with its row', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(table({ rowActions: make(onSelect) }))
    await user.click(screen.getByRole('button', { name: 'Edit for Crestview Builders' }))
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(rows[1])
  })

  it('Escape closes the menu', async () => {
    const user = userEvent.setup()
    render(table())
    await user.click(more('Bayshore Foods'))
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('an action hidden for a row is left out, and the next one moves up', () => {
    const list: RowAction<Row>[] = [
      { id: 'a', label: 'One', icon: <i />, hidden: (r) => r.id === 'a', onSelect: vi.fn() },
      { id: 'b', label: 'Two', icon: <i />, onSelect: vi.fn() },
      { id: 'c', label: 'Three', icon: <i />, onSelect: vi.fn() },
    ]
    render(table({ rowActions: list, showVisible: 1 }))
    const first = screen.getByRole('row', { name: /Bayshore Foods/ })
    const second = screen.getByRole('row', { name: /Crestview Builders/ })
    expect(within(first).queryByRole('button', { name: /^One/ })).toBeNull()
    expect(within(first).getByRole('button', { name: /^Two/ })).toBeInTheDocument()
    expect(within(second).getByRole('button', { name: /^One/ })).toBeInTheDocument()
  })

  it('a click in the actions cell does not toggle an expandable row', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(table({ renderExpanded: () => 'Detail', expandedIds: [], onExpandedChange }))
    await user.click(screen.getByRole('button', { name: 'Edit for Bayshore Foods' }))
    await user.click(more('Bayshore Foods'))
    const menu = await screen.findByRole('menu')
    await user.click(menu.parentElement!)
    expect(onExpandedChange).not.toHaveBeenCalled()
  })

  it('sizes the column from showVisible, unless actionsWidth is given', () => {
    const { rerender } = render(table())
    const width = () => screen.getByRole('columnheader', { name: 'Actions' }).style.width
    expect(width()).toBe('124px')
    // Archive, the fourth action, is a text button: not among the first three, so it is not measured.
    rerender(table({ showVisible: 3 }))
    expect(width()).toBe('158px')
    // Among the first four it is, and its width is not known: the default applies.
    rerender(table({ showVisible: 4 }))
    expect(width()).toBe('128px')
    rerender(table({ actionsWidth: '200px' }))
    expect(width()).toBe('200px')
  })

  it('an empty list has no actions column', () => {
    render(table({ rowActions: [] }))
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).toBeNull()
  })

  it('the function form still draws whatever it returns', () => {
    render(table({ rowActions: (r) => <button type="button">Mine {r.name}</button> }))
    expect(screen.getByRole('button', { name: 'Mine Bayshore Foods' })).toBeInTheDocument()
  })

  it('the labels can be replaced', () => {
    render(
      table({
        labels: { rowAction: (action, row) => `${action} · ${row}`, moreActions: 'Weitere' },
      }),
    )
    expect(screen.getByRole('button', { name: 'Edit · Bayshore Foods' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Weitere · Bayshore Foods' })).toBeInTheDocument()
  })
})
