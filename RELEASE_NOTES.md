# Release notes

Changes to the component library as seen from Storybook. Newest first. Each
entry names the modules it touches so the sidebar entry is easy to find.

## 2026-10-22 — One side menu: the run outline moves into it

- **The live run page no longer has a side panel of its own.** Its run card,
  workflow picker, stages and "Needs you" are now a **This run** section of the
  platform's side menu, under the destinations, so the page uses the same menu
  as every other. Folded to the rail, the section is the stage markers and a
  badge for what needs you. The shell docks the menu on workflow pages (they
  are no longer in its `FOCUSED` list) and starts it folded below 1280px.
- **`SideMenu` takes a page's own section.** New **`InSideMenu`** (children for
  the expanded menu, `rail` for the rail) and **`SideMenuSlotProvider`**; the
  section is a portal, so it keeps the page's state. `AppShell` provides the
  slot. `MenuBadge` is now exported.
- **Breaking for hosts:** `RunSidebar` is gone, replaced by **`RunOutline`** and
  **`RunOutlineRail`** (no `appName`, no `onCollapse`). `WorkflowDemoPage` has to
  sit inside a `SideMenuSlotProvider` to show its outline, which `AppShell` is.
  `RunTopBar` loses `runPanelOpen` and `onShowRunPanel`: the menu's own button
  folds and opens it. The tablet "Run outline" dialog is gone with it.
- **Stories:** the whole-run stories now render inside the shell
  (`InAppShell`), so the outline has a menu to be drawn in.

## 2026-10-22 — Workflows: inputs and outputs

- **Steps say what they read and produce.** The Step details panel and the
  full-width step view show a step's **Inputs** (each with where it came from)
  and **Outputs**, with this run's values. A value the run has not reached reads
  "Not ready yet", "Waiting on this step", "Being produced" and so on, by
  status. New component **`StepInputsOutputs`**; `StepInspector` and
  `StepDetail` take an optional `io`.
- **Starting a run asks for its inputs.** New **`RunInputsForm`** (one field per
  input, by type; it will not submit with a required field empty) and
  **`StartRunDialog`** (the form in a modal, with a workflow picker when there
  is a choice, a refusal notice, and a "Run started" state). The run page's
  workflow switcher goes through the form when a workflow asks for inputs.
- **New component: `RunContract`,** a workflow's inputs (required or optional)
  and outputs (and where each goes), for the workflow detail page.
- **New component: `IoTypePill`,** the mono type tag beside a field's name.
- **Engine: `resolveStepIO`, `validateIO`, `PENDING_OUTPUT`.** An input's value
  is read off its source's output once that step is done, never stored twice.
  `RunGraph` gains `io` and `inputs`; `StepChange` gains `io`;
  `RunSource.start` and `useRun().start` take the start values.
- **Wire protocol** (coordinate with `workflow-ws-server` and
  `chat-workflow-mock-api`): `WireStep.io`, `StepPatch.io`, `WireRun.inputs`,
  `VariantInfo.inputs`/`outputs`, `run.start` `inputs`, and the `IoType`,
  `StepInput`, `StepOutput`, `RunInputSpec` and `RunOutputSpec` types. All
  optional on read.
- **Fixtures.** Every step of the loan, RFP, onboarding and incident runs has
  I/O, written one line each way through the new `io()` helper; each run
  declares its start inputs and outputs. The fixture source holds output values
  back until a step finishes.
- **Recipes:** a **Start a workflow** story on Workflows table.
- **Tests.** Unit tests for `resolveStepIO`, `validateIO`, the reducer's `io`
  patch, and the wiring of all four fixtures; browser tests for each new
  component, the RFP run's panel before and after approval, and starting a
  workflow from the table.

## 2026-10-21 — Chat: the humanized assistant, a marble bust

- **The Marble bust won the avatar review.** The humanized assistant is
  Aristotle as a marble bust, wherever the assistant appears; otherwise it is
  the Orb. Apps turn humanized on for super admins.
  It blinks at rest, tilts its head while thinking and nods while talking,
  and reduced motion stills it.
- **`AssistantAvatar` takes a `kind`:** `orb` or `marble-bust`. Without one it
  draws what the nearest **`AssistantAvatarProvider`** sets, and the Orb when
  there is none. The library doesn't know who is signed in, so the host sets
  it; **`assistantAvatarFor({ humanized })`** turns the flag into a mark. Avatars
  for individual agents can join the list later.
- **The assistant's mark now goes through `AssistantAvatar` everywhere it
  speaks:** beside each answer in `ChatMessage` (thinking until the first
  words, then talking while they stream), in the widget's header and empty
  panel, and in the empty-state composer.
- **Widget: `assistantAvatar` on `WidgetContent`.** With the bust, the closed
  launcher shows it in place of the sphere.
- **Recipes:** a **Humanized** story on Full chat app and on Widget on a
  host page; both take a `humanized` flag.
- **Tests.** Unit tests for `assistantAvatarFor`; browser tests for the bust's
  size and motion, the provider, and both recipes plain and humanized.

## 2026-10-21 — Chat: the Ghost prompt greeting

- **The empty conversation is the Ghost prompt.** The greeting, then the
  composer, then today's suggestions, all left-aligned. While the box is empty
  the assistant types each suggestion into it in turn; once a question is
  whole, Tab or → puts it in the draft (it never sends by itself), and typing
  anything hides it. With reduced motion each question appears whole and
  changes every six seconds. Screen readers hear the finished question as the
  box's description, not each character.
- **`Greeting` is a two-tone headline:** "Good morning, Joe." then the
  assistant's question, "What are we working on?", in a quieter colour, as one
  `h1`. New `question` prop. The Orb is no longer drawn here, and "How can I
  help you today?" is gone.
