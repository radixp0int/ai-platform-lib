import type { ReactNode } from 'react'

/**
 * The card a list page's grid sits in, lifted over the bottom of the
 * `PageBand`: a heading, a line under it ("14 connected, 1 failing"), then
 * the grid.
 */
export function GridCard({
  id,
  title,
  line,
  children,
}: {
  /** The heading's id; the card is labelled by it. */
  id: string
  title: string
  line: ReactNode
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-3.5 rounded-[14px] bg-panel-solid p-[18px] shadow-[0_0_0_1px_var(--line),0_18px_40px_-22px_var(--shadow-menu)] max-sm:p-3"
    >
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="text-[15px] font-extrabold text-ink-strong">
          {title}
        </h2>
        <p className="text-[12.5px] text-ink-soft tabular-nums">{line}</p>
      </div>
      {children}
    </section>
  )
}
