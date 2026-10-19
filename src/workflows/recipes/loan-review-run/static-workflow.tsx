// The hard-coded run, on the page. Lazily imported by WorkflowRoute so the loan
// fixture rides in the same chunk as React Flow rather than the main bundle.
import { staticRunSource } from '../../engine/index'
import { WorkflowDemoPage } from './loan-review-run'

export function StaticWorkflow() {
  return <WorkflowDemoPage source={staticRunSource} />
}