- **`SuggestedQuestions` are rows, not cards:** the question, its reason on the
  right and an arrow, under a "Suggested for today" label. New `activeIndex`
  marks the row being typed into the composer. Reasons drop out when `compact`
  and below `sm`.
- **`Composer`: `ghostPrompt` and `leading`.** `ghostPrompt` takes what
  `useGhostPrompt` returns and draws it where the placeholder would be, with a
  "Tab to use" hint once whole; `leading` puts a mark at the start of the text
  line. Both are optional and change nothing when omitted.
- **New hook: `useGhostPrompt`** (exported with `GHOST_TIMING`), headless:
  type, hold, erase, next. Pauses while disabled and carries on with the next
  question.
- **New component: `AssistantAvatar`,** the assistant's mark with an `idle`,
  `thinking` or `talking` state. It draws the Orb today; the chosen avatar goes
  in here. New `animate-orb-talk` motion token.
- **New icon: `ArrowRightIcon`.**
- **Tests.** Eight unit tests for `useGhostPrompt`; browser tests for the
  ghost prompt (typing, Tab, typing over it, reduced motion), the rows (reason,
  active row, phone width, compact), the two-tone heading and the empty
  state's order.
- **Design.** Built from `designs/assistant-greeting/greeting.html`, section
  "As its own page".

## 2026-10-09 — Workflows: a table of workflows, foldable stages, richer steps

- **New recipe: Workflows table.** Every workflow in a tenant and where its
  live run stands, on the library's own `FilterBar`, `DataTable` and
  `Pagination` — none of the three changed. Status is the one filter: its three
  values are quick picks the moment the search field is focused, and it is in
  the Filters panel too. Sorting goes through `sortRows`. Opening a row shows
  who the run is waiting on and the run's shape. Ten mocked workflows; nothing
  on the page loads React Flow.
- **New component: `StageProgress`.** One segment per stage, sharing the width
  equally, so five stages and ten line up in a column. Filled for done and
  current, outlined for not reached; orange only when the run is waiting on a
  person.
- **New component: `FlowBlueprint`.** A run's whole shape with nothing to read:
  one bar per step, one column per lane, lines for what feeds what. Plain DOM
  and one SVG.
- **Any stage folds.** A folded stage is a narrow column of bars, one per step,
  coloured by status (new node: `FoldNode`). Fold from the eye on a lane header
  or the eye beside the stage in the run panel; unfold from either, or from the
  folded bars. A run of more than six stages opens with the stages away from the
  current one already folded, and a stage the run reaches is unfolded for you.
  New icons: `EyeIcon`, `EyeOffIcon`.
- **The Compact view and the Normal / Compact toggle are gone.** There is one
  view. `StageNode`, `buildStageNodes`, `buildStageEdges`, `StageLayout` and the
  `View` type are removed; `WorkflowCanvas` and `RunTopBar` no longer take
  `view`.
- **Steps can carry `content`:** facts, a decision's branches, section progress,
  the tools an agent called and a one-line note, drawn under the result line.
  Such a step is 248px wide, and its column is spaced by a computed height
  (`stepHeight`). Runs without content are placed exactly as before.
- **A sixth step kind, `flow`:** a step that runs another workflow and waits
  for it.
- **Run panel.** Given `recent`, it splits into Stages and Recent tabs; Recent
  is the new `RecentRuns` list, grouped by what each run needs. The user card at
  the bottom is removed, and so is the `actor` prop.
- **Theme switch.** Removed from the run page's bar and added to the platform
  shell's top bar, left of Notifications.
- **Wire protocol (additive).** `WireStep.content`, `StepPatch.content`, the
  `flow` step kind and the `rfp-response` variant id. `workflow-ws-server` needs
  the same additions before it can send them.
- **New fixture and stories.** "RFP response" is a ten-stage run with content
  on its steps, and a review whose inspector has the recommendation, the open
  risk and the trail. Stories for every new component.
- **Tests.** 19 new unit tests (layout, builders, the summaries fixture) and
  five new browser tests (four for the table, one for a folded stage). The
  stage-node tests went with the component.
- **Design.** Built from the "Workflow Agents to Live View" design canvas.

## 2026-10-08 — DataTable sorting by type, and FilterBar header and panel switches

- **FilterBar: `showHeader` and `showPanel`,** both `true` by default. `showHeader={false}`
  drops the search box and the Filters button; a panel that is still on becomes a
  docked rail that is always open, with nothing to close or pin. `showPanel={false}`
  drops the panel and its button, and the omnibox stays the way to filter, minus the
  quick picks' "Custom" range, which opened the panel. Both off draws only the table.
  New stories: `NoPanel`, `NoHeader`, `TableOnly`.
- **DataTable: sort by type.** A column says how its values compare with `sortType`:
  `text` (case-blind, "Suite 2" before "Suite 10"), `number` (88 before 412) or
  `date` (ISO strings, `Date`s and timestamps). New `sortRows(rows, sort, columns)`
  orders rows in the browser by those types. A row with no value goes last either way,
  equal rows keep their order, and `sortValue` reads a derived value.
- **DataTable: turning sorting off.** `sortable: false` on a column keeps its `sortKey`
  but takes it out: no button, no arrows, never in a request. `sortable={false}` on the
  table turns every column off. A sort in the host's state that names a column that is
  off is ignored.
- **A request that cannot fail on a field the backend does not support.**
  `toSortParam(sort, columns)` writes the `sort=` value from enabled columns only and
  returns `undefined` when none is sorted, so the call is made with no `sort` rather
  than a bad one. `isColumnSortable` is exported too.
- **Fixes the tests found.** The twelve-column test table lost the end of "Duration" and
  "Priority" once sort arrows took room, so they are wider. The Tenants recipe sorts with
  `sortRows` and its Created column is typed as a date.
