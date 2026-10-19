# Facet filters at 3,000–10,000 values

`FacetFilters` is a controlled view. The host provides options and counts, owns
selection, and turns that selection into the request used by chat. TanStack
Virtual limits mounted rows; it does not fetch options, compute facet counts,
or decide what a selection means.

## Keep three different numbers separate

- **Cardinality:** how many distinct selectable values a group has.
- **Selected values:** how many of those values the user chose.
- **Matching records:** how many records those choices cover.

An Accounts group with six options, each matching 1,000 records, has six facet
values. Choosing one account means **1 of 6 selected**, **1,000 records in
scope**, and **one active chip**. It must never turn into 1,000 selected record
IDs. A different group with 6,000 distinct account values and 1,000 selected
values shows a **1,000 of 6,000** summary. The `SixAccounts` and
`ThousandSelected` stories exercise both cases.

Counts for a group's options should ignore that group's own selections while
respecting other groups and the scope. This lets an option say how many records
it would contribute. An unknown count is not zero. A selected zero-count option
stays enabled so the user can remove it.

## Loading is independent of rendering

For a fully loaded local group, pass `values` and optionally `cardinality`.
It defaults to `mode: 'list'` even with 10,000 values. Search runs locally.
Do not attach paging metadata to describe a fully loaded list unless you also
explicitly set `mode: 'list'`.

```tsx
<FacetFilters
  groups={[{ key: 'accounts', label: 'Accounts', values: allAccounts }]}
  selection={selection}
  onSelectionChange={setSelection}
/>
```

For remote search, explicitly pass `mode: 'lookup'`, the current page of
`values`, and the appropriate `loaded`, `matchCount`, `hasMore`, and `loading`
metadata. `onSearchGroup` receives a debounced query; the host answers with
replacement values. The component does not filter those results again, because
the endpoint may match fields that are not shown in the label. Paging metadata
also selects lookup mode when `mode` is omitted, for existing consumers.
`FACET_LOOKUP_THRESHOLD` remains exported for compatibility but no longer picks
loading strategy.

The host must cancel or discard stale search responses and deduplicate page
requests. Keep lookup callbacks stable. `loaded` counts fetched matches, not
extra selected values carried alongside the page. The default is an explicit
Load more button; load-on-scroll remains optional. Use a label cache or carry
selected values with the page so active chips retain their labels.

Both modes virtualize results above 40 rows. The current list preview remains
small until expanded or searched. Each large group owns its existing scroll
window: 9 visible 32px rows in comfortable mode, 6 in compact mode, plus
overscan. Holding all 10,000 options in memory does not create 10,000 DOM rows.

## The row pipeline

The pipeline is: **host options → cached normalized options → matching rows →
virtual window**. Selection is an independent set of values.

`useFacetRows` preserves the initial host order across selection and count
refreshes, including a host response that reorders its existing values. Removed
values disappear; new values append. It caches lower-case label/value search
text and reuses that text when only counts change. Selection uses a `Set` and
never triggers a sort. Filtering is a linear scan of the loaded options;
TanStack renders only the window after that scan.

Count changes update numbers and availability without moving rows. Unavailable
rows are shown disabled by default; hiding them is an explicit user action.
Changing search intentionally changes the result set and resets its scroll
position. Local search hides non-matching selected rows while preserving those
selections in the host and active summary.

The chip renderer builds value-to-label maps, then constructs only the visible
chip budget. It does not create thousands of chips and slice the JSX afterward.
No worker or search-index dependency is currently needed; measure filtering on
representative devices before introducing either.

## Stable active filters and bounded expansion

The active-filter region reserves 112px in comfortable mode and 80px in compact
mode. Chips scroll inside that region, so selecting the first value or expanding
a summary does not push the option list down.

At three selected values, the group becomes a summary. Expanding it shows at
most **20 individual chips** and tells the user to review other selections in
the group's searchable list. The summary remains available for collapse and
has a separate Clear control. Collapsing never clears selection. Global chip
expansion is also bounded at **100 entries**, including custom/query chips.
These presentation limits never truncate the actual selection.

## Bulk selection and predicates

`selectAllCap` defaults to 500 and applies to both local and remote groups.
Above it, the UI does not enumerate all matches through the group checkbox.
Small searches can select their loaded available matches and undo that batch;
selections outside the search remain intact.

