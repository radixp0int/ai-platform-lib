import { Fragment, useState } from 'react'
import { Button } from '../../primitives/button'
import { IconButton } from '../../primitives/icon-button'
import { DotsIcon } from '../../primitives/icons'
import { Menu, MenuItem, MenuSeparator } from '../../primitives/menu'
import { Popover } from '../../primitives/popover'
import { menuHeight, perRow, splitRowActions } from './row-action-model'
import type { DataTableLabels, RowAction } from './types'

const MENU_WIDTH = 232

type RowActionsProps<T> = {
  actions: RowAction<T>[]
  row: T
  /** The row's name for people, for the buttons' accessible names. */
  name: string
  showVisible: number
  labels: DataTableLabels
}

/**
 * One row's actions as `rowActions` given as a list draws them: the first
 * `showVisible` as buttons, the rest in the ⋯ menu.
 */
export function RowActions<T>({ actions, row, name, showVisible, labels: t }: RowActionsProps<T>) {
  const { buttons, menu } = splitRowActions(actions, row, showVisible)
  return (
    <>
      {buttons.map((action) => {
        const disabled = Boolean(perRow(action.disabled, row))
        const label = t.rowAction(action.label, name)
        return action.icon ? (
          <IconButton
            key={action.id}
            size="sm"
            shape="rounded"
            aria-label={label}
            title={action.label}
            disabled={disabled}
            onClick={() => action.onSelect(row)}
          >
            {action.icon}
          </IconButton>
        ) : (
          <Button
            key={action.id}
            size="sm"
            variant={action.tone === 'danger' ? 'danger' : 'ghost'}
            aria-label={label}
            disabled={disabled}
            onClick={() => action.onSelect(row)}
          >
            {action.label}
          </Button>
        )
      })}
      {menu.length > 0 && <RowMenu items={menu} row={row} name={name} labels={t} />}
    </>
  )
}

/** The ⋯ button and the menu it opens. */
function RowMenu<T>({
  items,
  row,
  name,
  labels: t,
}: {
  items: RowAction<T>[]
  row: T
  name: string
  labels: DataTableLabels
}) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const label = t.rowAction(t.moreActions, name)

  const toggle = () => {
    if (!open && anchor) {
      // Down unless it would run off the screen and there is more room above.
      const rect = anchor.getBoundingClientRect()
      const below = window.innerHeight - rect.bottom
      setUp(below < menuHeight(items, row) && rect.top > below)
    }
    setOpen(!open)
  }
  const choose = (action: RowAction<T>) => {
    setOpen(false)
    // Focus goes back to the ⋯ first, so an action that opens something takes it from there.
    anchor?.focus()
    action.onSelect(row)
  }

  return (
    // The panel is portalled, but React still bubbles its clicks through here:
    // a click on its padding must not toggle an expandable row.
    <span className="contents" onClick={(event) => event.stopPropagation()}>
      <IconButton
        ref={setAnchor}
        size="sm"
        shape="rounded"
        active={open}
        aria-label={label}
        title={t.moreActions}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <DotsIcon width={15} height={15} />
      </IconButton>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        width={MENU_WIDTH}
        align={up ? 'above-end' : 'end'}
      >
        <Menu aria-label={label}>
          {items.map((action, index) => (
            <Fragment key={action.id}>
              {action.separatorBefore && index > 0 && <MenuSeparator />}
              <MenuItem
                icon={action.icon}
                label={action.label}
                hint={perRow(action.hint, row)}
                tone={action.tone}
                disabled={Boolean(perRow(action.disabled, row))}
                onSelect={() => choose(action)}
              />
            </Fragment>
          ))}
        </Menu>
      </Popover>
    </span>
  )
}