- **Tests.** 26 unit tests for the sort rules; 6 browser tests for sorting by type in
  `DataTable`, 5 for the switches and 4 for sorted columns in `FilterBar`, and 1 for the
  Tenants page; the cut-off checks now cover four more stories. 3 + 4 new stories.

## 2026-10-08 — FilterBar (new): one list of filters, three ways to see it

- **New component.** `FilterBar` is the toolbar above a table: a Filters button,
  the omnibox, and the panel the button opens. All three read one list of
  `fields` — the same list `FilterPanel` already took — so a filter set in one is
  set in all of them. The host still owns every value, the typed terms and the
  style.
- **Every filter is a chip in the omnibox,** dates included. A date chip names its
  field and the dates its preset stands for: `started: Last 90 days  Jul 11 – Oct 8,
2026`. Backspace in the empty field takes the last chip off, as before.
- **Typing suggests more than search.** "Search every field" and "Narrow to a
  field" still come first, so Enter does what it did. After them, matching dates
  and values: typing `renew` lists the Renewal presets, `30` lists every "30 days"
  by the date it belongs to. A value that starts with what you typed (`act` is
  Active) comes ahead of dates.
- **Two styles, one set of filters.** `simple` is the button, the panel and the
  suggestions. `advanced` adds quick picks to the omnibox: focus it while empty
  and get a row of presets per date and a row of values per small filter, a click
  apiece. Arrow keys walk them, Escape returns to the field. Switching never loses
  a filter. The style is the host's (`filterStyle`, `onFilterStyleChange`).
- **The pin stays.** The panel floats over the table or docks beside it, and
  `open` and `pinned` are separate, so the pin survives closing the panel. A docked
  panel taller than the screen scrolls by itself and follows you down the table.
- **FilterPanel** groups two or more `dateRange` fields under one "Dates" heading,
  as rows that say what each is set to, one open at a time. `presets` becomes a
  grid of toggles above the exact range, and `direction: 'future'` swaps in picks
  that look ahead ("Overdue", "Next 7 days") for a due or renewal date. New props:
  `footer`, `expandedDate`, `onExpandedDateChange`. The exact-range field drops its
  day-count badge in the panel: in a narrow rail it pushed the dates into an ellipsis.
- **Omnibox** chips wrap onto more lines instead of running off the edge, and a
  chip never grows past its field: a long one ends in an ellipsis and keeps its
  remove button. New props: `quick`, `shortcut` (⌘K or Ctrl+K actually focuses the
  field now), `onMenuChange`; chips take `removeLabel` and `title`. Clicking a
  field that kept focus after its menu was dismissed now reopens it.
- **Date presets.** `dateRangePresets()` gains "Last 90 days" and a `short` label
  on four picks (`7D`, `30D`, `90D`, `YTD`). New `upcomingRangePresets()` for dates
  that lie ahead. `formatRange` and `formatDisplay` are exported.
- **Tenants page** now uses `FilterBar`, with a Renewal date that looks ahead. Its
  columns are sized so every header and date fits beside a docked panel; before,
  headers read `ST…` and the last digit of a date was cut.
- **DataTable fix.** Its scroll box is now `relative`. The visually hidden
  "Actions" header was placed against the page, so a table wider than the screen
  made the whole page scroll sideways on a phone.
- **A way to find what is cut off.** `tests/layout.ts` walks a screen and reports
  anything hidden by a container, text chopped with no ellipsis, and anything off
  the edge of the page; `findTruncated` lists what an ellipsis shortens so a test
  can judge it (a cell may be, a column header may not). It is checked against
  pages with known faults in `tests/layout.e2e.ts`, then run on seven `FilterBar`
  stories at 1280, 820 and 390 px, each with the omnibox focused and while typing.
- **Tests.** 34 unit tests: 24 for the filter logic, 8 for the panel's date helpers, 2 for
  the new date presets.
  59 browser tests for `FilterBar`, 21 of them the cut-off checks across three
  widths; 5 that check the checker; 11 new ones for `Omnibox` and `FilterPanel`;
  8 for the Tenants page. 14 new stories.

## 2026-10-07 — PillList (new primitive): tags with a limit and a count

- **New primitive.** `PillList` draws `items` as pills on one line, shows `max`
  of them and folds the rest into a count. `max` runs from `0` (only the count)
  to `Infinity` (all of them). Tone, variant and size are the list's; an item
  can set its own tone and leading icon.
- **The count** reads `+12`, and `99+` once the hidden number passes
  `overflowCap` (99 by default), so a list of hundreds says "a lot" and never
  draws a four-digit pill. It is outlined beside soft tags and soft beside
  outlined ones, so it is never mistaken for a tag.
- **The hidden pills open on hover.** Hovering the list, focusing the count or
  tapping it opens them in a `HoverCard` — portalled, so a table cell's
  `overflow-hidden` cannot clip it. Hover and focus come from `useHoverCard`
  (stays open under the pointer, Escape closes). A tap pins the card open until
  a press elsewhere or Escape, since touch has no hover.
- **Narrow cells.** The list stays on one line. Pills give up width before the
  count does, to a floor of three rem each, so a long tag truncates and the
  count stays inside its cell.
- **Accessibility.** A real `<ul>`; the count is a button named "N more" with
  `aria-expanded`, and the hidden labels are its description when they are plain
  text. `label`, `overflowLabel` and `empty` are props.
- **Tests.** Eight browser tests; six stories.

## 2026-10-07 — DataTable: no expand caret, outlined pills, quieter rows

- **The expand caret is gone.** Its column went with it, and so did the squeeze
  it put on the last data column. The name is still the real button with
  `aria-expanded`. An open row now has a rail down its edge and a filled
  `Avatar`; a closed row underlines whatever its first cell marks
  `data-row-title` on hover and keyboard focus.
- **Sort shows a pair of arrows.** On the sorted column the arrow for its
  direction is dark and the other is slightly grey; other sortable columns show
  the pair, grey, on hover. New icon: `ArrowUpIcon`.
