# Workflows

A multi-step agentic run on a React Flow canvas, with a human in the loop.
Reusable components and the run engine are exported from
`ai-platform-lib/workflows`. The complete screens are Storybook recipes; they
show how a host composes the components and supplies a `RunSource`.

For the component contracts and a minimal canvas host, see [Canvas](./canvas.md).
For the rendering, selection, and source boundaries, see [Design](./design.md).

## What the recipes demonstrate

- **Follow a run.** Steps move through `queued → running → done`, stages tick
  over, and node result lines fill in as work finishes.
- **Read the run log.** A drawer under the canvas shows the source's events.
  Rows naming a step select it.
- **Pick a stage.** The outline and the lane headers both select a stage, show its summary, and frame it on the canvas.
- **Answer a gate.** Waiting steps appear in "Needs you". The inspector shows
  the decisions that the source accepts and records the answer and note.
- **Control the run.** Pause, resume, and restart are source operations.
- **Fold stages.** Any stage folds to a column of status bars, from its lane
  header, its folded node, or the eye beside it in the outline. A run of more
  than six stages opens with the ones away from the current stage already
  folded. Nodes also drop content as zoom decreases.
- **Change run.** Given a list of other runs, the outline gains a Recent tab.
- **Use a tablet.** Below 1280px, the outline and inspector open as modal panels
  so the canvas keeps its width.

## Sources

A source pushes `RunEvent`s into the reducer and implements decisions and run
controls. Production hosts supply their own source or use
`createWsRunSource(url)` for the existing wire protocol. The socket connection,
URL, and app routing belong to the host.

`createStaticRunSource()` supplies the authored loan run without a server. The
loan, loading, unavailable, runs-list, and run detail recipes show the
surrounding screen states. The sibling `chat-interfaces` demo uses this library for its
`/workflow-demo` and `/workflow-live` routes; those routes are not library APIs.

## Inputs and outputs

Every step can declare `io`: inputs that name where they come from (an earlier
step's output, or the run's own inputs) and typed outputs that carry a value
once produced. A workflow declares its start inputs and its outputs on
`VariantInfo`; `run.start` carries the values the start form collected, and a
snapshot restates them as `WireRun.inputs`.

| Addition                          | Where                                                     |
| --------------------------------- | --------------------------------------------------------- |
| `WireStep.io`, `StepPatch.io`     | A step's inputs and outputs; a whole replacement on patch |
| `WireRun.inputs`                  | The values the run was started with                       |
| `VariantInfo.inputs` / `.outputs` | The start form's fields, and what the run hands back      |
| `run.start` `inputs`              | The start form's values, by input name                    |
| `run.error` `MISSING_INPUT`       | A required input was empty; `INVALID_INPUT` if unreadable |

All of it is optional on read, so a server without it still works: no `io`
means no I/O block, and no inputs means a workflow starts without a form.
**These are wire changes:** `workflow-ws-server/src/types.ts` and
`chat-workflow-mock-api` need the same types before they send any of it.

## The static loan review recipe

| Recipe      | Run                       | What it demonstrates                                                         |
| ----------- | ------------------------- | ---------------------------------------------------------------------------- |
| Loan review | Commercial loan, 12 steps | A three-way fan-out and a gate offering approve, request changes, or decline |

It is the one worked example, and it needs no sibling checkout or server.
Machine work completes immediately, keeping the story deterministic; the human
approval stays interactive.

Run `npm run test:static-workflows` after `npm run build-storybook` to check that
approval, and `npm run test:tablet-workflow` for the tablet and desktop layout.

## The workflow detail page

The runs list shows every workflow at a glance; the workflow detail recipe is
the page behind one of them. A row's **Workflow details** opens it, and the
row's **Open live view** still goes to the live page.

The page is a header (name, purpose, Edit workflow, Start a run, the facts that
identify it, and a banner that opens the run in progress; it is part of the
recipe, not a component) over three tabs:

- **Overview** shows how every run is built (`WorkflowShape`, a blueprint with
  numbered lanes; a step that only runs sometimes is dashed), what a run needs to
  start and hands back (`RunContract`), what each stage does
  (`WorkflowStageList`, each stage opening to one `WorkflowStepCard` per step),
  and three cards beside them (`WorkflowApprovers`, `WorkflowSystems`,
  `WorkflowStats`).
- **Runs** (`WorkflowRunsTable`) lists the latest runs. A row with a trace opens
  it; one without is a plain row, not a dead link.
- **Versions** (`WorkflowVersions`, a recipe beside the page) lists the versions under "Start a draft".

The page takes a `WorkflowSpec` as data (`components/workflow-spec`): stages with
their steps, typed inputs and outputs, approvers, systems, stats, runs and
versions. `shapeOf` turns it into the blueprint. The commercial loan review,
`COMMERCIAL_LOAN_SPEC`, is the one worked example; its step and stage ids and
step I/O are the scripted loan run's own.

## The run detail page

The canvas draws a run's shape; the run detail recipe is the page for reading one
run's **trace**: what each step did, how long it took, and what went in and came
out. The workflow detail page's Runs tab opens it.

A row of stage tiles (`TraceStageStrip`) says where the run is. The steps of the
chosen stage (`TraceStepList`) sit beside one step opened up
(`TraceInspector`): the calls it made against the clock (`TraceSequence`), an
agent's own account of its reasoning, its input and output, and the raw record.
It opens on the stage and step the run is waiting at, or on the failed one.

The page takes a `RunTrace` as data (`components/run-trace`): stages, and steps
with their status, timings, calls and token usage. Nothing in it is on the run
wire protocol yet, so a host supplies a trace from its own request.
`summarizeStages`, `currentStageId` and `currentStepId` derive what the tiles
and the opening view read. The commercial loan review run for Harbor Street
Bakery, `COMMERCIAL_LOAN_TRACE`, is twenty-three minutes in and waiting on its
analyst. It exercises work in parallel, a review skipped because the loan is too
small, and minutes of waiting on a person. `COMMERCIAL_LOAN_TRACE_BUREAU_FAILED`
is the same run with the credit pull timed out and the run carried on past it.
No React Flow is loaded.

In the stories the pages are reached through the shell: the **Runs list** story
**In app shell** walks from the list, through **Workflow details**, to a run's
trace. The shared `renderWorkflowsSpace` does that routing; a host does the same
with its router.

## Source layout

```
src/workflows/
  components/  canvas kit, panels, and shared workflow contracts
  engine/      wire types, placement, reducer, hooks, and run sources
  fixtures/    the authored loan run and story data
  recipes/     composition and selection
```
