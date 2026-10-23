# Workflow canvas — design notes

A multi-step agentic run with a human in the loop. The rules below are the ones
that are easy to break by accident; everything else follows the app's usual
tokens in [brand/tokens.css](../../brand/tokens.css).

For _what the demo does_ rather than why, see [Overview](./overview.md).

## Layout and boundaries

| Folder                                        | What it contains                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [components/](../../src/workflows/components) | The canvas kit and host panels: nodes, edges, zoom, run outline, inspector, lanes, and log |
| [engine/](../../src/workflows/engine)         | Wire types, placement, reducer, and run sources                                            |
| [fixtures/](../../src/workflows/fixtures)     | Authored loan, incident, onboarding, and story data                                        |
| [recipes/](../../src/workflows/recipes)       | Screen composition and fixture-only helpers                                                |

[WorkflowDemoPage.tsx](../../src/workflows/recipes/loan-review-run/loan-review-run.tsx) is composition and selection only;
[WorkflowCanvas.tsx](../../src/workflows/components/workflow-canvas/workflow-canvas.tsx) holds React Flow, because it is the
one part with a render budget worth keeping in view.

The canvas kit imports only React, React Flow, and shared library primitives.
Hosts consume it through `ai-platform-lib/workflows` — see
[Canvas](./canvas.md). The boundary is worth keeping: it is what stops
one example's content from settling into the components again.

The split has a rule behind it. A status **name** ("Queued") is kit vocabulary
and lives in `src/workflows/components/types.ts`; a **countdown** or an assignee is one run's
content and arrives on the step as `statusLabel` / `assignee`. Both were
hardcoded in the node components at first, which meant every waiting step in any
workflow claimed to be due in 3h 40m.

## Who does the work is an icon, not a colour

| Kind       | Icon            | Chip                           |
| ---------- | --------------- | ------------------------------ |
| `agent`    | the orb         | `bg-chip text-chip-fg`         |
| `human`    | initials avatar | `bg-brand-solid` — the loudest |
| `tool`     | plug            | neutral `bg-tint/12`           |
| `decision` | diamond         | outline only                   |
| `trigger`  | inbox           | `bg-chip`                      |

A person's step carries the solid chip because it is the one that stops the run.
The icons are also the only thing that survives the deepest zoom tier, so a
reader can still tell agent work from human work at 40%.

**Initials need rendered size, not authored size.** A node avatar is authored at
20px but drawn through React Flow's viewport transform, so at the detail tier's
0.7-1.0 zoom its text reaches the screen at 5-7px. Two letters also have to stay
inside the circle's inscribed square (diameter × 0.707) or they crowd the curve —
"DW" bold measures ~1.86× its font size, so the font is 0.36 × the diameter.
Below `INITIALS_MIN` in [KindIcon.tsx](../../src/workflows/components/kind-icon/kind-icon.tsx) the avatar falls back to a
filled person glyph, which reads at any scale; in practice only the details panel's
34px avatar keeps its letters. The name itself lives in the node's text and the
inspector, where there is room to read it. A _dashed_ outline person is something
else again: a step routed to a role rather than to someone in particular.

## Colour only ever means state

Orange (`--notify`) appears in exactly one situation: **a person is being waited
on**. Nothing decorative may use it.

Use `--on-notify` for text on the notification fill. The current
[brand tokens](../../brand/brand.css) pair white text with `#cb4a11`, clearing
4.5:1 contrast. Keep this pairing when changing a theme.

## Zoom: drop content, don't shrink text

At 60% zoom a 13.5px label renders at 8px. So each tier down drops content and
counter-scales what is left ([zoom.ts](../../src/workflows/components/zoom.ts)):

| Tier         | Zoom    | Shows                                          |
| ------------ | ------- | ---------------------------------------------- |
| `detail`     | 100–70% | everything, plus drag and the approval action  |
| `simplified` | 70–45%  | icon + title at 17px, status marker only       |
| `glyph`      | 45–30%  | icon + status marker, no text                  |
| floor        | 30%     | `minZoom` — below this even icons stop reading |

`useZoomTier()` returns the **bucket**, so a node re-renders when the tier
changes rather than on every frame of a pinch. Node components are `memo`'d.

Other things that come off with the tier: the edge dash animation (it repaints
every frame) and node dragging.

## Connection lines are contrast-checked

Measured against the lightest ground they cross (the tinted current-stage lane).
WCAG 2.2 SC 1.4.11 asks for 3:1, and these are meaningful graphics — the line
style is how the canvas says whether work has flowed through a connection.