- **Row actions show when wanted:** on hover, on keyboard focus, on an open row
  and on a selected row, and always on touch. The "Actions" header label is now
  screen-reader-only. New prop `actionsWidth` (default `128px`) sizes the
  column, so it no longer splits the leftover width with an unsized column.
- **Rows that span the table follow the visible columns.** The open panel, the
  empty state and the loading rows used to count columns that `hideBelow` had
  hidden, which left the header band short of the frame. The skeleton now hides
  the same columns the header does.
- **The open panel** sits on the canvas tone and starts at the table's left
  edge, not at a fixed 64 px.
- **Status pills in the tenants stories and both tenants pages** are
  `variant="outline" size="sm"`. `Pill` itself is unchanged.
- **`Avatar`** renders a `data-avatar` attribute so a container can restyle it.
- **Tests.** Four new browser tests: no caret column, hover/focus/open actions,
  the arrow pair, and the outlined pill.
- **The Tenants page's Spaces column is a `PillList`:** two spaces as pills and
  the rest behind a count, instead of one comma-joined line.
- **Design.** `designs/data-table/data-table-no-caret.html` is the mockup this
  was built from.

## 2026-10-07 — Chat history page and LoadMore

- **Recipes / Chat history page.** Conversation cards (a title, when it was
  last updated, when it was created) fetched a page at a time as the reader
  scrolls. Stories cover a slow connection, a page that fails once, an
  unreachable service, an empty history, a single short page and
  button-only loading.
- **Search and a date filter on that page.** A `SearchField` searches titles
  across the whole history, sent 300ms after typing stops or at once on Enter.
  `Tabs` in the `segmented` variant choose when a conversation was last
  updated: any time, the last 7 days, the last 14 days, or a custom range,
  which reveals a `DateRangeField`. Both are part of the request, so they
  restart the list from page one and an answer to an earlier query is
  discarded. The bar stays in reach while the list scrolls, and changing it
  returns to the top.
- **Components / LoadMore.** The tail of a list that grows. It reports that
  the end is near through `onLoadMore` and draws the four states of that end:
  more to come, a page in flight, a failure with Retry, the end. Loading starts
  `lead` pixels early and works inside any scroll container. The button stays
  while more exists, so a keyboard or a browser without the observer can still
  load; a failure is never retried by scrolling.
- **`useInfinitePages`**, beside the recipe, is the host half: one request at a
  time, a failed page asked for again rather than skipped, and rows already
  shown dropped when the list shifts between requests. It reads the existing
  `Page<T>`, so the simulated endpoint answers in the Django envelope through
  `djangoPageAdapter`.
- **Fixture.** `fixtures/platform/chatHistory.ts` holds sixty conversations
  with created and updated timestamps, relative to the day it is loaded.

## 2026-10-07 — ReferencePanel: open the original in a pop-up

- **`popOut`.** An optional button beside the Excerpt / Original switch opens
  the source's original in a dialog — the existing `Modal`, with its expand
  button, so it can take most of the window. Off by default; it needs
  `renderOriginal` and shows only on a source that has an original. It is
  offered from the excerpt as well as the original.
- **The dialog has its own zoom and page count.** Zooming it leaves the panel
  as it was, and each opening starts at 100%. Escape closes the dialog alone;
  arrow keys in it do not reach the panel.
- **Whatever `renderOriginal` draws works in it** — PDF, Word, a deck, or an
  article — since the dialog calls the same function.
- **New icon.** `PopOutIcon`.
- **Inside the panel.** The zoom stepper and the per-source view state moved
  into `zoom-controls/` and `useOriginalView.ts` so the panel and the dialog
  share them. No change to the panel's behaviour.
- **Full chat app.** Both of its panels turn `popOut` on.
- **Tests.** Five browser tests; new story `WithPopOut`.

## 2026-10-07 — ArticlePreview (experimental): a knowledge article drawn from its fields

- **Experimental.** It has been drawn from sample data only, and the Salesforce
  mapping is written from documentation, never run against a real org. Props,
  the `Article` shape and the field kinds may change without a deprecation
  step. The code says so where it is exported.
- **New component.** `ArticlePreview` draws a knowledge article — a record,
  not a file — as a sheet: title, number, version and publish date, then each
  field under its label in the article's own order. Short facts share a grid;
  a passage or rich text takes the full width. It takes an `Article` as data
  and fetches nothing. `zoom`, `showEmpty`, `formatDate` and `labels` are props.
- **Field kinds.** `text`, `richText`, `boolean`, `date`, `dateTime` and
  `link`. A field with no kind, or one this version doesn't know, is read for
  what its value holds — HTML, a lone URL, or text — so a field type nobody
  planned for still shows.
- **Rich text is sanitised** with DOMPurify (already a dependency): scripts,
  handlers, `javascript:` addresses, frames, style sheets and form controls are
  dropped, an inline `position` is removed, and links open in a new tab. Inline
  colour and alignment are kept. The sheet is white in both colour modes, as a
  PDF page is, because an author's colours assume a light page.
- **`articleFromSalesforce`.** Maps a Salesforce Knowledge response
  (`GET …/support/knowledgeArticles/{id}`) onto `Article`. Built from
  Salesforce's documented shape, not from a real org: the documentation doesn't
  list the field `type` values, so only `CHECKBOX` and date types are mapped by
  name and everything else is left to the preview to read.
- **Not handled here.** Images in Salesforce rich text need a Salesforce
  session; a backend has to fetch them and rewrite each `src`. File fields are
  dropped, since the API sends no value for them.
- **Sample file.** `public/docs/sample.article.json`, at
  `/docs/sample.article.json`, beside the sample PDF, Word file and deck.
- **Full chat app.** The first reference of the second canned answer is a
  knowledge article; its Original view fetches the sample file and draws it.
  The fetching lives in the recipe (`article-original.tsx`), as it would in an
  app.
