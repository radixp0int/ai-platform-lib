import type { ReactNode } from 'react'

/**
 * Loading keeps the frame and the column widths — only the cell contents go
 * grey. Swapping the whole table for a spinner throws away the one thing the
 * reader already knows (where the columns are) and makes every load feel like
 * a navigation.
 *
 * The bars fade down the list rather than shimmering. A shimmer on a dozen
 * rows at once is a lot of motion for something that usually lasts 200ms, and
 * it is the first thing to look broken under `prefers-reduced-motion`.
 */
export function SkeletonRows({
  rows,
  columns,
  cellClasses = [],
}: {
  rows: number
  columns: number
  /** One class string per column — the table's `hideBelow` classes, so a hidden column stays hidden here too. */
  cellClasses?: string[]
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-line/70 last:border-b-0">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className={`h-13 px-4 ${cellClasses[c] ?? ''}`}>
              <span
                className="block h-2.5 rounded-full bg-ink-soft"
                style={{
                  width: `${[74, 58, 66, 44, 60][(r + c) % 5]}%`,
                  opacity: Math.max(0.05, 0.16 - r * 0.02),
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/**
 * A message in place of the rows: empty, no matches, or an error.
 *
 * It keeps the header and the frame, and it is never shorter than `minHeight`
 * (a little over seven rows by default). A table that collapses to a thin strip
 * when nothing comes back makes the page jump, and looks broken next to the
 * same table loading, which draws its rows at full height.
 *
 * Says why it is empty and offers the way forward. "No results" on its own is a
 * dead end: the reader has to work out which of their filters did it.
 */
export function StateRow({
  colSpan,
  icon,
  tone = 'brand',
  title,
  body,
  actions,
  minHeight,
}: {
  colSpan: number
  icon?: ReactNode
  /** `danger` for a load that failed. */
  tone?: 'brand' | 'danger'
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
  /** A CSS length, or `none`. */
  minHeight?: string
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <div
          role={tone === 'danger' ? 'alert' : undefined}
          className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
          style={minHeight && minHeight !== 'none' ? { minHeight } : undefined}
        >
          {icon && (
            <span
              aria-hidden="true"
              className={[
                'grid size-11 place-items-center rounded-[12px]',
                tone === 'danger' ? 'bg-danger/10 text-danger-fg' : 'bg-chip text-chip-fg',
              ].join(' ')}
            >
              {icon}
            </span>
          )}
          <span className="text-[15.5px] font-extrabold text-ink-strong">{title}</span>
          {body && (
            <div className="max-w-[46ch] text-[13.5px] leading-relaxed text-ink-soft">{body}</div>
          )}
          {actions && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{actions}</div>
          )}
        </div>
      </td>
    </tr>
  )
}

/** The plain empty state: a title, and optionally a line under it. */
export function EmptyRow({
  colSpan,
  title,
  body,
  minHeight,
}: {
  colSpan: number
  title: string
  body?: ReactNode
  minHeight?: string
}) {
  return <StateRow colSpan={colSpan} title={title} body={body} minHeight={minHeight} />
}
