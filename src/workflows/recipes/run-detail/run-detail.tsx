// What one run did, stage by stage and step by step.
//
// The canvas draws a run's shape and the table lists every workflow; this is the
// page for reading a single run's trace. A row of stage tiles says where the run
// is, the steps of the chosen stage sit on the left, and one step opens on the
// right with its calls, its reasoning, its input and output, and the raw record.
//
// It owns two things: which stage is open, and which step. The trace itself
// comes in as data, so a real one swaps the fixture for a request and changes
// nothing else.
import { useMemo, useState } from 'react'
import { BreadcrumbTrail } from '../../../components/breadcrumb-trail'
import { PageHeader, pageColumn } from '../../../components/page-header'
import { ButtonLink } from '../../../primitives/button'
import { Pill } from '../../../primitives/pill'
import {
  currentStageId,
  currentStepId,
  formatDuration,
  formatTokens,
  summarizeStages,
  type RunTrace,
} from '../../components/run-trace'
import { TraceInspector } from '../../components/trace-inspector'
import { TraceStageStrip } from '../../components/trace-stage-strip'
import { TraceStepList } from '../../components/trace-step-list'
import { COMMERCIAL_LOAN_TRACE } from '../../fixtures/commercialLoanTrace'
import type { RunDetailPageProps } from './types'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** The run's state as one pill beside its title. */
function StatePill({ trace }: { trace: RunTrace }) {
  const waitingOn = trace.steps.find((step) => step.status === 'waiting')?.assignee
  switch (trace.state) {
    case 'waiting':
      return (
        <Pill tone="orange" dot>
          {waitingOn ? `Waiting on ${waitingOn}` : 'Needs a person'}
        </Pill>
      )
    case 'running':
      return (
        <Pill tone="brand" dot>
          Running · live
        </Pill>
      )
    case 'failed':
      return <Pill tone="danger">Failed</Pill>
    default:
      return <Pill tone="success">Finished</Pill>
  }
}

export function RunDetailPage({
  trace = COMMERCIAL_LOAN_TRACE,
  listHref = '#workflows',
  workflowHref,
  liveHref = '#live',
  initialStageId,
  initialStepId,
}: RunDetailPageProps) {
  const stages = useMemo(() => summarizeStages(trace), [trace])
  const [stageId, setStageId] = useState(initialStageId ?? currentStageId(stages))
  const [stepId, setStepId] = useState(initialStepId ?? currentStepId(trace, stageId))

  const stage = stages.find((item) => item.id === stageId) ?? stages[0]
  const inStage = trace.steps.filter((step) => step.stageId === stage.id)
  const step =
    trace.steps.find((item) => item.id === stepId && item.stageId === stage.id) ?? inStage[0]

  const tokens = trace.steps.reduce(
    (sum, item) => sum + (item.usage ? item.usage.inputTokens + item.usage.outputTokens : 0),
    0,
  )

  return (
    <div className={`${pageColumn} max-w-[84rem] gap-5`}>
      <BreadcrumbTrail
        items={[
          { label: 'Workflows', href: listHref },
          ...(workflowHref ? [{ label: trace.workflow, href: workflowHref }] : []),
          { label: workflowHref ? trace.title : `${trace.workflow} · ${trace.title}` },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-[28rem] flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <PageHeader
              title={
                <>
                  {trace.workflow} · {trace.title}
                </>
              }
              className="flex min-w-0 flex-col"
            />
            <StatePill trace={trace} />
          </div>
          <p className="m-0 text-sm text-ink-soft">
            Run {trace.id} · started {trace.startedLabel} by {trace.startedBy} ·{' '}
            {formatDuration(trace.elapsed)} elapsed
            {tokens > 0 && <> · {formatTokens(tokens)} tokens</>}
          </p>
        </div>
        <ButtonLink href={liveHref} variant="secondary" size="lg">
          Open live view
        </ButtonLink>
      </div>

      <TraceStageStrip
        stages={stages}
        selectedId={stage.id}
        onSelect={(id) => {
          setStageId(id)
          setStepId(currentStepId(trace, id))
        }}
      />

      <div className="flex flex-wrap items-start gap-5">
        <TraceStepList
          className="min-w-[18rem] max-w-[26rem] flex-[1_1_20rem]"
          heading={
            <>
              {stage.name} · {plural(stage.stepCount, 'step')}
            </>
          }
          steps={inStage}
          selectedId={step?.id}
          onSelect={setStepId}
        />
        {step && (
          <TraceInspector
            // A new step opens on the trace, not on whichever tab the last one was left on.
            key={step.id}
            className="min-w-[20rem] flex-[999_1_32rem]"
            step={step}
            stageName={stage.name}
            runId={trace.id}
          />
        )}
      </div>
    </div>
  )
}
