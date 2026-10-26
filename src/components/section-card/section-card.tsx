import { useId } from 'react'
import type { SectionCardProps } from './types'
// A bordered section of a page: a header with a title, a line under it and one
// action, then the content, then an optional strip under that. The frame several
// pages repeat by hand, drawn once so the headers line up.
//
// The content area has no padding of its own, so a picture or a table can run to
// the edge of the card; give it `bodyClassName` where it should sit inset.

export function SectionCard({
  title,
  description,
  action,
  children,
  footer,
  headingLevel = 2,
  bodyClassName = '',
  className = '',
}: SectionCardProps) {
  const id = useId()
  const Heading = `h${headingLevel}` as const
  return (
    <section
      aria-labelledby={id}
      className={`flex min-w-0 flex-col overflow-hidden rounded-dialog border border-line ${className}`}
    >
      <div className="flex min-h-15 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-2 pr-3 pl-5">
        <div className="flex min-w-[min(100%,16rem)] flex-1 flex-col">
          <Heading id={id} className="m-0 text-[15px] font-bold text-ink-strong">
            {title}
          </Heading>
          {description && <span className="text-[12.5px] text-ink-soft">{description}</span>}
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <div className="border-t border-line px-5 py-3 text-[12.5px] text-ink">{footer}</div>
      )}
    </section>
  )
}
