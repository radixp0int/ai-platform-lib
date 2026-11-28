import { describe, expect, it } from 'vitest'
import { actionsColumnWidth, menuHeight, perRow, splitRowActions } from './row-action-model'
import type { RowAction } from './types'

type Row = { id: string; locked?: boolean }
const icon = 'icon'
const action = (id: string, extra: Partial<RowAction<Row>> = {}): RowAction<Row> => ({
  id,
  label: id,
  icon,
  onSelect: () => {},
  ...extra,
})
const ids = (list: RowAction<Row>[]) => list.map((a) => a.id)

describe('perRow', () => {
  it('passes a plain value through and calls a function with the row', () => {
    const row = { id: 'a' }
    expect(perRow(true, row)).toBe(true)
    expect(perRow<boolean, Row>((r) => r.id === 'a', row)).toBe(true)
    expect(perRow(undefined, row)).toBeUndefined()
  })
})

describe('splitRowActions', () => {
  const list = [action('view'), action('edit'), action('copy'), action('delete')]

  it('the first showVisible are buttons and the rest are the menu, in order', () => {
    const { buttons, menu } = splitRowActions(list, { id: 'a' }, 2)
    expect(ids(buttons)).toEqual(['view', 'edit'])
    expect(ids(menu)).toEqual(['copy', 'delete'])
  })

  it('room for all of them leaves no menu, and 0 leaves only the menu', () => {
    expect(splitRowActions(list, { id: 'a' }, 4).menu).toEqual([])
    expect(splitRowActions(list, { id: 'a' }, 9).menu).toEqual([])
    const none = splitRowActions(list, { id: 'a' }, 0)
    expect(none.buttons).toEqual([])
    expect(ids(none.menu)).toEqual(ids(list))
  })

  it('treats a count that is not a whole number as the nearest one below, and nonsense as 0', () => {
    expect(ids(splitRowActions(list, { id: 'a' }, 1.9).buttons)).toEqual(['view'])
    expect(splitRowActions(list, { id: 'a' }, -3).buttons).toEqual([])
    expect(splitRowActions(list, { id: 'a' }, Number.NaN).buttons).toEqual([])
  })

  it('drops the actions hidden for a row before counting, so the next one moves up', () => {
    const withHidden: RowAction<Row>[] = [
      action('view', { hidden: (r) => Boolean(r.locked) }),
      ...list.slice(1),
    ]
    expect(ids(splitRowActions(withHidden, { id: 'a' }, 2).buttons)).toEqual(['view', 'edit'])
    const locked = splitRowActions<Row>(withHidden, { id: 'b', locked: true }, 2)
    expect(ids(locked.buttons)).toEqual(['edit', 'copy'])
    expect(ids(locked.menu)).toEqual(['delete'])
  })

  it('hidden can be a plain boolean', () => {
    expect(
      ids(splitRowActions([action('a'), action('b', { hidden: true })], { id: 'x' }, 5).buttons),
    ).toEqual(['a'])
  })
})

describe('actionsColumnWidth', () => {
  const four = [action('a'), action('b'), action('c'), action('d')]

  it('fits showVisible icon buttons and the ⋯ exactly: three slots are 124px', () => {
    expect(actionsColumnWidth(four, 2)).toBe('124px')
    expect(actionsColumnWidth(four, 3)).toBe('158px')
  })

  it('has no ⋯ slot when everything fits as a button', () => {
    expect(actionsColumnWidth(four.slice(0, 3), 3)).toBe('124px')
  })

  it('never goes narrower than the "Actions" header needs', () => {
    expect(actionsColumnWidth(four, 0)).toBe('88px')
    expect(actionsColumnWidth(four.slice(0, 1), 5)).toBe('88px')
  })

  it('is left to the host when a visible action is a text button', () => {
    expect(actionsColumnWidth([action('a', { icon: undefined }), ...four], 2)).toBeUndefined()
    // A text action that is in the menu does not matter.
    expect(actionsColumnWidth([...four.slice(0, 2), action('t', { icon: undefined })], 2)).toBe(
      '124px',
    )
  })

  it('has nothing to say about no actions', () => {
    expect(actionsColumnWidth([], 2)).toBeUndefined()
  })
})

describe('menuHeight', () => {
  const row = { id: 'a' }

  it('adds a line per item, a taller one for a hint, and the rule between groups', () => {
    const plain = [action('a'), action('b')]
    expect(menuHeight(plain, row)).toBe(16 + 44 + 44)
    const hinted = [action('a'), action('b', { hint: 'why', separatorBefore: true })]
    expect(menuHeight(hinted, row)).toBe(16 + 44 + 52 + 10)
  })

  it('a rule above the first item is not drawn, so it is not counted', () => {
    expect(menuHeight([action('a', { separatorBefore: true })], row)).toBe(16 + 44)
  })

  it('counts a hint that depends on the row only for the rows that have it', () => {
    const item = action('a', { hint: (r) => (r.locked ? 'Locked' : undefined) })
    expect(menuHeight([item], { id: 'x' })).toBe(16 + 44)
    expect(menuHeight<Row>([item], { id: 'x', locked: true })).toBe(16 + 52)
  })
})