- **Tests.** 35 unit tests (the sanitiser, the Salesforce mapping, the
  component) and 12 browser tests.

## 2026-10-07 — DocumentPreview draws PowerPoint decks; sample files by URL

- **`kind: 'pptx'`.** A deck is drawn as a column of slides, fitted to the
  panel's width and multiplied by `zoom`, with the same sheets and spacing as a
  PDF. Slides are HTML and SVG, so text stays selectable and sharp at any zoom.
  `onLoad` reports the slide count as `pageCount` and `onPageChange` the slide
  in view. `documentKindOf` reads `PPTX`, the MIME type and `.pptx`.
- **New dependency: `@aiden0z/pptx-renderer`** (Apache-2.0). Like the other two
  renderers it loads only when a deck is first opened. It brings ECharts with
  it for charts, so that chunk is the largest of the three.
- **Only slides near the view are mounted,** and a slide's shapes and pictures
  are parsed when it is first drawn. Zip limits are applied on open.
- **Not drawn.** Animations, transitions, speaker notes, and EMF pictures that
  carry only a PDF preview. Fonts the browser doesn't have fall back, so line
  breaks can differ from PowerPoint. Links on shapes and jumps between slides do nothing;
  links in text open in a new tab.
- **PDF layout is shared.** The page column — sizing, windowing, keeping the
  reader's place through a zoom or resize — moved out of the PDF renderer into
  `page-column.tsx`, and the deck renderer uses the same one. No change to how
  a PDF behaves.
- **Sample files.** `public/docs/sample.pdf`, `sample.docx` and `sample.pptx`
  are served at `/docs/sample.*` (Storybook `staticDirs`). Replace a file with
  a real one of the same name to preview it. New stories `Pptx`,
  `SamplePdfFile`, `SampleDocxFile`, `SamplePptxFile` and `MissingFile`.
- **Canned chat.** Reference 5 of the first canned answer is now the sample
  deck, so the full chat app shows all three formats. The PDF and Word
  references there had pointed at `/docs/…` files Storybook didn't serve; they
  load now.
- **Seen, not changed.** The reference panel's counter reads "Page 2 of 5" for
  a deck as well; it has no way yet to know the unit is a slide.
- **Tests.** Five browser tests for the deck, the sample URLs and a missing
  file, and unit tests for `documentKindOf`.

## 2026-10-05 — Consumer configuration and complete search focus outlines

- **FacetFilters controls.** Hosts can hide search, active chips, totals, row
  counts, reset/clear actions, bulk selection, unavailable-option controls,
  selection hints, and loading helpers. Zero-count row visibility is separate
  from toggle visibility; groups can override the panel defaults.
- **Configurable presentation and copy.** Density limits, chip budgets, lookup
  debounce, count/name formatters, and helper labels are optional props.
  Loading cost warnings now come from the host rather than a fixed byte estimate.
- **Focus.** Facet searches use inset outlines that stay visible in scrolling
  panels. SearchField marks its shell; TextInput offers an inset focus ring.
- **Other library surfaces.** Optional labels, calendar locales/formatters,
  panel/popover widths, Card keyboard movement, and controlled ThemeToggle
  state/storage make the existing defaults replaceable. Undefined optional
  overrides retain defaults.
- **FilterPanel preserves multiple choice.** Large multi-select option sets
  scroll instead of silently switching to a single-choice select.
- **Controlled facet cleanup.** Reset reaches query/custom callbacks, read-only
  chips have no inert remove buttons, and two mounted panels have unique IDs.
- **Documentation and coverage.** Docs/Configuration, MinimalControls and
  ConsumerConfigured stories, consumer behavior tests, and four light/dark
  focused-search snapshots document and verify the API.

## 2026-10-05 — FacetFilters at 3,000–10,000 values

- **Long lists are virtualized.** Above 40 rows a group mounts only its scroll
  window, in both list and lookup mode, using `@tanstack/react-virtual` (a new
  dependency). Holding 10,000 options in memory no longer means 10,000 rows in
  the page.
- **A fully loaded group stays a local list, whatever its size.** Cardinality
  no longer switches a group to lookup. Lookup is chosen with `mode: 'lookup'`
  or by passing paging metadata (`loaded`, `matchCount`, `hasMore`).
  `FACET_LOOKUP_THRESHOLD` is deprecated and kept for existing hosts.
- **Rows keep the host's order.** Selecting a value or refreshing counts no
  longer moves rows, so selected values do not jump to the top.
- **Active filters hold their height.** The chip region is a fixed, scrolling
  area. A group's summary expands to at most 20 chips and the whole region to
  100; these are display limits and never truncate the selection.
- **Bulk selection is capped in every group.** `selectAllCap` (500) now
  applies to local groups as well as remote ones. A larger search offers
  "Filter by this search instead" when the host supplies `onAddQuery`.
- **Keyboard.** A virtual list is one tab stop: arrows, Page Up/Down and
  Home/End move through every option, including rows not currently mounted.
- **New stories.** `Local3000`, `Local10000`, `Compact10000`,
  `ThousandSelected` and `SixAccounts`.
- **Tests and notes.** `facet-scale.e2e.ts` (eight browser tests, four
  screenshots), `useFacetRows.test.tsx`, and a README in the module folder
  describing the contract for hosts.

## 2026-10-05 — Chat recipes over a simulated network

- **New stories.** The chat recipes can now stream over the real WebSocket
  responder with no server behind it. `Chat/Recipes/Conversation` gains
  `Healthy server`, `Slow connection`, `Server unreachable`, `Retry succeeds`
  and `Connection drops`; the full chat app, the chat page in the shell and the
  widget on a host page gain two each. Every one has a `network` control.
