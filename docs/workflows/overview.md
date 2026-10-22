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
loan, loading, unavailable, and runs-list recipes show the surrounding screen
states. The sibling `chat-interfaces` demo uses this library for its
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

## Static incident and onboarding recipes

| Recipe              | Run                                 | What it demonstrates                                                              |
| ------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| Loan review         | Commercial loan, 12 steps           | A three-way fan-out and a gate offering approve, request changes, or decline      |
| Incident triage     | SEV-2 latency incident, 14 steps    | A failed probe while the run continues, rollback approval, and verification retry |
| Employee onboarding | New hire across 5 systems, 16 steps | Five tools in one column and two approvals open together                          |

The incident and onboarding scripts were copied from
`chat-workflow-mock-api/src/workflow/variants/` into this package's fixtures.
Importing or running their stories requires no sibling checkout or server.

Machine work completes immediately, keeping the stories deterministic. Human
approvals remain interactive. Onboarding accepts manager and HR approvals in
either order; declining either abandons the other and holds day-one setup.
Incident triage retains the failed probe as a finding and offers verification
failure, retry, resolved, and declined states. Pause then resume advances frozen
verification states through the remaining script.

The fixture source is a recipe helper, excluded from public engine exports.
Run `npm run test:static-workflows` after `npm run build-storybook` to check these
interactions, and `npm run test:tablet-workflow` for the tablet and desktop layout.

## Source layout

```
src/workflows/
  components/  canvas kit, panels, and shared workflow contracts
  engine/      wire types, placement, reducer, hooks, and run sources
  fixtures/    authored loan, incident, onboarding, and story data
  recipes/     composition, selection, and fixture-only helpers
```
