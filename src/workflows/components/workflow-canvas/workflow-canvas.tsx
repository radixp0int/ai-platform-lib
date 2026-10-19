import type { WorkflowCanvasProps } from './types'
// The graph itself: React Flow, folding, and the zoom behaviour.
//
// Split out of the page because it is the one part with its own render budget —
// it rebuilds nodes and edges on every status change, and a live run changes
// statuses several times a second. Everything here is driven by the `graph` prop,
// so it neither knows nor cares whether that came from a server or a fixture.
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { foldRun } from '../../engine/layout'
import {
  buildFoldEdges,
  buildFoldNodes,
  buildStepEdges,
  buildStepNodes,
  CanvasLegend,
  FoldNode,
  foldNodeId,
  MAX_ZOOM,
  MIN_ZOOM,
  SelectStageProvider,
  SelectStepProvider,
  StepNode,
  tierForZoom,
  ToggleFoldProvider,
  ZoomCluster,
  type AppNode,
} from '../index'
import { StageLanes } from '../stage-lanes'

const nodeTypes = { step: StepNode, fold: FoldNode }
const NO_FOLDS: readonly string[] = []
const noop = () => {}

/* Never OPEN below the detail tier. The canvas pane is ~718px wide on a 1440
   screen and the run is ~1670px, so an honest fit lands around 38% — correct,
   and unreadable. Clamp the automatic fit and let the reader pan; the fit button
   in the zoom cluster stays unclamped, because asking for the whole run is a
   deliberate act. A run too wide to read here is what folding stages is for. */
const FIT_VIEW = { padding: 0.12, minZoom: 0.72 }

/* Line colours are contrast-checked in both themes — every one clears 3:1
   against the canvas it sits on (WCAG 2.2 SC 1.4.11). Light values are the ones
   measured in docs/workflows/design.md; dark lifts them the way brand.css lifts --rail.
   The kit reads these as CSS variables, so the host is what sets them. */
export const EDGE_TOKENS =
  '[--wf-done:var(--workflow-edge-done)] [--wf-active:var(--workflow-edge-active)] [--wf-pending:var(--workflow-edge-pending)] [--wf-skipped:var(--workflow-edge-skipped)]'

