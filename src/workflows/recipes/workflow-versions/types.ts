import type { WorkflowVersionRow } from '../../components/workflow-spec'

export type WorkflowVersionsProps = {
  /** Newest first. */
  versions: WorkflowVersionRow[]
  /** What a draft would become: "v13". */
  nextVersion: string
  /** What a draft does and does not touch. */
  draftNote: string
  onStartDraft?: () => void
  /** Called with a version's id to compare it with the one in use. */
  onCompare?: (versionId: string) => void
  className?: string
}
