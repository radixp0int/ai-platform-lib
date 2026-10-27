import { Button } from '../../../primitives/button'
import { PencilIcon } from '../../../primitives/icons'
import { Pill } from '../../../primitives/pill'
import type { WorkflowVersionsProps } from './types'
// A workflow's versions, newest first, under the one thing you can do about them:
// start a draft. Changes never land in the version in use; they become the next
// one when published, and the note says what that means for runs in progress.

export function WorkflowVersions({
  versions,
  nextVersion,
  draftNote,
  onStartDraft,
  onCompare,
  className = '',
}: WorkflowVersionsProps) {
  return (
    <section aria-label="Versions" className={`flex max-w-[51rem] flex-col gap-3.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-4.5 gap-y-3 rounded-dialog border-[1.5px] border-dashed border-accent/45 bg-chip/40 px-4.5 py-4">
        <span className="flex min-w-[min(100%,22rem)] flex-1 flex-col gap-0.5">
          <span className="text-[14.5px] font-bold text-ink-strong">
            Changes start as a draft of{' '}
            <span className="font-mono text-[13.5px]">{nextVersion}</span>
          </span>
          <span className="text-[13px] leading-snug text-ink">{draftNote}</span>
        </span>
        <Button
          variant="primary"
          size="lg"
          onClick={onStartDraft}
          icon={<PencilIcon width={16} height={16} />}
        >
          Start a draft
        </Button>
      </div>
      <ol className="m-0 flex list-none flex-col p-0">
        {versions.map((version) => (
          <li
            key={version.id}
            className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-start gap-x-4 border-b border-line py-3.5 max-sm:grid-cols-[3rem_minmax(0,1fr)]"
          >
            <span className="pt-0.5 font-mono text-sm font-semibold text-ink-strong">
              {version.id}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-ink-strong">{version.change}</span>
                {version.current && <Pill size="sm">In use</Pill>}
              </span>
              <span className="text-[12.5px] text-ink-soft">{version.meta}</span>
            </span>
            {!version.current && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => onCompare?.(version.id)}
                aria-label={`Compare ${version.id} with the version in use`}
              >
                Compare
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
