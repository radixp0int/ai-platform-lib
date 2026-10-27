// The Workflows space of the platform shell, for the stories that put a page in
// the shell. A host does the same with its router: the list of every workflow, a
// workflow's own page behind a row's "Workflow details", and a run's trace behind
// a row of that page's Runs tab. The live page is the host's; here it is the
// shell's placeholder.
import type { ReactNode } from 'react'
import type { SpacePageProps } from '../../../recipes/app-shell'
import { COMMERCIAL_LOAN_TRACE } from '../../fixtures/commercialLoanTrace'
import { RUN_INPUTS } from '../../fixtures/loanRun'
import { RunDetailPage } from '../run-detail'
import { RunsListPage } from '../runs-list'
import { WorkflowDetailPage } from '../workflow-detail'

/** Only the commercial loan review has a page of its own. */
const LOAN = 'loan-review'

export function renderWorkflowsSpace({ space, path, base }: SpacePageProps): ReactNode {
  if (space !== 'workflows') return undefined
  const list = `${base}/workflows`
  const live = `${base}/workflows/live`
  const loan = `${base}/workflows/${LOAN}`

  if (path === '/workflows') {
    return (
      <RunsListPage
        hrefFor={() => live}
        detailHrefFor={(workflow) => (workflow.id === LOAN ? loan : undefined)}
      />
    )
  }
  if (path === `/workflows/${LOAN}`) {
    return (
      <WorkflowDetailPage
        listHref={list}
        liveHref={live}
        startDefaults={RUN_INPUTS}
        // Only the run on screen has a trace to open.
        runHref={(run) =>
          run.id === COMMERCIAL_LOAN_TRACE.id ? `${base}/workflows/runs/${run.id}` : undefined
        }
      />
    )
  }
  if (path.startsWith('/workflows/runs/')) {
    return <RunDetailPage listHref={list} workflowHref={loan} liveHref={live} />
  }
  return undefined
}
