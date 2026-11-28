import { useState, type ReactNode } from 'react'
import { Alert } from '../../../primitives/alert'
import { Pill } from '../../../primitives/pill'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../primitives/tabs'
import { formatDuration, formatOffset, formatTokens, spanRecord } from '../run-trace'
import { TraceSequence } from '../trace-sequence'
import { TRACE_STATUS_LABEL, TRACE_STATUS_TONE, TraceStatusIcon } from '../trace-status'
import { STEP_KIND_LABEL } from '../types'
import type { TraceInspectorProps, TraceInspectorTab } from './types'
// One step, opened up: what it is, when it ran and for how long, and then what
// happened inside it, what went in and out, and the raw record.
//
// It is the deep half of the trace page. The step list says what each step came
// to in a line; this says how it got there. A step that called a model shows its
// calls against the clock and the model's own account of its reasoning; a tool
// or a person shows what it was asked and what it returned.

const code =
  'm-0 overflow-x-auto rounded-control bg-code px-3.5 py-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words text-ink-strong'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-1.5">
      <h3 className="m-0 text-[13px] font-bold text-ink-strong">{title}</h3>
      {children}
    </section>
  )
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-ink-soft">{label}</span>
      <span className="text-sm font-semibold text-ink-strong">{value}</span>
    </div>
  )
}