export function WorkflowCanvas({
  graph,
  statuses,
  selectedId,
  onSelect,
  selectedStageId,
  onSelectStage,
  stageFocusSeq,
  foldedStageIds = NO_FOLDS,
  onToggleFold,
  foldFocus,
}: WorkflowCanvasProps) {
  const { fitView, getZoom } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  // Read once per rebuild rather than subscribing: this component must not
  // re-render on every frame of a pinch, only the nodes' own tier hook does.
  const [animateEdges, setAnimateEdges] = useState(true)

  /* Two memos rather than one with a branch. A run with nothing folded is drawn
     exactly where it was placed — the loan run's positions were tuned by hand —
     and must not pay for, or be moved by, the re-placement folding needs. */
  const stepGraph = useMemo(
    () => ({
      nodes: buildStepNodes(graph.steps, statuses, selectedId) as AppNode[],
      edges: buildStepEdges(graph.edges, statuses, animateEdges),
    }),
    [graph, statuses, selectedId, animateEdges],
  )

  /* Folding changes where things are, not only what is drawn: a folded stage
     gives up its columns and everything to its right closes up. So a run with
     folds is re-placed rather than having nodes hidden in place. It is keyed on
     the graph and the fold set only — a status patch must not move anything. */
  const folded = useMemo(() => new Set(foldedStageIds), [foldedStageIds])
  const foldLayout = useMemo(
    () => (folded.size > 0 ? foldRun(graph, folded) : null),
    [graph, folded],
  )
  const foldGraph = useMemo(() => {
    if (!foldLayout) return null
    const open = foldLayout.steps.filter((s) => !folded.has(s.stageId))
    return {
      nodes: [
        ...buildStepNodes(open, statuses, selectedId),
        ...buildFoldNodes(graph.stages, graph.steps, foldLayout.folds, statuses),
      ] as AppNode[],
      edges: buildFoldEdges(graph.edges, graph.steps, folded, statuses, animateEdges),
    }
  }, [foldLayout, folded, graph, statuses, selectedId, animateEdges])

  const next = foldGraph ?? stepGraph
  const lanes = foldLayout ?? graph

  useEffect(() => {
    setNodes(next.nodes)
    setEdges(next.edges)
  }, [next, setNodes, setEdges])

  // Re-frame when a new graph arrives. A fold is not that — it has its own
  // effect below. Gated on measurement — fitting before React Flow has measured the
  // nodes frames whatever it has so far and leaves half the run off-screen.
  //
  // Keyed on `epoch`, not on the nodes: a live run changes statuses several
  // times a second, and refitting on each one would pan the canvas out from
  // under the reader. Only a whole new graph is worth re-framing for.
  const nodesInitialized = useNodesInitialized()
  const framedShape = useRef('')
  useEffect(() => {
    if (!nodesInitialized) return
    // `nodesInitialized` flips back to false every time the node objects are
    // rebuilt — which is every status change, several times a second in a live
    // run — so it cannot be the trigger on its own, only the gate. Remembering
    // what has already been framed is what stops this re-framing the canvas
    // under the reader, and what stops it stamping on the stage fit below, which
    // it otherwise overrode about 40ms later.
    const shape = `${graph.epoch}`
    if (framedShape.current === shape) return

    // Recorded when a fit actually lands, not when one is asked for. A fit into
    // a pane with no width yet — which is how the live route starts, since the
    // graph arrives after the first paint — resolves false, and claiming the
    // shape up front would make that wasted attempt the only one.
    //
    // Deliberately not cancelled when this effect re-runs: it re-runs on every
    // node rebuild, so a cancelled callback never lands, the shape is never
    // recorded, and the run gets re-framed on top of whatever the reader just
    // asked for — which is exactly how this used to stamp on the stage fit
    // below, about 40ms after it. Repeat calls are harmless; they are the same
    // target, and they stop as soon as one succeeds.
    void fitView({ ...FIT_VIEW, duration: 300 }).then((ok) => {
      if (ok) framedShape.current = shape
    })
  }, [nodesInitialized, graph.epoch, fitView])

  /* Frame the stage someone just picked. Skipped on the first render — there is
     nothing to return to yet, and the initial fitView has the job. */
  const framedSeq = useRef(stageFocusSeq)
  useEffect(() => {
    if (stageFocusSeq === framedSeq.current) return

    const ids = !selectedStageId
      ? []
      : folded.has(selectedStageId)
        ? [foldNodeId(selectedStageId)]
        : graph.steps.filter((s) => s.stageId === selectedStageId).map((s) => s.id)

    // Deselecting a stage, or one with nothing in it, is still an answered
    // request — otherwise a later re-render would treat it as outstanding.
    if (ids.length === 0) {
      framedSeq.current = stageFocusSeq
      return
    }

    // Recorded on success, like the fit above, so an attempt made while React
    // Flow is between measurements is retried rather than swallowed.
    void fitView({
      nodes: ids.map((id) => ({ id })),
      // Looser than the whole-run fit and allowed to go closer: a single stage
      // is a handful of nodes, and the point of picking one is to read it.
      padding: 0.3,
      minZoom: 0.72,
      maxZoom: 1,
      duration: 400,
    }).then((ok) => {
      if (ok) framedSeq.current = stageFocusSeq
    })
  }, [stageFocusSeq, selectedStageId, folded, graph, nodesInitialized, fitView])

  /* Frame the stage that was just folded or unfolded. Everything to its right
     has moved, so without this the thing that was clicked can leave the screen.
     Same shape as the stage fit above, and gated the same way: a fold replaces
     nodes, so `nodesInitialized` is false for a frame or two after it. */
  const foldSeq = foldFocus?.seq ?? 0
  const foldStageId = foldFocus?.stageId ?? null
  const framedFold = useRef(foldSeq)
  useEffect(() => {
    if (foldSeq === framedFold.current) return
    if (!foldStageId || !nodesInitialized) return

    const ids = folded.has(foldStageId)
      ? [foldNodeId(foldStageId)]
      : graph.steps.filter((s) => s.stageId === foldStageId).map((s) => s.id)
    if (ids.length === 0) {
      framedFold.current = foldSeq
      return
    }
    void fitView({
      nodes: ids.map((id) => ({ id })),
      // Wide padding: a folded stage is one small node, and framing it tightly
      // would zoom to the cap and lose every neighbour that explains it.
      padding: 0.6,
      minZoom: 0.72,
      maxZoom: 1,
      duration: 400,
    }).then((ok) => {
      if (ok) framedFold.current = foldSeq
    })
  }, [foldSeq, foldStageId, folded, graph, nodesInitialized, fitView])

  const onNodeClick = useCallback<NodeMouseHandler<AppNode>>(
    (_, node) => {
      // A folded stage is a button of its own and answers its own click.
      if (node.type === 'step') onSelect(node.id)
    },
    [onSelect],
  )

  const handleMove = useCallback(() => {
    const tier = tierForZoom(getZoom())
    // Dropping the dash animation below the detail tier is the single biggest
    // win when zoomed out — it repaints every frame, for every active edge.
    setAnimateEdges((on) => (on === (tier === 'detail') ? on : tier === 'detail'))
  }, [getZoom])

  const interactive = animateEdges

  return (
    // Reaches the custom nodes, which React Flow renders itself.
    <SelectStageProvider value={onSelectStage}>
      <SelectStepProvider value={onSelect}>
        <ToggleFoldProvider value={onToggleFold ?? noop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => onSelect(null)}
            onMove={handleMove}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onlyRenderVisibleElements
            nodesDraggable={interactive}
            nodesConnectable={false}
            elevateNodesOnSelect={false}
            fitView
            fitViewOptions={FIT_VIEW}
            className="!bg-transparent"
          >
            <StageLanes
              stages={graph.stages}
              lanes={lanes.lanes}
              top={lanes.laneTop}
              bottom={lanes.laneBottom}
              selectedStageId={selectedStageId}
              onSelectStage={onSelectStage}
              foldedStageIds={foldedStageIds}
              onToggleFold={onToggleFold}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
              color="color-mix(in srgb, var(--ink-soft) 40%, transparent)"
            />
            <CanvasLegend />
            <ZoomCluster />
          </ReactFlow>
        </ToggleFoldProvider>
      </SelectStepProvider>
    </SelectStageProvider>
  )
}
