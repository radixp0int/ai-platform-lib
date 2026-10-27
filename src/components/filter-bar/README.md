# FilterBar

The toolbar above a table: a **Filters** button, the **omnibox**, and the **panel**
the button opens. One list of `fields` drives all three.

```tsx
<FilterBar
  label="Search and filter tenants"
  fields={fields}            // the list FilterPanel already took
  terms={terms}              // typed conditions: searches and narrowings
  onTermsChange={setTerms}
  termFields={TERM_FIELDS}   // what "Narrow to a field" offers
  filterStyle={style}        // 'simple' | 'advanced'
  onFilterStyleChange={setStyle}
  onReset={reset}
  defaultOpen
  defaultPinned
>
  <DataTable … />
</FilterBar>
```

## What it derives from `fields`

| Surface              | Built from                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| The panel            | Every field, drawn by its type. Two or more `dateRange` fields share one "Dates" section.                                  |
| Chips in the omnibox | Every field that is set: one chip per chosen option, one per date, with a dimmed field name in front.                      |
| Typed suggestions    | Search, then narrowing to a field, then the dates and values that match what was typed. Each names the parameter it makes. |
| Quick picks (simple) | A row per date (its presets that have a `short` label) and a row per filter with six options or fewer.                     |

So there is one place to say what a filter is, and the four cannot disagree.

## Two styles

`simple` is the default: the button, the panel, and quick picks in the omnibox.
Focus it while it is empty and every date and small filter is one click away.
`advanced` is for typing: the omnibox suggests search, field narrowings, and the
dates and values that match, and offers no quick picks. Both read the same
`fields`, so switching loses nothing.
The style is a per-person preference, so the host holds it and persists it.

## Dates

A date field says which way it points. `direction: 'past'` (the default) is a
created or updated date: "Last 7 days". `direction: 'future'` is a due or renewal
date: "Overdue", "Next 7 days". With `presets: true` the panel and the quick picks
use the built-in set for that direction; pass a list to replace it, and give a pick
a `short` label to have it appear in the quick picks.

A date's preset is not stored. The host keeps a `DateRange`, and the preset is
whichever one matches it today, so "Last 30 days" is still right tomorrow.

## The panel

It floats over the table or docks beside it. `open` and `pinned` are kept apart so
the pin survives closing the panel. Floating, it closes on Escape or a click outside;
docked, it stays while you use the table, and taller than the screen it scrolls by
itself and follows you down the page.

## Turning parts off

Two booleans, both `true` by default.

| Prop         | Off, you get                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `showHeader` | No search box and no Filters button. A panel that is still on becomes a docked rail, always open, with nothing to close or pin. The style switch goes too.                       |
| `showPanel`  | No panel and no Filters button. The omnibox is the only way to filter, and its chips, suggestions and quick picks all work. A quick pick loses "Custom", which opened the panel. |

Both off draws only the table. Filters the host already holds keep applying;
nothing on screen shows them.

## Layout guarantees

These are tested, at 1280, 820 and 390 px:

- Chips wrap onto more lines; the field grows. A chip never outgrows its field: a
  long one ends in an ellipsis, keeps its remove button, and shows all of itself on
  hover.
- A table wider than its card scrolls inside the card; the page never scrolls
  sideways.
- Nothing is hidden by a container, and nothing is chopped without an ellipsis.

`tests/layout.ts` is the checker. Run `findCutOff(page)` on any screen.
