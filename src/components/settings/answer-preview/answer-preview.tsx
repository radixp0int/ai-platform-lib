import { CopyIcon, RefreshIcon, ThumbDownIcon, ThumbUpIcon } from '../../../primitives/icons'
import type { AnswerPreviewPart, AnswerPreviewProps } from '../types'

const FOLLOWUPS = ['Who owns it?', 'Draft a note to renew the key']

/**
 * A small, static answer that shows or hides its parts as the feature switches
 * beside it change — reasoning, tool calls, citations and the source strip,
 * message actions, turn details and follow-ups. It lets a viewer see what a
 * switch does without closing the dialog.
 *
 * Nothing in it is interactive: it is a picture of an answer, so its buttons
 * are drawn as text and icons rather than controls a keyboard would stop on.
 * The follow-ups hang off the same hairline rail and hollow nodes as the
 * chat's own FollowupChips, drawn here because components do not import from
 * the chat area.
 */
export function AnswerPreview({ show, title = 'Preview', className = '' }: AnswerPreviewProps) {
  const on = (part: AnswerPreviewPart) => show[part] !== false

  return (
    <aside
      aria-label={title}
      className={`flex flex-col gap-2.5 rounded-surface bg-tint/4 p-3.5 ring-1 ring-line ${className}`}
    >
      <p className="text-[11px] font-bold tracking-[0.12em] text-ink-soft uppercase" aria-hidden>
        {title}
      </p>
      <div className="flex flex-col gap-2 text-[12.5px] leading-normal text-ink">
        {on('reasoning') && (
          <span className="inline-flex h-[22px] items-center self-start rounded-[6px] bg-tint/8 px-2 text-[11px] font-semibold text-ink-soft">
            Thought for 4s
          </span>
        )}
        {on('tools') && (
          <span className="inline-flex h-[22px] items-center gap-1.5 self-start rounded-full px-2 font-mono text-[11px] font-semibold text-ink ring-1 ring-line">
            <span aria-hidden className="size-1.5 rounded-full bg-success-fg" />
            sync_log.read
          </span>
        )}
        <p>
          The pricing sheets API has failed since 04:10 on Nov 23
          {on('citations') && (
            <sup className="ml-0.5 text-[10px] font-bold text-accent-fg">[1]</sup>
          )}
          . Its 86 documents still answer questions.
        </p>
        {on('citations') && (
          <div role="group" className="flex flex-wrap gap-1.5" aria-label="Sources">
            <span className="inline-flex h-[22px] items-center rounded-[6px] px-2 text-[11px] font-semibold text-ink ring-1 ring-line">
              1 · Ingestion sync log
            </span>
          </div>
        )}
        {on('actions') && (
          <div
            role="group"
            className="flex items-center gap-3 text-[11px] text-ink-soft"
            aria-label="Message actions"
          >
            <span className="inline-flex items-center gap-1">
              <CopyIcon width={12} height={12} aria-hidden />
              Copy
            </span>
            <span className="inline-flex items-center gap-1">
              <RefreshIcon width={12} height={12} aria-hidden />
              Regenerate
            </span>
            <ThumbUpIcon width={13} height={13} role="img" aria-label="Good answer" />
            <ThumbDownIcon width={13} height={13} role="img" aria-label="Bad answer" />
          </div>
        )}
        {on('turnDetails') && (
          <span className="text-[11px] text-ink-soft">Answered in 6.2s · 3 steps</span>
        )}
        {on('followups') && (
          <ul
            aria-label="Suggested follow-ups"
            className="relative flex flex-col gap-1.5 pl-4 before:absolute before:top-1.5 before:bottom-1.5 before:left-1 before:w-px before:bg-ink-soft/25 before:content-['']"
          >
            {FOLLOWUPS.map((text) => (
              <li
                key={text}
                className="relative text-xs font-semibold text-accent-fg after:absolute after:top-[5px] after:-left-4 after:size-[9px] after:rounded-full after:border-[1.5px] after:border-ink-soft/30 after:bg-panel-solid after:content-['']"
              >
                {text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
