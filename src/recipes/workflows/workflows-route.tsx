// The workflows space as the shell hosts it: which page a path below the tenant
// opens. `/workflows` is the runs list; a workflow's page and a run's page sit
// under it (see ./links.ts).
import { useMemo } from 'react'
import { PlaceholderPage } from '../app-shell/pages/PlaceholderPage'
import { usePlatform } from '../app-shell/platform-context'
import { findRun } from './fixtures/runs'
import { WORKFLOWS } from './fixtures/workflows'
import { linksFor } from './links'
import { WorkflowsPage } from './runs-list/workflows-page'
import { WorkflowRunPage, type RunView } from './workflow-run/workflow-run-page'

export type WorkflowsRouteProps = {
  /** The path below the tenant, query included: `/workflows/<id>/runs/<run>?view=details`. */
  path: string
}

export function WorkflowsRoute({ path }: WorkflowsRouteProps) {
  const { base, go, runs } = usePlatform()
  const links = useMemo(() => linksFor(base, go), [base, go])
  const [pathname, search = ''] = path.split('?')
  const params = new URLSearchParams(search)
  const parts = pathname.split('/').filter(Boolean)
  // A tenant with no runs has no workflows either: the list's empty state.
  const workflows = runs.length > 0 ? WORKFLOWS : []

  if (parts.length === 1) return <WorkflowsPage workflows={workflows} links={links} />
  const row = workflows.find((w) => w.id === parts[1])

  if (parts[2] === 'runs' && parts[3]) {
    const runId = parts[3] === 'latest' ? row?.runId : parts[3]
    const run = row && runId ? findRun(row.id, runId) : undefined
    const view = params.get('view')
    return (
      <WorkflowRunPage
        // A new run, or a link that names a step, starts the page afresh.
        key={`${pathname}?${search}`}
        run={run}
        state={run ? 'ready' : 'unavailable'}
        view={view === 'canvas' || view === 'details' ? (view as RunView) : undefined}
        step={params.get('step') ?? undefined}
        stage={params.get('stage') ?? undefined}
        log={params.get('log') === 'open'}
        links={links}
        onRetry={() => go(`${base}${path}`)}
      />
    )
  }
  return <PlaceholderPage title={row?.name ?? 'Workflow'} />
}
