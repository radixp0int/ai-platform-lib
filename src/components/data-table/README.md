# DataTable sorting

The table sorts nothing itself. A header becomes a button, the host gets the new
`Sort[]`, and the rows it passes back are already in order. What the table adds is
which columns may sort, how values compare, and a request that never names a field
the backend cannot order by.

## Which columns sort

A column sorts when it has a `sortKey`, and neither it nor the table has switched
sorting off.

| Setting                         | Effect                                                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `sortKey: 'created_at'`         | The header is a button. The key is what goes on the wire, and is often the API's name, not the column's `id`.                |
| `sortable: false`               | Keeps the key and turns the column off: no button, no arrows, never in the request. For a field the backend cannot order by. |
| `sortable={false}` on the table | Every column off, for an endpoint that takes no `sort` at all.                                                               |

A sort in the host's state that names a column that is off is ignored: no arrows, no
`aria-sort`, rows as they came. `isColumnSortable` is the one place that decides, and the
header, `sortRows` and `toSortParam` all ask it.

## Server-side, or all rows in the browser

```ts
// Paged: ask the server, and leave the parameter off when nothing enabled is sorted.
const sort = toSortParam(state, columns)
fetch(`/api/tenants?page=1${sort ? `&sort=${sort}` : ''}`)

// Everything loaded: sort here, with the same columns.
const rows = sortRows(all, state, columns)
```

Both read the same `columns`, so a column switched off is off for both.

## How values compare (`sortRows`)

`sortType` says how, and defaults to `text`.

| `sortType` | Compares                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `text`     | Without regard to case or accents, and numbers inside text as numbers: "Suite 2" before "Suite 10". |
| `number`   | As numbers, so 88 comes before 412. Numeric strings are read; "n/a" counts as missing.              |
| `date`     | As moments. ISO strings, `Date` objects and epoch numbers all work; unreadable counts as missing.   |

A row with nothing to compare goes last whichever way the column sorts, because
"unknown" is neither the smallest nor the largest. Equal rows keep the order they came in.
`sortValue` reads the value when the column shows something derived, such as seats in use out
of a `[used, total]` pair, or when `sortKey` is not a property of the row.

`sortRows` returns the same array when there is nothing to sort by, and never changes the one it
was given.

# DataTable row actions

`rowActions` is the trailing column of per-row controls. Give it a function and it draws whatever
you return. Give it a list of `RowAction`s and the table draws the controls itself: the first
`showVisible` as buttons, the rest in a ⋯ menu that works with nothing more from you.

```tsx
<DataTable
  rowLabel={(t) => t.name}
  actionsHeader="visible"
  rowActions={[
    { id: 'view', label: 'View details', icon: <EyeIcon />, onSelect: openDetails },
    { id: 'edit', label: 'Edit', icon: <PencilIcon />, onSelect: edit },
    { id: 'copy', label: 'Copy tenant ID', icon: <CopyIcon />, onSelect: copyId },
    {
      id: 'delete',
      label: 'Delete tenant…',
      icon: <TrashIcon />,
      tone: 'danger',
      separatorBefore: true,
      disabled: (t) => t.id === currentId,
      hint: (t) => (t.id === currentId ? 'You are in it' : undefined),
      onSelect: remove,
    },
  ]}
/>
```

That draws View details and Edit as icon buttons and a ⋯ holding Copy tenant ID, a rule and Delete.

| Setting                           | Effect                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `showVisible` (default `2`)       | How many are buttons. Enough to show them all leaves no ⋯; `0` leaves only the ⋯.                                        |
| `icon`                            | With one, a visible action is an icon button. Without, a small text button. In the menu the glyph is optional.           |
| `hidden`, `disabled`, `hint`      | A value, or a function of the row. A hidden action is left out before counting, so the next one moves up into its place. |
| `tone: 'danger'`                  | Colours the menu item, and a text button. An icon button stays neutral.                                                  |
| `separatorBefore`                 | A rule above the item when it is in the menu. Not drawn above the first one.                                             |
| `labels.rowAction`, `moreActions` | The buttons' accessible names ("Edit for Bayshore Foods"), and the ⋯'s ("More actions for …").                           |

Pass `rowLabel`, or the names use the row id.

The column's width follows from `showVisible` when every visible action has an icon: two buttons and
the ⋯ fit in `124px`, and each button after adds `34px`. A text button's width is not known to the
table, so give `actionsWidth` for one.

The ⋯ menu opens below its button, lined up with its right edge, and opens upward instead when it
would run off the bottom of the screen and there is more room above. Escape closes it and returns
focus to the ⋯; so does choosing an item, before the action runs. Clicks in the cell never toggle an
expandable row. With `rowActionsVisible="hover"` the ⋯ stays showing while its menu is open.
