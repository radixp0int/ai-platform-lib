import { withDefaults } from '../../lib/withDefaults'
import { useState } from 'react'
import { PinIcon, XIcon } from '../../primitives/icons'
import { Link } from '../../primitives/link'
import { Popover } from '../../primitives/popover'
import type { PinnedPagesProps } from './types'

/**
 * The user's pinned pages, as tabs in the top bar — the few places someone
 * moves between all day, one click away instead of in separate browser tabs.
 *
 * Fixed at a small number on purpose. A row that grows becomes a second menu;
 * three is a short list a person actually chose. Pinning a fourth is refused
 * until one is removed, and the manager says so rather than silently dropping
 * the oldest.
 */
export function PinnedPages({
  pages,
  activeId,
  current,
  onPagesChange,
  onNavigate,
  max = 3,
  labels: overrides,
  popoverWidth = 348,
}: PinnedPagesProps) {
  const labels = withDefaults(
    {
      title: 'Pinned pages',
      empty: 'Nothing pinned yet. Pin the pages you move between most.',
      note: 'Pinned pages are yours, and each tenant keeps its own.',
      manage: (count: number, max: number, pinned: boolean) =>
        pinned
          ? 'This page is pinned. Manage pinned pages'
          : `Manage pinned pages, ${count} of ${max} pinned`,
      count: (count: number, max: number) => `${count} of ${max}`,
      pin: (name: string) => `Pin ${name}`,
      unpin: (name: string) => `Unpin ${name}`,
      full: (max: number, name: string) => `You can pin ${max} pages. Unpin one to pin ${name}.`,
    },
    overrides,
  )
  const [open, setOpen] = useState(false)
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const shown = pages.slice(0, max)
  const full = shown.length >= max
  const currentPinned = current ? shown.some((page) => page.id === current.id) : false

  return (
    <>
      <nav aria-label={labels.title} className="flex min-w-0 gap-0.5 self-stretch max-lg:hidden">
        {shown.map((page) => {
          const active = page.id === activeId
          return (
            <Link
              key={page.id}
              variant="plain"
              href={page.href}
              aria-current={active ? 'page' : undefined}
              onNavigate={onNavigate}
              className={`flex min-w-0 items-center gap-2 px-3.5 text-sm transition ${
                active
                  ? 'bg-white/8 text-white shadow-[inset_0_-3px_0_currentColor]'
                  : 'text-brand-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              {page.icon && (
                <span aria-hidden className="shrink-0 [&_svg]:size-4">
                  {page.icon}
                </span>
              )}
              <span className="max-w-48 truncate font-bold">{page.label}</span>
              {page.context && <span className="shrink-0 text-[13px]">{page.context}</span>}
            </Link>
          )
        })}
      </nav>

      <button
        ref={setTrigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={labels.manage(shown.length, max, currentPinned)}
        title={labels.title}
        onClick={() => setOpen((value) => !value)}
        className={`ml-1 grid size-11 shrink-0 place-items-center rounded-control transition max-lg:hidden ${
          open ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <PinIcon width={18} height={18} fill={currentPinned ? 'currentColor' : 'none'} />
      </button>

      <Popover
        anchor={trigger}
        open={open}
        onClose={() => setOpen(false)}
        label={labels.title}
        width={popoverWidth}
      >
        <p className="flex items-baseline gap-2 px-3 pt-2 pb-1.5">
          <span className="text-sm font-bold text-ink-strong">{labels.title}</span>
          <span className="text-xs text-ink-soft tabular-nums">
            {labels.count(shown.length, max)}
          </span>
        </p>

        {shown.length === 0 && (
          <p className="px-3 pb-2 text-[13px] text-ink-soft">{labels.empty}</p>
        )}

        <ul className="flex flex-col gap-0.5">
          {shown.map((page) => (
            <li key={page.id} className="flex h-11 items-center gap-2.5 rounded-control pl-3">
              {page.icon && (
                <span aria-hidden className="shrink-0 text-ink-soft [&_svg]:size-4">
                  {page.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-strong">
                {page.label}
                {page.context && (
                  <span className="ml-1.5 font-normal text-ink-soft">{page.context}</span>
                )}
              </span>
              <button
                type="button"
                aria-label={labels.unpin(page.label)}
                title={labels.unpin(page.label)}
                onClick={() => onPagesChange(shown.filter((item) => item.id !== page.id))}
                className="grid size-11 shrink-0 place-items-center rounded-control text-ink-soft transition hover:bg-tint/8 hover:text-ink-strong"
              >
                <XIcon width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>

        {current && !currentPinned && (
          <div className="mt-1.5 flex flex-col gap-2 border-t border-line px-3 pt-3 pb-2">
            <button
              type="button"
              disabled={full}
              onClick={() => onPagesChange([...shown, current])}
              className="flex h-11 items-center justify-center gap-2 rounded-control bg-brand-solid text-sm font-bold text-on-brand-solid transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-tint/5 disabled:text-ink-soft disabled:hover:brightness-100"
            >
              <PinIcon width={16} height={16} />
              {labels.pin(current.label)}
            </button>
            {full && (
              <span className="text-xs leading-normal text-ink-soft">
                {labels.full(max, current.label)}
              </span>
            )}
          </div>
        )}

        <p className="px-3 pt-1 pb-1.5 text-xs leading-normal text-ink-soft">{labels.note}</p>
      </Popover>
    </>
  )
}