- **Tool calls in a recipe.** On a healthy server, asking about the "market"
  runs three tool calls; "quote", "degraded" and "error" show a failed tool, an
  answer with reported problems, and a server that gives up. The canned
  responder never sent tool events, so recipes had not shown them before.
- **`createWsResponder(url, connect?)`.** The responder takes the function
  that opens its socket. It defaults to the browser's `WebSocket`; the stories
  pass a simulated server, and an app can pass its own to add auth.
- **Recipes take a responder.** `Chat`, the full app, and the widget's `init`
  accept `responder`; without one they stream the canned turns as before.
- **Tests.** 16 browser tests across the four recipes, and 11 unit tests for
  the WebSocket responder.
- **Seen, not changed.** When the server closes mid-answer without an error,
  the client ends the turn as though it were complete: the cut-off answer gets
  the usual actions and no Retry. And the "server not reachable" message tells
  the reader to run `npm run dev` in chat-ws-server, which is advice for this
  demo rather than for an app's users.

## 2026-10-05 — Unit tests with Vitest; browser tests renamed to `.e2e.ts`

- **Renamed.** The Playwright tests are now `<name>.e2e.ts` (were
  `<name>.spec.ts`), and their scripts are `npm run test:e2e`,
  `test:e2e:components`, `test:e2e:stories` and `test:e2e:ui`.
- **`npm test` now runs the unit tests.** Vitest in jsdom, with Testing
  Library. It picks up `src/**/*.test.{ts,tsx}` only, and Playwright picks up
  `*.e2e.ts` only, so neither runs the other's files.
- **First ten unit-test files, 177 tests.** Button, Switch, Tabs, Link and
  Pagination as components; `pageWindow`, the date field's `date-text`,
  `facetRules`, the diff viewer's `diff`, and the workflow `runReducer` as
  logic.
- **Fixed — DocumentPreview.** A PDF never left "Loading the original
  document": the viewer suspended to a boundary above the component, which
  threw the file away and started the load again, forever. It no longer
  suspends, so a PDF draws, and scrolling to a later page no longer blanks the
  document. The test that was marked `fixme` now runs, with two more beside it.