| Line                 | Light     | Contrast |
| -------------------- | --------- | -------- |
| Done                 | `#0069aa` | 5.4:1    |
| Waiting on this step | `#004c97` | 7.8:1    |
| Not reached yet      | `#6e7882` | 4.15:1   |
| Skipped branch       | `#828b93` | 3.20:1   |

Solid, not translucent: an alpha stroke changed contrast depending on which lane
it crossed. Skipped stays the faintest by **dot density** (`0.1 7` vs `0.1 5`),
not by fading below the threshold. The dark values live beside the light ones in
[brand/tokens.css](../../brand/tokens.css), under `--workflow-edge-*`.
`EDGE_TOKENS` binds these variables for the canvas host.

## Any stage folds

There is one view. Every stage is drawn in full until it is folded, and a folded
stage is a narrow column of bars, one per step, coloured by that step's status.
A stage folds from the eye on its lane header or the eye beside it in the run
panel, and unfolds from either of those or from the folded node itself. There is
no mode to switch into: the Normal / Fold toggle this replaced only decided
whether those controls were visible.

Folding is what makes a long run readable, and it is the performance lever too.
A ten-stage run is three screens wide at the detail tier; zooming out to fit it
lands in the glyph tier, where nothing can be read. Folding the stages away from
where the run has got to keeps the ones that matter at full size, and replaces
the rest with one node each. A run of more than six stages therefore opens with
only the current stage and its two neighbours unfolded
([`defaultFolds`](../../src/workflows/recipes/loan-review-run/loan-review-run.tsx));
a shorter one opens with nothing folded.

Three rules that are easy to break:

- **Folding re-places the run.** A folded stage gives up its columns and
  everything to its right closes up, so a run with folds goes through
  [`foldRun`](../../src/workflows/engine/layout.ts) rather than having nodes
  hidden in place. It never moves a node vertically. A run with nothing folded
  skips this and keeps the positions it arrived with — which is what keeps the
  hand-placed loan run where it was put, until its first fold.
- **A fold is framed like a stage click, not like a new graph.** The node set
  changes, which flips `useNodesInitialized()`, but the whole-run fit is keyed on
  `epoch` and stays put. The canvas frames the stage that was toggled,
  from a `foldFocus` counter the page bumps only on a deliberate toggle.
- **The stage a run reaches is never left folded.** The page unfolds it without
  re-framing: a live run would otherwise walk off into a column of bars, and
  nobody asked for the viewport to move.

The old Compact view (one card per stage) is gone. Folding does its job — fewer
nodes on a long run — without changing what a step looks like.

## Steps can carry content

A step's `content` is the structured part under its result line: facts, a
decision's branches, section progress, the tools an agent called, a one-line
note. Unlike `detail`, which is opaque and belongs to the inspector, the node
draws `content` itself, so the layout has to be able to see it.

- **Height is computed, not measured.** React Flow only measures a node after it
  is placed, so [`stepHeight`](../../src/workflows/components/build.ts) adds up
  fixed line heights that match `StepNode`'s content block exactly. A column of
  plain steps keeps the 180px pitch; a column with content spreads by the extra
  height and keeps the same gap. Change one side and change the other.
- **Every content row truncates.** A row that wrapped would make the node taller
  than the layout allowed for and run it into the one below.
- **Status is not an input to height.** A waiting step grows by its approval
  row, but statuses change several times a second and positions must not.
- **Send the parts on the snapshot.** Values may arrive later in a patch, but a
  part that first appears in one makes the node taller than its space.

`flow` is a sixth step kind: a step that runs another workflow and waits for it.
It usually carries `progress`, counted in that workflow's stages.

## One menu, and a details panel that collapses

The run outline is not a panel of the page. It is a section of the platform's
side menu — the one menu every page uses — and the page adds it with
[`InSideMenu`](../../src/components/side-menu/slot.tsx): the stages and "Needs you"
under the destinations when the menu is expanded, the stage markers and a badge
when it is folded to its rail. It is a portal, so the outline keeps the page's
state and callbacks while it is drawn in the menu. The menu's own button
expands and folds it; the page has no control for that.

The details panel closes from its X or from the toggle in the top bar, and
reopens whenever a step is selected — choosing a step is a request to look at it.
At desktop widths it animates width rather than unmounting, so the canvas reflows
and React Flow re-measures as it moves. The wrapper carries a negative margin
when closed, otherwise the flex gap leaves a 16px dent where the panel used to be.

