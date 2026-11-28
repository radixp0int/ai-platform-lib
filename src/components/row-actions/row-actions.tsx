import { useState } from 'react'
import { IconButton } from '../../primitives/icon-button'
import { DotsIcon } from '../../primitives/icons'
import { Link } from '../../primitives/link'
import { Menu, MenuItem, MenuSeparator } from '../../primitives/menu'
import { Popover } from '../../primitives/popover'
import type { RowActionButton, RowActionsProps } from './types'
// The controls at the end of a table row: an optional text button, icon
// buttons, then a ⋯ menu with a rule before the destructive entry. Lists of
// tenants and of workflows share it, so a row reads the same on every page.
//
// Put it in `DataTable`'s `rowActions`, with `rowActionsVisible="always"`.

const iconLink =
  'inline-grid size-8 shrink-0 place-items-center rounded-control text-ink-soft transition hover:bg-tint/8 hover:text-ink-strong focus-visible:-outline-offset-2'

function ActionButton({ action, name }: { action: RowActionButton; name: string }) {
  const label = action.ariaLabel ?? `${action.label} for ${name}`
  if (action.disabledReason) {
    return (
      <IconButton
        size="sm"
        shape="rounded"
        aria-disabled
        aria-label={`${label} (${action.disabledReason.toLowerCase()})`}
        title={action.disabledReason}
        className="cursor-default opacity-40 hover:bg-transparent"
      >
        {action.icon}
      </IconButton>
    )
  }
  if (action.href) {
    return (
      <Link
        variant="plain"
        href={action.href}
        aria-label={label}
        title={action.label}
        onClick={action.onSelect}
        className={iconLink}
      >
        {action.icon}
      </Link>
    )
  }
  return (
    <IconButton
      size="sm"
      shape="rounded"
      aria-label={label}
      title={action.label}
      onClick={action.onSelect}
    >
      {action.icon}
    </IconButton>
  )
}

export function RowActions({
  name,
  children,
  buttons = [],
  menu,
  menuUp = false,
  menuWidth = 232,
}: RowActionsProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  return (
    <span className="flex items-center justify-end gap-0.5">
      {children && <span className="mr-1.5 flex items-center">{children}</span>}
      {buttons.map((action) => (
        <ActionButton key={action.label} action={action} name={name} />
      ))}
      {menu && menu.length > 0 && (
        <>
          <IconButton
            ref={setAnchor}
            size="sm"
            shape="rounded"
            active={open}
            aria-label={`More actions for ${name}`}
            title="More actions"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <DotsIcon width={15} height={15} />
          </IconButton>
          <Popover
            anchor={anchor}
            open={open}
            onClose={() => setOpen(false)}
            label={`Actions for ${name}`}
            width={menuWidth}
            align={menuUp ? 'above-end' : 'end'}
          >
            <Menu aria-label={`Actions for ${name}`}>
              {menu.map((entry, i) =>
                entry === 'separator' ? (
                  <MenuSeparator key={`sep-${i}`} />
                ) : (
                  <MenuItem
                    key={entry.label}
                    icon={entry.icon}
                    label={entry.label}
                    hint={entry.disabledReason}
                    tone={entry.tone}
                    disabled={Boolean(entry.disabledReason)}
                    onSelect={() => {
                      setOpen(false)
                      entry.onSelect()
                    }}
                  />
                ),
              )}
            </Menu>
          </Popover>
        </>
      )}
    </span>
  )
}
