import { RunUnavailable } from '../run-unavailable'
// Multi-step agentic workflow with a human in the loop.
//
// Three panels plus a log drawer: the run outline on the left, the graph in the
// middle, the selected step on the right, and what the backend is doing
// underneath. Any stage can be folded to its bars, and a long run opens with the
// stages away from the action already folded — see docs/workflows/design.md
// for why, for the zoom tiers, and for the source seam this page sits on.
//
// The page holds no run content of its own. Everything it draws arrives from a
// `RunSource`: the hard-coded loan run on /workflow-demo, a WebSocket server on
// /workflow-live. That is the same shape `Responder` gives the chat demo. What
// is left here is composition and selection — the canvas, the top bar and each
// panel live in their own files.
import { ReactFlowProvider } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { CollapsiblePanel } from '../../../components/collapsible-panel'
import { AmbientGlow } from '../../../primitives/ambient-glow'
import { Modal } from '../../../primitives/modal'
import type { RecentRun, StageSeed, StepSeed } from '../../components/index'
import { RunLog } from '../../components/run-log'
import { RunSidebar, type NeedsItem } from '../../components/run-sidebar'
import { RunTopBar } from '../../components/run-top-bar'
import { StageInspector } from '../../components/stage-inspector'
import { StartRunDialog } from '../../components/start-run-dialog'
import { StepDetail } from '../../components/step-detail'
import { StepInspector } from '../../components/step-inspector'
import { EDGE_TOKENS, WorkflowCanvas } from '../../components/workflow-canvas'
import { resolveStepIO, useRun, type Decision, type RunSource } from '../../engine/index'
import type { RunDetail } from '../../engine/wireProtocol'
import { WorkflowSkeleton } from '../loading-skeleton'

// Tablet layouts give the canvas its own width. Side panels become modal
// surfaces so opening details never squeezes the canvas into a few pixels.
const tabletQuery = '(max-width: 1279px)'
const subscribeTablet = (notify: () => void) => {
  const query = window.matchMedia(tabletQuery)
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}
const isTablet = () => window.matchMedia(tabletQuery).matches

/** A run with more stages than this opens with the distant ones folded. */
const FOLD_OVER = 6

/**
 * Which stages a run opens with folded. A short run fits as it is, so nothing
 * folds. In a long one the stage the run is on and the one either side of it
 * stay open, and everything further away folds. A run that has not started (or
 * has finished) has no current stage, so it opens from the front.
 */
function defaultFolds(stages: StageSeed[]): string[] {
  if (stages.length <= FOLD_OVER) return []
  const at = Math.max(
    0,
    stages.findIndex((stage) => stage.status === 'current'),
  )
  return stages.filter((_, index) => Math.abs(index - at) > 1).map((stage) => stage.id)
}

export type WorkflowDemoPageProps = {
  source: RunSource
  /** Other runs to switch to from the left panel's Recent tab. */
  recent?: RecentRun[]
  /** Which of `recent` this page is showing. */
  activeRecentId?: string | null
  onOpenRecent?: (id: string) => void
  /**
   * `auto` folds the distant stages of a long run; `none` opens with every
   * step drawn. Either way the reader can fold and unfold from there.
   */
  folds?: 'auto' | 'none'
}

