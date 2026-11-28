// Where the workflow pages link to one another. The shell builds these from the
// tenant's base path; a page on its own gets hash links that go nowhere.
//
//   /workflows                          the runs list
//   /workflows/<id>[?tab=runs]          a workflow's page
//   /workflows/<id>/runs/<run>?view=…   a run's page: Canvas or Details

/** Which view of the run page, and what it opens on. */
export type RunTarget = {
  view?: 'canvas' | 'details'
  /** A step to select in Details. */
  step?: string
  /** A stage whose group Details unfolds. */
  stage?: string
  /** Opens the run log. */
  log?: boolean
  /** Another run of the same workflow than its live one: a past run, say. */
  runId?: string
}

export type WorkflowLinks = {
  /** The platform's Overview, the trail's first crumb. */
  overview?: string
  list: string
  workflow: (row: { id: string }, tab?: 'runs' | 'versions') => string
  run: (row: { id: string; runId?: string }, target?: RunTarget) => string
  /** Client-side navigation, for menu items that are not links. */
  go: (href: string) => void
}

export function runQuery(target: RunTarget = {}): string {
  const params = new URLSearchParams()
  if (target.view) params.set('view', target.view)
  if (target.step) params.set('step', target.step)
  if (target.stage) params.set('stage', target.stage)
  if (target.log) params.set('log', 'open')
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** Links under a tenant's base path, `/t/<tenant>`. */
export function linksFor(base: string, go: (href: string) => void): WorkflowLinks {
  return {
    overview: `${base}/home`,
    list: `${base}/workflows`,
    workflow: (row, tab) => `${base}/workflows/${row.id}${tab ? `?tab=${tab}` : ''}`,
    run: (row, target) =>
      `${base}/workflows/${row.id}/runs/${target?.runId ?? row.runId ?? 'latest'}${runQuery(target)}`,
    go,
  }
}

/** For a page shown on its own, outside the shell. */
export const DEFAULT_LINKS: WorkflowLinks = linksFor('#', () => undefined)