- **Fixed — FacetFilters.** A group's label was made singular by dropping one
  trailing "s", so "Categories" and "Status" came out as "categorie" and
  "statu". That showed in two places: the default "No …" row of a nullable
  group, and the note under a fully ticked group ("Items with no categorie stay
  excluded"). Both now read "category" and "status". A label the rules still
  get wrong takes `nullLabel`.

## 2026-10-05 — Tests for every component, and at least three stories each

- **Playwright tests.** Every component has a browser test beside it that
  drives its stories: 115 files, 518 tests. A whole-library test adds a render
  check for every story and fails if a component has fewer than three. (Since
  renamed; see the entry above for the file names and scripts.)
- **Stories.** 122 new stories across the 49 components that had one or two.
  Storybook goes from 456 stories to 578. No existing story changed.
- **Fixed — DateField.** With reduced motion on, opening the calendar a second
  time left focus on its button, where Escape is not handled, so the calendar
  could not be closed from the keyboard. The popover is now hidden with opacity
  rather than `visibility` until it is placed, so it can take focus at once.
- **Known, not fixed — DocumentPreview.** The PDF path never finishes loading
  in Storybook; its test is marked `fixme`. The Word path is fine. (Fixed in
  the entry above.)

## 2026-10-05 — Prepare the completed library for review

- Organized the generic public exports by tier and exposed the missing workflow
  canvas prop types, keeping recipe helpers outside the package entry points.
- Normalized cross-module workflow imports to module barrels while preserving
  the canvas kit's separation from the run engine.
- Updated workflow documentation to the package API, current paths, notification
  tokens, static recipe behavior, and tablet panels. Documented Card's muted
  default and explicit warning tone.
- Retired the completed migration handoff; maintained usage and validation live
  in the README, contracts, workflow docs, and release notes.

## 2026-10-04 — Apply the selected muted Card icon

- Card now uses the shared IconTile with a soft neutral background and muted
  glyph by default. Its 34px icon tile, spacing, and other styling are preserved.
- Added `Card.iconTone="warning"` for an explicit caution, using the existing gold
  foreground and tinted surface tokens. Warnings still need meaningful text.
- Added muted/warning IconTile stories and a warning Card story. The comparison
  now shows the applied treatment alongside its previous look and a plain option.

## 2026-10-04 — Retire the old catalog and add workflow fixtures

- Removed the legacy library packages, Storybook workspace, and duplicate app
  stories from `chat-interfaces`. Its catalog and tablet commands forward to this
  package; the demo and widget build using this sole library dependency.
- Added nine static incident-triage and employee-onboarding recipe states from the
  authored mock API scripts. Human approvals, declined branches, restart, and
  verification retry remain interactive; machine work completes immediately.
- Added `test:static-workflows` to verify both onboarding approval orders, decline
  handling, incident decisions, and resuming failed/retrying verification.
- Added a review-only Card icon comparison without changing the Card primitive.
- The local file dependency remains by the owner's choice; no changes were pushed.

## 2026-10-04 — Complete the reusable library migration

- Finished shared platform chrome, fixtures, state stories, and public exports.
- Added skeleton, empty state, icon tile, square avatars, status dot, orb,
  search field, segmented control, description list, stat tile, keyboard hint,
  stepper, page header, record list, side dialog, and slide-over modules.
- Added three platform recipes, the workflow canvas/panels/run engine and static
  loan fixture, and controlled conversation/chat-menu/greeting components.
- Added full chat, embedded chat/workflow, widget, settings, loading, unavailable,
  and runs-list recipes. Stories use static responders without a server.
- The demo app now consumes this package locally. React runtime and React types
  are resolved consistently across the file-linked package.
- Intended visual changes: platform pill actions use Button/ButtonLink; Home's
  activity filter uses SegmentedControl; the chat account pop-up shares the
  platform account menu. The Card icon remains unchanged pending an owner choice.
- Uppercase labels that differ in size/weight, bespoke popover positioning in
  Tooltip/HoverCard/DatePopover, and differing Card/Modal icon tiles remain separate.
- Screenshot capture now isolates storage per story, avoiding cross-story state.

## Initial library move and earlier history

### Moved — everything

The library now lives in `ai-platform-lib`, a single package with one
Storybook. It was three packages (`@chat/tokens`, `@chat/ui`, `@chat/chat-ui`)
and a Storybook app inside `chat-interfaces`. Nothing was restyled in the move:
every story was screenshotted before and after and compared.

- **Layout.** `brand/` (was `packages/tokens`), `src/primitives/` and
  `src/components/` (were `packages/ui/src/core` and `.../components`, re-sorted
  by what each module is), `src/chat/` (was `packages/chat-ui`),
  `src/workflows/` and `src/recipes/` (were inside the demo app).
- **Sidebar.** Titles follow the folders: `Primitives/…`, `Components/…`,
  `Recipes/…`, `Chat/Components/…`, `Chat/Recipes/…`, `Workflows/Components/…`,
  `Workflows/Recipes/…`. The old `Primitives/Core`, `Primitives/Components`,
  `Data Table` and `Recipes/Chat` groups are gone.
- **Imports.** `ai-platform-lib` (generic), `ai-platform-lib/chat`,
  `ai-platform-lib/workflows`. Stylesheets: `styles.css`, `chat.css`,
  `workflows.css`, `widget.css`, `brand/tokens.css`.
- **DocumentPreview** and **MermaidBlock** are generic components now; neither
  imported anything from chat.
- **Navigation** is removed. The side menu and pinned pages replace it.

Entries below this one were written before the move and name the old paths.

### Changed — Alert · Added — Notice

- **Alert** (`packages/ui/src/core/alert`): redrawn as the combined A + B
  direction from the "Alert & Card" canvas — a quiet panel with the tone in a
  tile around the glyph, and the action as a button in the tone's own colour
  (Retry in red, Review in amber). New `secondaryAction` (a tone-coloured text
  link) and `layout="inline"` for one-line page banners. `bordered` is
  deprecated and no longer drawn. New stories: _Actions_, _InlineBanner_,
  _Retry_ (with a `play` test); _Bordered_ is gone.
- **Notice** (`packages/ui/src/core/notice`, new): the one-line tinted band for
  message flows — the chat especially. A glyph, one line of copy, an optional
  `label` tag that names the state in words, one inline `action`, dismissible.
  **InlineTip** now renders a Notice. Stories: _Primitives / Core / Notice_,
  including _InConversation_.

### Changed — Card

- **Card** (`packages/ui/src/core/card`): redrawn as the _Open_ direction from
  the "Alert & Card" design canvas — no rules between parts, a brand-coloured
  `eyebrow` above a 17px title, and spacing doing the separating. New props:
  `eyebrow`, `description`, `icon` (in a tinted tile), `headerAction`,
  `footer` (pinned to the bottom edge), `headingLevel`, and `href`, which makes
  the whole card one native link that lifts on hover. The actions disclosure
  now opens under its own button. Existing `title` / `actions` / `draggable`
  usage is unchanged. New stories: _Anatomy_, _AsLink_ (with a `play` test),
  _EmptyState_, _WithFooterActions_, _Grid_.

### Changed — Tabs

- **Tabs** (`packages/ui/src/core/tabs`): `line`, still the default, is
  redrawn — a rounded 3px brand bar grows from the centre under the selected
  tab, and its label steps up to extra-bold without shifting its neighbours.
  Vertical lists put the bar on the leading edge. New `segmented` variant: a
  tinted track with the selected tab raised, for switching views of one thing.
  `contained` still works as a deprecated alias of `segmented`. Triggers take
  `icon` and `count`. Stories: _WithIconsAndCounts_ (with a `play` test),
  _Segmented_, _Vertical_, _VerticalSegmented_.

### Changed — DateField

- **DateField** (`packages/ui/src/core/date-field`): typed or picked. The field
  shows "Sep 30, 2026", accepts `Sep 30, 2026`, `9/30/2026` and `2026-09-30`,
  and names an impossible day ("February has 28 days in 2027"). The calendar
  button or Alt+↓ opens the branded `DatePicker` in a popover that escapes
  clipping containers and stays inside open dialogs; the calendar is loaded on
  first open. `DateRangeField` picks both ends in one calendar, then Apply, and
  reads "Sep 6 – Sep 15, 2026 · 10 days". `presets` (`true` or your own list)
  swaps typing for quick picks and shows the matching pick as a chip — for
  narrow spaces like the FilterPanel rail, whose date fields now pass it
  through. On phones the picks wrap above the calendar.
- **DatePicker**: the range header reads "Aug 31, 2026 → Sep 29, 2026" instead
  of ISO.

### Fixed — Pagination

- **Pagination** (`packages/ui/src/core/pagination`): a narrow footer no longer
  strands "Next" on a line of its own. The controls (Previous, the numbered
  rail, Next) now wrap as one group, and the footer is its own size container:
  below 28rem the numbered rail steps aside, leaving the readout and
  Previous/Next. New story: _Data Table / Pagination / NarrowContainer_.

### Added — Accordion

- **Accordion** (`packages/ui/src/core/accordion`): stacked show/hide sections
  drawn as a _parting list_ — closed items form one joined list, each row
  showing its current value (`summary`); opening one lifts it out as a raised
  card and the list parts around it. `rail` adds the chat's reasoning rail (a
  node per row, a line down the open item). `step` / `status` number items as
  a wizard's steps, and with `rail` the markers become the rail's nodes.
  Single or multiple, controlled or uncontrolled, disabled per item or whole.
  Same compound shape as `Tabs`; triggers sit in headings; ↑ ↓ Home End move
  between them; closed panels are `inert`. Styled by `accordion.css`, imported
  from `ui.css`. Chosen from three branded directions on the "Accordion
  directions" design canvas. Stories: _Primitives / Core / Accordion_,
  including a full setup _Wizard_ built from the other primitives.