Below 1280px the recipe opens the details in a modal instead, and the shell
starts its menu as a rail so the canvas keeps its width. Controls stay in the
viewport, and closing restores trigger focus.

## The top bar sheds content in order

It is a `@container`, not a viewport query: the bar sits in a column only ~700px
wide on a 1440 screen, so a viewport breakpoint never fires and the bar overflows
the panel. As the column narrows it drops the breadcrumb, then the status pill's
words, then the pill, then Run log and Pause — and only then does the title
truncate. The details toggle is never dropped: a narrow window is exactly when
someone wants that 400px back.

## Loading

The [loading recipe](../../src/workflows/recipes/loading-skeleton/loading-skeleton.tsx)
draws the same three-panel shell so the layout doesn't jump, and uses the library's
own motion (`animate-orb-drift`, `shimmer-text`, `animate-fade-up`).

## Steps have inputs and outputs

A step's `io` says what it reads and what it produces, as typed fields. An
input names its source: an output of an earlier step, or one of the run's own
inputs. The step panels show both, with this run's values, in
[`StepInputsOutputs`](../../src/workflows/components/step-inputs-outputs).

- **Values are stored once, on outputs.** An input never carries a value. The
  client reads it off the source's output, and only once the source step is
  `done` or `approved` — [`resolveStepIO`](../../src/workflows/engine/io.ts).
  So a run cannot show an input that disagrees with the output it came from,
  and "Not ready yet" is not something a server can forget to clear.
- **Status decides what shows, not the value's presence.** An output of a step
  sent back for changes may still hold last time's value; it reads "Sent back
  for changes" all the same. Every status has its own pending word, in one
  table (`PENDING_OUTPUT`).
- **I/O stays off the canvas.** It sits beside the steps on `RunGraph.io`, not
  on the seeds: the seeds are the kit's type and the kit never reads I/O, and
  an `io`-only patch leaves `steps` alone so nothing on the canvas rebuilds. It
  cannot change a node's size, so the layout never has to see it.
- **Wiring is checked, not trusted.** [`validateIO`](../../src/workflows/engine/io.ts)
  reports every input whose source step is unknown, does not come before it
  along the edges, or does not declare that output — and every run input that
  is not declared. The fixtures' tests run it over all four runs.

A run declares its own inputs (required or optional, typed) and outputs (with
where each goes). They ride on `VariantInfo`, so the start form —
[`StartRunDialog`](../../src/workflows/components/start-run-dialog) around
[`RunInputsForm`](../../src/workflows/components/run-inputs-form) — can be drawn
before a run exists. Each type picks its field: a date gets `DateField`, a
choice or a person a `Select`, a list a `Textarea`, a file its name. Errors wait
for the first attempt to start, and submit stays enabled so that pressing it is
how a reader finds out what is missing.

## The source seam

The page holds no run content. It takes a `RunSource` and draws whatever comes
out of it — the same shape `Responder` gives the chat demo in
[chatEngine.ts](../../src/chat/engine/chatEngine.ts) in `ai-platform-lib/chat`.

| Source                    | Connection                  |
| ------------------------- | --------------------------- |
| `createStaticRunSource()` | None; authored loan fixture |
| `createWsRunSource(url)`  | Host-supplied WebSocket URL |

A source pushes `RunEvent`s at a pure reducer ([runReducer.ts](../../src/workflows/engine/runReducer.ts)).
Two of its rules are there for performance and are easy to undo by accident:

- **`statuses` keeps its object identity when a patch changes no status.** The
  canvas memoises its whole node and edge build on that object, and most patches
  during a live run are meta- or detail-only. Returning a fresh map each time
  rebuilds the graph several times a second for no visible change.
- **`graph.epoch` moves only on a snapshot**, and `fitView` keys on it. Refitting
  whenever the node data changes would pan the canvas out from under the reader
  while they read.

The graph also arrives **whole**, with steps that will never run already at
`skipped` — the way `senior` has always shipped. A node set that changes mid-run
flips React Flow's `useNodesInitialized()` back to false and re-frames the
viewport. Only a snapshot may change it.

### Two things the wire cannot carry

`EdgeSeed.state` is a _function_, so only the rule crosses (`'feeds'` / `'never'`)
and [wsRunSource.ts](../../src/workflows/engine/wsRunSource.ts) rehydrates it through the kit's own
`feeds()` and `never`. And steps travel as `{column, row}` rather than pixels;
[layout.ts](../../src/workflows/engine/layout.ts) derives x and y.

That layout lives in `engine/`, outside the canvas kit, on purpose: the kit's contract is
"you provide steps with x/y", and this is the thing that provides them.