export function TraceInspector({
  step,
  stageName,
  runId,
  tab,
  defaultTab = 'trace',
  onTabChange,
  statusLabel,
  context,
  actions,
  className = '',
}: TraceInspectorProps) {
  const live = step.status === 'running' || step.status === 'waiting'
  const hasCalls = (step.calls?.length ?? 0) > 0
  // A step with a Summary opens on it, and shows Trace only when it made calls.
  const hasSummary = Boolean(step.notes?.length || step.history?.length)
  const showTrace = !hasSummary || hasCalls
  const [held, setHeld] = useState<TraceInspectorTab>(defaultTab)
  const wanted = tab ?? held
  const open =
    (wanted === 'summary' && !hasSummary) || (wanted === 'trace' && !showTrace)
      ? hasSummary
        ? 'summary'
        : 'trace'
      : wanted
  const duration =
    step.duration === undefined ? '—' : `${formatDuration(step.duration)}${live ? ' so far' : ''}`
  const started = step.startedAt === undefined ? 'Not started' : formatOffset(step.startedAt)

  return (
    <section
      aria-labelledby={`trace-${step.id}`}
      className={`flex min-w-0 flex-col rounded-surface border border-line bg-panel-solid shadow-xs ${className}`}
    >
      <div className="flex flex-col gap-2.5 px-5.5 pt-4.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2
            id={`trace-${step.id}`}
            className={`m-0 text-xl font-semibold text-ink-strong ${step.mono ? 'font-mono' : ''}`}
          >
            {step.title}
          </h2>
          <Pill
            tone={TRACE_STATUS_TONE[step.status]}
            size="md"
            leadingIcon={<TraceStatusIcon status={step.status} size={14} />}
          >
            {statusLabel ??
              (step.kind === 'human' && step.status === 'done'
                ? 'Answered'
                : TRACE_STATUS_LABEL[step.status])}
          </Pill>
          <span className="ml-auto text-xs text-ink-soft">
            {context ?? `${stageName} · ${STEP_KIND_LABEL[step.kind]}`}
          </span>
        </div>
        <p className="m-0 text-sm leading-normal text-ink">{step.description}</p>
        {actions}
        <div className="flex flex-wrap gap-x-7 gap-y-1.5 pt-1.5 pb-3">
          <Fact label="Started" value={started} />
          {step.kind === 'human' && (step.waited || step.due || step.assignee) ? (
            <>
              {step.waited && <Fact label="Waiting" value={step.waited} />}
              {step.assignee && <Fact label="Assigned to" value={step.assignee} />}
              {step.due && <Fact label="Due" value={step.due} />}
            </>
          ) : (
            <Fact label="Duration" value={duration} />
          )}
          {step.usage ? (
            <>
              <Fact label="Model" value={step.usage.model} />
              <Fact
                label="Tokens"
                value={`${formatTokens(step.usage.inputTokens)} in · ${formatTokens(step.usage.outputTokens)} out`}
              />
            </>
          ) : step.route ? (
            <Fact label="Route taken" value={step.route} />
          ) : step.kind === 'human' ? (
            step.assignee && !step.waited && !step.due ? (
              <Fact label="Asked" value={step.assignee} />
            ) : null
          ) : step.kind === 'tool' ? (
            <>
              <Fact label="Tool" value={<span className="font-mono">{step.title}</span>} />
              {step.retries && <Fact label="Retries" value={step.retries} />}
            </>
          ) : null}
        </div>
      </div>

      <Tabs
        value={open}
        onValueChange={(next) => {
          if (!next) return
          setHeld(next as TraceInspectorTab)
          onTabChange?.(next as TraceInspectorTab)
        }}
      >
        <TabsList aria-label="Views of this step" className="px-4">
          {hasSummary && <TabsTrigger value="summary">Summary</TabsTrigger>}
          {showTrace && <TabsTrigger value="trace">Trace</TabsTrigger>}
          <TabsTrigger value="io">Input and output</TabsTrigger>
          <TabsTrigger value="raw">Raw span</TabsTrigger>
        </TabsList>
        <div className="flex flex-col gap-4 px-5.5 pt-4.5 pb-5.5">
          {step.failure && !actions && (
            <Alert tone="error" title="Failed, and the run kept going">
              {step.failure}
            </Alert>
          )}
          {hasSummary && (
            <TabsContent value="summary" className="flex flex-col gap-4">
              {step.notes?.map((note) => (
                <Block key={note.heading} title={note.heading}>
                  <p className="m-0 max-w-[68ch] text-sm leading-normal text-ink">{note.body}</p>
                </Block>
              ))}
              {step.reasoning && (
                <Block title="Agent’s reasoning, summarized">
                  <p className="m-0 max-w-[68ch] border-l-2 border-accent/60 pl-3.5 text-[15px] leading-relaxed text-ink-strong">
                    {step.reasoning}
                  </p>
                </Block>
              )}
              {!step.notes?.length && !step.reasoning && (
                <Block title="Result">
                  <pre className={code}>{step.output}</pre>
                </Block>
              )}
              {step.history && step.history.length > 0 && (
                <Block title="History">
                  <ol className="m-0 flex list-none flex-col gap-1 p-0">
                    {step.history.map((event, i) => (
                      <li key={i} className="flex gap-3 text-[13px] text-ink">
                        <span className="w-14 shrink-0 text-ink-soft tabular-nums">{event.at}</span>
                        {event.text}
                      </li>
                    ))}
                  </ol>
                </Block>
              )}
            </TabsContent>
          )}
          <TabsContent value="trace" className="flex flex-col gap-4">
            {hasCalls && (
              <Block title="Sequence">
                <TraceSequence calls={step.calls ?? []} duration={step.duration ?? 1} />
              </Block>
            )}
            {step.reasoning && !hasSummary && (
              <Block title="Agent’s reasoning, summarized">
                <p className="m-0 max-w-[68ch] border-l-2 border-accent/60 pl-3.5 text-[15px] leading-relaxed text-ink-strong">
                  {step.reasoning}
                </p>
              </Block>
            )}
            {!hasCalls && (
              <Block title="Result">
                <pre className={code}>{step.output}</pre>
              </Block>
            )}
          </TabsContent>
          <TabsContent
            value="io"
            className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4"
          >
            <Block title="Input">
              <pre className={code}>{step.input}</pre>
            </Block>
            <Block title="Output">
              <pre className={code}>{step.output}</pre>
            </Block>
          </TabsContent>
          <TabsContent value="raw">
            <pre className={`${code} bg-brand-950 text-brand-100`}>{spanRecord(step, runId)}</pre>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}
