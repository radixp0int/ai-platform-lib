import { useId } from 'react'
import { FeedbackIcon } from '../../primitives/icons'
import { Link } from '../../primitives/link'
import type { FeedbackTabProps } from './types'

/**
 * A slim orange tab on the right edge of the page that reads "Feedback"
 * down its length. On hover or keyboard focus it slides out to say what it
 * does ("Report a bug"); a click hands off to the host's report form.
 *
 * Colour: `--feedback` / `--on-feedback`, its own contrast-checked pair. It
 * is deliberately not `--notify`: in this brand orange on `--notify` means
 * "a person is being waited on", and a report tab is not that.
 *
 * How it opens: the tab is `w-max` with a 30px `max-width`, and hover or
 * focus raises the cap. The slide-out text sits in a `min-w-0` box that
 * shrinks to nothing when closed. Its padding lives on the inner span, not
 * on the box, because padding cannot shrink: on the box it would push the
 * vertical label off the edge.
 *
 * The slide-out text is `aria-hidden` and wired as the description instead,
 * so a screen reader hears "Feedback, button, Report a bug. Tell us what
 * went wrong" once rather than the words twice.
 */
export function FeedbackTab({
  onClick,
  href,
  onNavigate,
  newTab = false,
  label = 'Feedback',
  title = 'Report a bug',
  description = 'Tell us what went wrong',
  anchor = 'viewport',
  expanded = false,
  className = '',
}: FeedbackTabProps) {
  const id = useId()
  // Each line by its own id, so the description reads "Report a bug Tell us
  // what went wrong" with a space, not the two lines run together.
  const describedBy = description ? `${id}-title ${id}-description` : `${id}-title`

  const cls = [
    anchor === 'viewport' ? 'fixed' : 'absolute',
    'top-1/2 right-0 z-30 flex w-max -translate-y-1/2 items-stretch overflow-hidden',
    'rounded-l-surface bg-feedback text-on-feedback shadow-lg shadow-(color:--shadow-raised)',
    'transition-[max-width] duration-200 ease-out motion-reduce:transition-none',
    expanded ? 'max-w-80' : 'max-w-[30px] hover:max-w-80 focus-visible:max-w-80',
    'cursor-pointer print:hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span aria-hidden="true" className="flex min-w-0 flex-1 items-center overflow-hidden">
        <span className="flex flex-col items-start gap-0.5 py-3 pr-1 pl-4 text-left whitespace-nowrap">
          <span id={`${id}-title`} className="text-sm leading-[18px] font-bold">
            {title}
          </span>
          {description ? (
            <span id={`${id}-description`} className="text-xs leading-4">
              {description}
            </span>
          ) : null}
        </span>
      </span>
      <span className="flex w-[30px] shrink-0 flex-col items-center justify-center gap-2 py-4">
        <FeedbackIcon width={15} height={15} strokeWidth={2.2} className="shrink-0" />
        <span className="rotate-180 text-[13px] leading-none font-bold tracking-[0.04em] whitespace-nowrap [writing-mode:vertical-rl]">
          {label}
        </span>
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        variant="plain"
        href={href}
        onNavigate={onNavigate}
        aria-describedby={describedBy}
        className={cls}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} aria-describedby={describedBy} className={cls}>
      {content}
    </button>
  )
}