**The derived positions are not the authored ones.** Fed the loan run's columns,
`placeRun` reproduces its x exactly — `0/300/600/900/1174/1474`, gate narrowing
included — but its y centres each column on an axis, where the authored values
were tuned per node. So the authored loan fixture and the wire-derived layout are not
pixel-identical, and the static source bypasses `placeRun` altogether to keep the
hand-placed run exactly as it was.

### A person is asked, not told

Which gate is open is **state**, not only the `run.awaiting` event: it rides on
every snapshot. A client attaching to a run that is already waiting has no other
way to learn what that step will accept, and would otherwise draw buttons for a
decision the server will refuse.

Nothing keys on a step _id_ any more. "Needs you" is every step at `waiting`,
because a run can stop on two approvals at once — the onboarding variant does,
and the old single hardcoded card made the second one invisible. For the same
reason the outline's stage list is the part that scrolls and "Needs you" is the
part that doesn't.

## Written once

Four things were duplicated across this section and the pages around it, and each
is the kind that drifts silently — one copy ends up semibold, or 10px, or keeps
an old gradient:

| Now in                                                                                              | Was                                                                             |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [AmbientGlow](../../src/primitives/ambient-glow/ambient-glow.tsx)                                   | Four byte-identical copies across the demo pages                                |
| [SectionLabel](../../src/primitives/section-label/section-label.tsx)                                | The small-caps heading, written out five times                                  |
| [CollapsiblePanel](../../src/components/collapsible-panel/collapsible-panel.tsx)                    | The width-animating wrapper, with the explanation only on one                   |
| `DECISION_BUTTON` in [DecisionForm](../../src/workflows/components/decision-form/decision-form.tsx) | Three near-identical buttons whose alignment depended on which siblings existed |

That last one is worth a note: a gate offers a _subset_ of the three answers, so
the buttons now come off a table and a spacer does the alignment. No button has
to know which of its siblings rendered.

## Picking a stage

A stage is selectable from two places — the outline in the platform menu and the lane
header on the canvas — and both do the same thing: highlight it, show it in the
details panel, and frame it on the canvas. (A folded stage's header and node do
something else: they unfold it.)

Two facts about a stage look similar and must not be drawn alike. `current` is
where the _run_ has got to; `selected` is where the _reader_ is looking. The
reader's own choice is the louder of the two, and both can be true at once.

**Highlight follows the selection; framing does not.** `selectedStageId` also
moves when a step is selected, so the canvas always agrees with the panel — and a
live run selects steps by itself when it reaches a gate. If framing keyed on that
id, the viewport would jump while you were reading something else. So framing
keys on `stageFocusSeq`, a counter the page bumps only on a deliberate stage
click.

### Two fits that used to fight

The canvas frames in two situations, and getting them to coexist took three
attempts, so the rules are worth writing down:

| Fit           | Fires on                  | Records       |
| ------------- | ------------------------- | ------------- |
| The whole run | `epoch` or `view` changes | `framedShape` |
| One stage     | `stageFocusSeq` changes   | `framedSeq`   |

`useNodesInitialized()` flips back to **false every time the node objects are
rebuilt** — which a live run does several times a second. It is therefore a gate,
never a trigger: keyed on it directly, the whole-run fit re-fired about 40ms
after every stage fit and quietly undid it.

The whole-run fit records its shape **when a fit resolves true**, not when one is
asked for, and deliberately does not cancel that callback when the effect re-runs.
A fit into a pane with no width yet — how the live route starts, since the graph
arrives after the first paint — resolves false, and claiming the shape up front
would make that wasted attempt the only one. Cancelling on re-run has the
opposite failure: the callback never lands, so the shape is never recorded and
the run is re-framed forever.

The node memo is also **split in two**: one for a run with nothing folded, one
for a run with folds. The first is drawn exactly where it was placed and must
not pay for, or be moved by, the re-placement that folding needs.

## The run log

A drawer under the canvas rather than a third column, so a line arriving and the
node it names changing colour are one glance apart. It animates height rather
than unmounting, like both side panels, so React Flow re-measures as it moves.

Two things to know: while closed the container is zero-height, so the
`ResizeObserver` behind `useStickToBottom` never fires and the list would open
scrolled to its oldest line — hence the `scrollToBottom()` on open. And rows key
on `entry.id`, never the index, because the 500-line cap drops from the head.

Log levels are carried by a dot and, for a failure, by the text colour. No
notification orange: `--notify` is reserved for waiting on a person. Using it
for log levels would blur that meaning.