export function WorkflowDemoPage({
  source,
  recent,
  activeRecentId,
  onOpenRecent,
  folds = 'auto',
}: WorkflowDemoPageProps) {
  const tablet = useSyncExternalStore(subscribeTablet, isTablet, () => false)
  const [tabletPanel, setTabletPanel] = useState<'run' | 'details' | null>(null)
  const run = useRun(source)
  const { graph, statuses, phase, awaiting, decisionsFor, busyStepId } = run

  const [selectedId, setSelectedId] = useState<string | null>(null)
  /* Whether the selection is the reader's own. A run that stops to ask a
     question should bring the panel with it — but not out from under someone
     who went looking at a different step. */
  const [userPicked, setUserPicked] = useState(false)
  /* Which stage is being looked at. It follows the selected step, so the canvas
     highlight always agrees with the panel — but framing does not (see
     `stageFocusSeq`), because a live run moves the selection on its own. */
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [stageFocusSeq, setStageFocusSeq] = useState(0)
  /* Which of the two the details panel is answering. A discriminator rather
     than clearing `selectedId`: doing that rebuilt every step node on a stage
     click, which resets React Flow's measurements and delayed — sometimes
     swallowed — the fit that click asked for. */
  const [panelShows, setPanelShows] = useState<'step' | 'stage'>('step')
  const [runPanelOpen, setRunPanelOpen] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [logOpen, setLogOpen] = useState(false)
  /* The selected step, shown as a page instead of in the panel. A boolean, not
     a second id: it is always the step the panel is on, so the two can never
     disagree about what is being decided. */
  const [expanded, setExpanded] = useState(false)
  /* The workflow whose start form is open. Switching to a workflow that asks
     for inputs goes through its form; one that asks for nothing starts at once. */
  const [startingId, setStartingId] = useState<string | null>(null)

  /* Which stages are drawn folded. The reader's own choice once they have made
     one; until then it follows `defaultFolds`. */
  const [foldedStageIds, setFoldedStageIds] = useState<string[]>([])
  const [foldFocus, setFoldFocus] = useState<{ stageId: string | null; seq: number }>({
    stageId: null,
    seq: 0,
  })

  const stageOf = useCallback(
    (stepId: string | null) => (stepId && graph?.stepById.get(stepId)?.stageId) || null,
    [graph],
  )

  // Picking a step is a request to look at it, so it reopens a closed panel.
  // The stage highlight follows, so the canvas agrees with the panel.
  const selectStep = useCallback(
    (id: string | null) => {
      setSelectedId(id)
      setSelectedStageId(stageOf(id))
      setPanelShows('step')
      setUserPicked(id !== null)
      setExpanded(false)
      if (id) {
        setDetailsOpen(true)
        setTabletPanel('details')
      }
    },
    [stageOf],
  )

  /* Opening a step from the sidebar also frames its stage. `selectStep` on its
     own deliberately does not — a live run moves the selection by itself, and
     framing on every selection change would yank the viewport several times a
     second (see `stageFocusSeq` in WorkflowCanvas). But a click in "Needs you"
     is a deliberate act, exactly like a click on a stage row, so it gets the
     same treatment: the stage lights up AND the canvas goes there. */
  const openStepFromSidebar = useCallback(
    (id: string) => {
      selectStep(id)
      setStageFocusSeq((n) => n + 1)
    },
    [selectStep],
  )

  /* Picking a stage clears the step, so the panel shows the stage rather than
     leaving an unrelated step open beside it. Bumping the sequence is what asks
     the canvas to re-frame — only ever from a deliberate click. */
  const selectStage = useCallback(
    (id: string) => {
      // Computed here rather than inside the updater: React may invoke an
      // updater twice, and setState from within one is a side effect.
      const next = selectedStageId === id ? null : id
      setSelectedStageId(next)
      setPanelShows(next ? 'stage' : 'step')
      setTabletPanel('details')
      setUserPicked(true)
      setStageFocusSeq((n) => n + 1)
      setExpanded(false)
      setDetailsOpen(true)
    },
    [selectedStageId],
  )

  // A new graph gets the step it nominates, and hands the choice back.
  const focusStepId = graph?.focusStepId
  const epoch = graph?.epoch
  useEffect(() => {
    setSelectedId(focusStepId ?? null)
    setSelectedStageId(stageOf(focusStepId ?? null))
    setPanelShows('step')
    setUserPicked(false)
  }, [focusStepId, epoch, stageOf])

  // A new graph starts from the default folds; nothing a reader folded in the
  // last run means anything in this one.
  const stages = graph?.stages
  const foldedFor = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!stages || foldedFor.current === epoch) return
    foldedFor.current = epoch
    setFoldedStageIds(folds === 'auto' ? defaultFolds(stages) : [])
  }, [stages, epoch, folds])

  /* The stage a run has just reached is never left folded: that is where the
     work is, and a live run would otherwise walk off into a column of bars.
     It is opened without re-framing — nobody asked for the viewport to move. */
  const currentStageId = stages?.find((stage) => stage.status === 'current')?.id
  useEffect(() => {
    if (!currentStageId) return
    setFoldedStageIds((ids) =>
      ids.includes(currentStageId) ? ids.filter((id) => id !== currentStageId) : ids,
    )
  }, [currentStageId])

  const toggleFold = useCallback((id: string) => {
    setFoldedStageIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
    setFoldFocus((focus) => ({ stageId: id, seq: focus.seq + 1 }))
  }, [])

  // The first step to stop and ask for a person takes the panel, unless the
  // reader has since gone looking somewhere themselves.
  const firstAwaiting = awaiting[0]
  useEffect(() => {
    if (!firstAwaiting || userPicked) return
    setSelectedId(firstAwaiting)
    setSelectedStageId(stageOf(firstAwaiting))
    setDetailsOpen(true)
  }, [firstAwaiting, userPicked, stageOf])

  /* Every step at `waiting`, not the one step named `approve`: a run can stop on
     two approvals at once, and naming the step made the second one invisible. */
  const needs = useMemo<NeedsItem[]>(
    () =>
      awaiting.map((id) => {
        const step = graph?.stepById.get(id)
        // Two facts, joined — not a sentence. A due label is written for the
        // node's status marker ("3h 40m", "Today"), so anything that prefixes it
        // with "in" reads wrong for half the runs that use it.
        const sub = [step?.assignee, step?.statusLabel && `due ${step.statusLabel}`]
          .filter(Boolean)
          .join(' · ')
        return { stepId: id, title: step?.title ?? id, sub: sub || (step?.meta ?? '') }
      }),
    [awaiting, graph],
  )

  /* What a yes sets running, for the expanded view's "Next if approved". Two
     hops rather than one, because the interesting answer is usually a pair — the
     agent that drafts and the call that sends — and capped so a fan-out cannot
     turn a decision aid into a list. Edge rules are deliberately not consulted:
     a rule governs how an edge is DRAWN, not whether the step is downstream. */
  const nextSteps = useMemo(() => {
    if (!graph || !selectedId) return []
    const out: StepSeed<RunDetail>[] = []
    const seen = new Set([selectedId])
    let frontier = [selectedId]
    for (let hop = 0; hop < 2 && out.length < 4; hop++) {
      const reached = graph.edges.filter((e) => frontier.includes(e.from)).map((e) => e.to)
      frontier = []
      for (const id of reached) {
        if (seen.has(id) || out.length >= 4) continue
        seen.add(id)
        const step = graph.stepById.get(id)
        if (!step) continue
        out.push(step)
        frontier.push(id)
      }
    }
    return out
  }, [graph, selectedId])

  const stepTitles = useMemo(() => {
    const map = new Map<string, string>()
    graph?.steps.forEach((s) => map.set(s.id, s.title))
    return map
  }, [graph])

  const selectedStep = (selectedId && graph?.stepById.get(selectedId)) || null
  const selectedStage =
    panelShows === 'stage' && selectedStageId
      ? (graph?.stages.find((st) => st.id === selectedStageId) ?? null)
      : null
  const stageSteps = useMemo(
    () => (selectedStage ? (graph?.steps.filter((s) => s.stageId === selectedStage.id) ?? []) : []),
    [selectedStage, graph],
  )
  /* Resolved here rather than in the panel, so the panel stays a view of what
     it is given: an input's value is a fact about the whole run, not the step. */
  const selectedIO = useMemo(
    () => (graph && selectedId ? resolveStepIO(graph, statuses, selectedId) : null),
    [graph, statuses, selectedId],
  )

  const onVariant = useCallback(
    (variantId: string) => {
      const variant = run.variants.find((v) => v.id === variantId)
      if (variant?.inputs?.length) setStartingId(variantId)
      else run.start(variantId)
    },
    [run],
  )
  const starting = startingId ? run.variants.find((v) => v.id === startingId) : undefined

  const onDecide = useCallback(
    (decision: Decision, note?: string) => {
      if (selectedId) run.decide(selectedId, decision, note)
    },
    [run, selectedId],
  )

  // No graph yet. That is the skeleton's job — unless the reason there is no
  // graph is that nothing is going to send one, in which case say so instead of
  // spinning forever.
  if (!graph) {
    return run.error ? <RunUnavailable message={run.error.message} /> : <WorkflowSkeleton />
  }

  const sidebar = (
    <RunSidebar
      appName="Acme"
      header={graph.header}
      stages={graph.stages}
      needs={needs}
      selectedStageId={selectedStageId}
      onSelectStage={selectStage}
      variants={run.variants}
      variantId={graph.variantId}
      onVariant={onVariant}
      onOpenStep={openStepFromSidebar}
      selectedStepId={selectedId}
      onCollapse={() => {
        setRunPanelOpen(false)
        setTabletPanel(null)
      }}
      foldedStageIds={foldedStageIds}
      onToggleFold={toggleFold}
      recent={recent}
      activeRecentId={activeRecentId}
      onOpenRecent={onOpenRecent}
    />
  )
  const inspector = selectedStage ? (
    <StageInspector
      stage={selectedStage}
      steps={stageSteps}
      statuses={statuses}
      selectedStepId={selectedId}
      onSelectStep={selectStep}
      onClose={() => {
        setDetailsOpen(false)
        setTabletPanel(null)
      }}
    />
  ) : (
    <StepInspector
      step={selectedStep}
      status={selectedId ? statuses[selectedId] : undefined}
      io={selectedIO}
      decisions={(selectedId && decisionsFor[selectedId]) || []}
      busy={busyStepId === selectedId}
      onClose={() => {
        setDetailsOpen(false)
        setTabletPanel(null)
      }}
      onExpand={() => {
        setExpanded(true)
        setTabletPanel(null)
      }}
      onDecide={onDecide}
    />
  )

  return (
    <div className="relative flex h-dvh gap-4 overflow-hidden bg-canvas p-4">
      <AmbientGlow />

      {!tablet && (
        <CollapsiblePanel open={runPanelOpen} width="w-72" gutter="-mr-4">
          {sidebar}
        </CollapsiblePanel>
      )}
      {tablet && (
        <Modal
          open={tabletPanel !== null}
          onOpenChange={(open) => {
            if (!open) setTabletPanel(null)
          }}
          title={tabletPanel === 'run' ? 'Run outline' : 'Step details'}
          size="md"
        >
          <div className="h-[min(70dvh,42rem)]">{tabletPanel === 'run' ? sidebar : inspector}</div>
        </Modal>
      )}

      <main className="glass relative flex min-w-0 flex-1 overflow-hidden rounded-surface">
        {/* @container: the top bar has to respond to THIS column's width, not the
            viewport's — the sidebar and inspector take ~700px of a 1440 screen,
            so a viewport query never fires and the bar overflows the panel. */}
        <div className="@container flex min-w-0 flex-1 flex-col">
          <RunTopBar
            title={graph.title}
            waitingCount={awaiting.length}
            phase={phase}
            onControl={run.control}
            runPanelOpen={!tablet && runPanelOpen}
            onShowRunPanel={() => {
              if (tablet) setTabletPanel('run')
              else setRunPanelOpen(true)
            }}
            detailsOpen={tablet ? tabletPanel === 'details' : detailsOpen}
            onToggleDetails={() => {
              if (tablet) setTabletPanel((panel) => (panel === 'details' ? null : 'details'))
              else setDetailsOpen((o) => !o)
            }}
            logOpen={logOpen}
            onToggleLog={() => setLogOpen((o) => !o)}
          />
          {run.error && (
            <div className="shrink-0 border-b border-line bg-danger-fg/8 px-6 py-2 text-[13px] text-danger-fg">
              {run.error.message}
            </div>
          )}
          <div className={`relative min-h-0 flex-1 ${EDGE_TOKENS}`}>
            <ReactFlowProvider>
              <WorkflowCanvas
                graph={graph}
                statuses={statuses}
                selectedId={selectedId}
                onSelect={selectStep}
                selectedStageId={selectedStageId}
                onSelectStage={selectStage}
                stageFocusSeq={stageFocusSeq}
                foldedStageIds={foldedStageIds}
                onToggleFold={toggleFold}
                foldFocus={foldFocus}
              />
            </ReactFlowProvider>
          </div>
          <RunLog
            entries={run.log}
            trimmed={run.logTrimmed}
            open={logOpen}
            stepTitles={stepTitles}
            onSelectStep={selectStep}
            onClose={() => setLogOpen(false)}
          />
        </div>

        {expanded && selectedStep && (
          <StepDetail
            step={selectedStep}
            status={selectedId ? statuses[selectedId] : undefined}
            io={selectedIO}
            runTitle={graph.title}
            next={nextSteps}
            decisions={(selectedId && decisionsFor[selectedId]) || []}
            busy={busyStepId === selectedId}
            onClose={() => setExpanded(false)}
            onDecide={onDecide}
          />
        )}

        {starting && (
          <StartRunDialog
            open
            onOpenChange={(open) => !open && setStartingId(null)}
            workflows={[{ id: starting.id, name: starting.label, inputs: starting.inputs ?? [] }]}
            onStart={(id, values) => {
              setStartingId(null)
              run.start(id, values)
            }}
          />
        )}

        {!tablet && (
          <CollapsiblePanel open={detailsOpen} width="w-[400px]">
            {inspector}
          </CollapsiblePanel>
        )}
      </main>
    </div>
  )
}
