// One workflow, as a page: what it is, how every run of it is built, who decides,
// and how its runs have gone.
//
// The runs list is every workflow at a glance; this is the page behind one of
// them. The Overview tab shows the shape, what a run needs and hands back, what
// each stage does, and the cards beside them. Runs lists its latest runs, each
// opening that run's trace; Versions holds the drafts. "Start a run" opens the
// start form, and the live-run banner goes to the run on the canvas.
//
// The workflow comes in as data, so a real one swaps the fixture for a request
// and changes nothing else. No React Flow is loaded: the shape is a blueprint.
import { useState } from 'react'
import { BreadcrumbTrail } from '../../../components/breadcrumb-trail'
import { pageColumn } from '../../../components/page-header'
import { SectionCard } from '../../../components/section-card'
import { Button } from '../../../primitives/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../primitives/tabs'
import { RunContract } from '../../components/run-contract'
import { StartRunDialog } from '../../components/start-run-dialog'
import {
  WorkflowApprovers,
  WorkflowStats,
  WorkflowSystems,
} from '../../components/workflow-side-cards'
import { WorkflowHeader } from '../../components/workflow-header'
import { WorkflowRunsTable } from '../../components/workflow-runs-table'
import { WorkflowShape } from '../../components/workflow-shape'
import { shapeLine } from '../../components/workflow-spec'
import { WorkflowStageList } from '../../components/workflow-stage-list'
import { WorkflowVersions } from '../../components/workflow-versions'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import type { WorkflowDetailPageProps, WorkflowDetailTab } from './types'

export function WorkflowDetailPage({
  spec = COMMERCIAL_LOAN_SPEC,
  listHref = '#workflows',
  liveHref = '#live',
  runHref = (run) => `#${run.id}`,
  initialTab = 'overview',
  startDefaults,
  onEdit,
}: WorkflowDetailPageProps) {
  const [tab, setTab] = useState<WorkflowDetailTab>(initialTab)
  const [starting, setStarting] = useState(false)
  const [started, setStarted] = useState(false)

  const openForm = () => {
    setStarted(false)
    setStarting(true)
  }

  return (
    <div className={`${pageColumn} max-w-[76rem] gap-5.5`}>
      <BreadcrumbTrail items={[{ label: 'Workflows', href: listHref }, { label: spec.name }]} />

      <WorkflowHeader
        name={spec.name}
        description={spec.description}
        meta={[
          ['Owner', spec.owner],
          ['Starts when', spec.startsWhen],
          ['Version', spec.version],
          ['Shape', shapeLine(spec)],
        ]}
        liveRun={spec.liveRun}
        liveHref={liveHref}
        onEdit={onEdit}
        onStart={openForm}
      />

      <Tabs value={tab} onValueChange={(next) => next && setTab(next as WorkflowDetailTab)}>
        <TabsList aria-label="Workflow">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runs" count={spec.runsTotal}>
            Runs
          </TabsTrigger>
          <TabsTrigger value="versions" count={spec.versions.length}>
            Versions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-5.5 pt-5.5">
          <WorkflowShape name={spec.name} stages={spec.stages} />

          <SectionCard
            title="Inputs and outputs"
            description="What a run needs to start, and what it produces when it finishes"
            action={
              <Button variant="secondary" size="md" onClick={openForm}>
                Try the start form
              </Button>
            }
            bodyClassName="@container px-5 py-4"
          >
            <RunContract inputs={spec.inputs} outputs={spec.outputs} />
          </SectionCard>

          <div className="flex flex-wrap items-start gap-6">
            <WorkflowStageList
              className="min-w-[min(100%,34rem)] flex-[999_1_34rem]"
              stages={spec.stages}
              timeNote={spec.timeNote}
              defaultOpenIds={['approve']}
            />
            <div className="flex min-w-[min(100%,20rem)] flex-[1_1_20rem] flex-col gap-4">
              <WorkflowApprovers approvers={spec.approvers} />
              <WorkflowSystems systems={spec.systems} />
              <WorkflowStats stats={spec.stats} note={spec.statsNote} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="runs" className="pt-5.5">
          <WorkflowRunsTable
            runs={spec.runs}
            stageCount={spec.stages.length}
            total={spec.runsTotal}
            hrefFor={runHref}
          />
        </TabsContent>

        <TabsContent value="versions" className="pt-5.5">
          <WorkflowVersions
            versions={spec.versions}
            nextVersion={spec.nextVersion}
            draftNote={spec.draftNote}
          />
        </TabsContent>
      </Tabs>

      {starting && (
        <StartRunDialog
          open
          onOpenChange={setStarting}
          workflows={[
            { id: spec.id, name: spec.name, inputs: spec.inputs, defaults: startDefaults },
          ]}
          started={started}
          onStart={() => setStarted(true)}
          onOpenRun={() => setStarting(false)}
        />
      )}
    </div>
  )
}
