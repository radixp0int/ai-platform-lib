// The workflows space as the shell hosts it: which page a path below the tenant
// opens. `/workflows` is the runs list; a workflow's page and a run's page sit
// under it (see ./links.ts).
import { useMemo } from 'react'
import { PlaceholderPage } from '../app-shell/pages/PlaceholderPage'
import { usePlatform } from '../app-shell/platform-context'
import { WORKFLOWS } from './fixtures/workflows'
import { linksFor } from './links'
import { WorkflowsPage } from './runs-list/workflows-page'

export type WorkflowsRouteProps = {
  /** The path below the tenant, query included: `/workflows/<id>/runs/<run>?view=details`. */
  path: string
}

export function WorkflowsRoute({ path }: WorkflowsRouteProps) {
  const { base, go, runs } = usePlatform()
  const links = useMemo(() => linksFor(base, go), [base, go])
  const [pathname] = path.split('?')
  const parts = pathname.split('/').filter(Boolean)
  // A tenant with no runs has no workflows either: the list's empty state.
  const workflows = runs.length > 0 ? WORKFLOWS : []

  if (parts.length === 1) return <WorkflowsPage workflows={workflows} links={links} />
  const row = workflows.find((w) => w.id === parts[1])
  return <PlaceholderPage title={row?.name ?? 'Workflow'} />
}
