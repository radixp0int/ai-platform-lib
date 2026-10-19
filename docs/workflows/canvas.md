# Workflow canvas kit

A React Flow canvas for multi-step agentic runs with a human in the loop: nodes
that say who does the work, two densities, and level-of-detail as you zoom out.

The canvas kit is independent of the run engine and recipe fixtures. Import it
from `ai-platform-lib/workflows`, supply your own steps and stages, and wrap
it with React Flow. Load the package's brand tokens and styles as shown in the
root [README](../../README.md).

## What you supply

| You provide                  | Shape                    |
| ---------------------------- | ------------------------ |
| Steps, with x/y positions    | `StepSeed<YourDetail>[]` |
| Stages                       | `StageSeed[]`            |
| Edges                        | `EdgeSeed[]`             |
| Which step is at what status | `StatusMap`              |

`detail` is yours — the canvas carries it to your panel and never reads inside
it, so `StepSeed<T>` takes whatever shape your inspector wants.

## The shortest host

```tsx
import { ReactFlow, ReactFlowProvider } from '@xyflow/react'
import {
  buildStepEdges, buildStepNodes, CanvasLegend, MAX_ZOOM, MIN_ZOOM,
  SelectStepProvider, StepNode, ZoomCluster, EDGE_TOKENS,
} from 'ai-platform-lib/workflows'

const nodeTypes = { step: StepNode }

<div className={EDGE_TOKENS}>
  <ReactFlowProvider>
    <SelectStepProvider value={setSelectedId}>
      <ReactFlow
        nodes={buildStepNodes(STEPS, statuses, selectedId)}
        edges={buildStepEdges(EDGE_SEEDS, statuses, true)}
        nodeTypes={nodeTypes}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        onlyRenderVisibleElements
      >
        <CanvasLegend />
        <ZoomCluster />
      </ReactFlow>
    </SelectStepProvider>
  </ReactFlowProvider>
</div>
```

## Four things that will bite you

1. **The line colours are CSS variables** (`--wf-done` and friends), so the host
   binds them to the brand tokens using `EDGE_TOKENS`. Without those bindings
   edges are invisible. The shipped values are contrast-checked; see
   [Design](./design.md) before changing them.
2. **Words that are situational are data, not vocabulary.** Status _names_
   ("Queued") have defaults in `StatusMark`; a countdown or an assignee comes in
   as `statusLabel` / `assignee` on the step. Don't hardcode them into a node.
3. **`useZoomTier()` returns a bucket, not the zoom**, so nodes re-render when
   the tier changes rather than on every frame of a pinch. Keep node components
   `memo`'d, and drop the edge dash animation below the detail tier.
4. **Clickable things inside a node need `nodrag`** plus `stopPropagation`, or
   mousedown drags the node and the canvas's own click handler fires after yours.

## Colours

Everything else is a semantic token from `ai-platform-lib/brand/tokens.css` (`--panel-solid`,
`--ink-strong`, `--notify`), so the kit themes light and dark with the host and
carries no palette of its own. Orange means one thing only: a person is being
waited on.