- **MailIcon** added to the icon set.

### Added — Navigation

- **Primitives / Components / Navigation**: pinned destination rail, contextual
  section links, and a searchable All apps dialog with pin controls. Routing and
  persistence belong to the host; native links preserve modified-click behavior.
  Colocated stories cover the quick menu, empty pins, other sections, unpinned
  routes, narrow layouts, search and pin interactions, and no search results.

### Added — Card and DatePicker

- **Card** (`packages/ui/src/core/card`): a branded content surface with an
  optional action disclosure and an opt-in drag handle. The parent owns
  position and order; `onMoveStart` / `onMoveEnd(cancelled)` bracket a pointer
  gesture so a sortable list can commit on drop and cancel on Escape. Stories:
  _Primitives / Core / Card_ — Playground, WithActions, Draggable,
  SortableColumn, SortableVariableHeight.
- **DatePicker** (`packages/ui/src/core/date-picker`): an inline calendar on
  `react-datepicker`, skinned entirely by `date-picker.css` (the vendor sheet
  is not imported). Single or range, `commitMode="immediate" | "apply"`, same
  `YYYY-MM-DD` contract as `DateField`. New dependency: `react-datepicker@^9.1.0`
  in `@chat/ui`. Stories: _Primitives / Core / DatePicker_.

Both ship `play` interaction tests, as Navigation does; they run whenever the
story renders.

### Added — Storybook (`apps/storybook`)

- **One Storybook for the whole repo.** `npm run storybook` from the root, or
  `npm run start` inside `apps/storybook`. Storybook 10.6 on the Vite builder,
  with `@storybook/addon-docs` and `@storybook/addon-a11y`.
- **Stories live beside their modules.** Each module folder is now
  `index.ts` · `types.ts` · `<name>.tsx` · `<name>.stories.tsx`, with an optional
  `<name>.css`, `README.md` and story-only `<name>.example.tsx`. See
  _Docs / Module anatomy_.
- **Theme toolbar.** Mode, palette (`chat-theme-*`), highlight
  (`chat-highlight-*`) and density (`UiSizeProvider`), applied to `<html>` so
  portalled cards and dialogs follow.
- **Lazy per story.** Each story file is its own chunk, and the preview imports
  deep paths rather than package barrels, so `beautiful-mermaid` and
  `@xyflow/react` load only for the stories that use them.
- **Props tables from `types.ts`.** `react-docgen-typescript` reads each
  module's contract, limited to the props a module declares itself.
- **Handbook pages:** Introduction, Module anatomy, Theming, Contracts, and
  these notes.

### Stories

- **Primitives / Core** (21): Alert, Avatar, Breadcrumbs, Button +
  AdaptiveButton, Card, Checkbox, ChoiceCard, CodeEditor, DateField +
  DateRangeField, DatePicker, DiffViewer, Field (form composition), Modal, Pill,
  RadioGroup, Select, Slider, Switch, Tabs, TextInput, Textarea.
- **Primitives / Components** (15): CopyButton, CountBadge, FacetFilters,
  FilterChip, HoverCard, IconButton, Icons (searchable gallery), InlineTip,
  Navigation, ResizableColumn, ResizeHandle, ScrollToBottomButton, Settings
  (FeatureToggles, PalettePicker, HighlightPicker), SideTabs, Tooltip.
- **Data Table**: DataTable (sorting, selection + bulk bar, expansion, row
  actions, loading, empty, narrow), Pagination, FilterPanel (every field type,
  pinned and floating), Omnibox, the Paging model (MDX contract + adapter
  explorer), and the full Tenants page recipe.
- **Recipes / Chat**: every `@chat/chat-ui` component in each state its
  `Message` can take — thinking, streaming, recovered, stopped, failed, scoped —
  plus a live **Conversation** on `useChat` + a canned responder, the
  **ChatWidget** rendered in-page, the **Widget on a host page** (shadow root),
  and the **Full chat app**.
- **Recipes / Workflows**: the loan review run on React Flow, its skeleton,
  and the top bar and run log in each phase.

### Added — fixtures

- `packages/ui/src/__fixtures__/` — `code.ts`, `tenants.ts`, `facets.ts`.
- `packages/chat-ui/src/__fixtures__/chat.ts` — sources, highlights, tool
  calls, traces, messages, personas, suggestions and canned turns.

### Changed

- `InlineTip`'s `icon` JSDoc wraps `<BulbIcon />` in backticks — autodocs
  renders JSDoc as Markdown, and the bare tag rendered as an unknown element.
- `packages/ui` and `packages/chat-ui` tsconfigs exclude `*.stories.tsx`, as
  does `apps/chat`'s app tsconfig; `apps/storybook` typechecks all stories, so
  `npm run typecheck` still covers them.

### Known gaps

- `EditorOptionsMenu` and `FindReplaceBar` (new in `core/`) have no stories of
  their own; they are exercised through CodeEditor and DiffViewer (⋯ menu,
  ⌘F / ⌘H).
- Stories are not yet run in CI. `play` functions run in the browser when a
  story renders; `@storybook/addon-vitest` would run every story and `play`
  function headlessly on each push.
- No deployment is configured. `npm run build-storybook` writes a static site
  to `apps/storybook/storybook-static`.

---

## Template for the next entry

```md
## YYYY-MM-DD — short title

### Added | Changed | Fixed | Removed

- **Module** (`path/to/module`): what changed, from a consumer's point of view.
  Link the story: _Primitives / Core / Button → Adaptive_.
```
