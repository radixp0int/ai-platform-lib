import { useState } from 'react'
import type { RunScript } from '../../fixtures/script-types'
import { WorkflowDemoPage, type WorkflowDemoPageProps } from '../loan-review-run'
import { createFixtureRunSource, type FixtureRunOptions } from './fixture-run-source'
import { InAppShell } from './in-app-shell'

export function FixtureWorkflow({
  script,
  options,
  ...page
}: {
  script: RunScript
  options?: FixtureRunOptions
} & Omit<WorkflowDemoPageProps, 'source'>) {
  const [source] = useState(() => createFixtureRunSource(script, options))
  return (
    <InAppShell>
      <WorkflowDemoPage source={source} {...page} />
    </InAppShell>
  )
}
