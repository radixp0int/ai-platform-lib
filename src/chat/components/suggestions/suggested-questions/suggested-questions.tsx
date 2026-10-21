import { useId } from 'react'
import { ArrowRightIcon } from '../../../../primitives/icons'
import type { SuggestedQuestionsProps } from '../types'

/**
 * Today's suggested questions laid out in the open, under the composer on an
 * empty conversation. There the sparkle menu and suggest-as-you-type are
 * hidden — this is the same list, shown before anyone has to ask for it.
 * Picking one asks it.
 *
 * Rows rather than cards, so the reason each one is suggested can sit beside
 * it, where it reads as a label instead of competing with the question.
 */
export function SuggestedQuestions({
  suggestions,
  onPick,
  limit = 4,
  compact,
  activeIndex = -1,
}: SuggestedQuestionsProps) {
  const headingId = useId()
  const shown = suggestions.slice(0, limit)
  if (shown.length === 0) return null
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="mb-1.5 px-1 text-[11px] font-bold tracking-wider text-ink-soft uppercase"
      >
        Suggested for today
      </h2>
      <ul className="border-b border-line">
        {shown.map((s, i) => {
          const active = i === activeIndex
          return (
            <li key={s.text} className="flex border-t border-line">
              <button
                type="button"
                onClick={() => onPick(s.text)}
                data-active={active || undefined}
                className={`group flex w-full items-center gap-4 rounded-check text-left transition-colors hover:bg-tint/6 ${
                  compact ? 'px-1.5 py-2.5' : 'px-2 py-3'
                }`}
              >
                <span
                  className={`min-w-0 flex-1 transition-colors ${compact ? 'text-[13px]' : 'text-[15px]'} ${
                    active ? 'text-brand-fg' : 'text-ink-strong'
                  }`}
                >
                  {s.text}
                </span>
                {s.reason && !compact && (
                  <span className="hidden shrink-0 text-[12.5px] text-ink-soft sm:inline">
                    {s.reason}
                  </span>
                )}
                <ArrowRightIcon
                  width={16}
                  height={16}
                  className={`shrink-0 transition group-hover:translate-x-0.5 ${
                    active ? 'text-brand-fg' : 'text-ink-soft'
                  }`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