A larger search offers **Filter by this search instead** only when the host
supplies `onAddQuery`. That callback adds a `FacetQuery`, which the host must
actually apply to its results and chat scope. Query chips represent a live
predicate, not a frozen list of thousands of IDs. Define the backend's matching
semantics consistently with local search if it accepts those local predicates.
Without predicate support, the user narrows the search and chooses individual
values. Existing large selections can still be displayed, edited, and cleared.

## Keyboard and visual verification

Virtual lists retain native checkboxes inside a labelled group and list. They
have one checkbox tab stop. Arrow keys traverse logical options, including
unmounted rows; Page Up/Down move a viewport, Home/End move to the ends, Space
toggles, and Tab/Shift+Tab leave the list. Disabled rows are skipped. A focused
row remains mounted when scrolled offscreen. Each rendered list item carries
`aria-posinset` and `aria-setsize` for the current result set.

Build and run the Playwright coverage:

```sh
npm run build-storybook
npx playwright test src/components/facet-filters
```

`facet-scale.e2e.ts` checks 3K/10K local payloads and the compact panel, bounded
DOM row counts, local search, retained selection, keyboard traversal across
virtual boundaries, first/last positions, focus after selection, disabled rows,
Tab exit, row geometry and scroll offsets after selection/count refresh,
1-of-6 accounts, 1,000-value expansion, query promotion, and bulk undo.
Four checked-in Playwright snapshots cover the option list before selection,
after selection, after count refresh, and the bounded 1,000-selection preview.
The geometry assertions also verify that selecting and refreshing leave row
positions and scroll offsets unchanged. The compact fixture uses a constrained
530px panel and checks keyboard exit to Done. Remote pagination is covered
alongside local search. The existing screenshot script captures all facet
stories for visual review.
Browser checks do not replace a manual screen-reader check with VoiceOver or NVDA.

## Consumer controls and copy

The component keeps English defaults but lets hosts choose which helpers are visible.
For a plain selection list:

```tsx
<FacetFilters
  groups={groups}
  selection={selection}
  onSelectionChange={setSelection}
  showHeader={false}
  showSearch={false}
  showActiveFilters={false}
  showUnavailableToggle={false}
  defaultShowUnavailable={false}
  showSelectionHints={false}
  showSelectAll={false}
/>
```

`showUnavailableToggle` controls the button. `defaultShowUnavailable` controls
initial zero-count row visibility. Hiding the button alone keeps unavailable
rows disabled and visible. Selected zero-count values remain visible and can
be removed. Both defaults can be overridden on an individual `FacetGroup`.
`group.searchable` controls its own search; `showSearch` controls the search
across groups. Hiding global search also stops applying its previous query.

Other optional chrome: `showTotal`, `showCounts`, `showReset`, `showClearAll`, `showLoadAll`,
and `showLoadHint`. Omit `facetTypes` to remove custom entry, `scope` to remove
the scope control, and `onDone` to remove the dismiss footer. `showCounts` hides row count labels; underlying counts still determine availability.

`layout` overrides density defaults for `listPreview`, `windowRows`,
`groupsOpen`, and `maxChips`. `chipOptions` overrides `collapseAt`,
`previewLimit`, `expandedLimit`, and fixed region `height`. These are finite
presentation budgets, not limits on controlled selection. Defaults remain
3 / 20 / 100 chips and 112px comfortable / 80px compact. Keep budgets small
when thousands of values can be selected. `searchDebounceMs` defaults to 150
for host lookups; local search still runs immediately.

`labels` accepts strings and count-aware formatter functions for all helper
copy, including scope totals, group search, unavailable rows, query promotion,
chip summaries, loading, selection hints, and keyboard instructions. A host
can change “items in scope” to “matching records” with:

```tsx
labels={{ itemsInScope: (n) => `${n.toLocaleString()} matching records` }}
```

The host owns payload cost: `loadAllWarning(remaining)` can return a warning
based on its endpoint or `null`. Without it, loading reports only the remaining
option count. Existing byte-estimation helpers remain exported for hosts that
choose to use them.

Facet text inputs draw keyboard focus inside their border. The focus remains
visible at the edge of a scrolling rail, without padding changes or moving the
option list. `facet-controls.e2e.ts` covers both searches in light/dark modes,
four focused screenshots, and the minimal-controls story. Unit coverage checks
row visibility separately from button visibility, controlled clear-all, read-only
chips, hidden search, and independent labels across two mounted instances.
