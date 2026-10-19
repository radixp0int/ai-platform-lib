import { Link } from '../../primitives/link'
import { Orb } from '../../primitives/orb'
import type { TopBarProps } from './types'

/**
 * The bar across the top of every platform page.
 *
 * It is layout and nothing else: a logo that goes home, and three slots. What
 * fills them — the pinned pages, the tenant switcher, the account menu — are
 * separate components that know nothing about the bar, so a focused flow can
 * swap the tabs for a title and the switcher for a fixed label without the bar
 * having a mode for it.
 *
 * Solid brand navy in light mode. Dark mode drops to the panel colour with a
 * hairline, because a navy band on a navy canvas reads as a rendering fault.
 */
export function TopBar({
  appName,
  homeHref,
  onNavigate,
  leading,
  children,
  trailing,
}: TopBarProps) {
  return (
    <header className="flex h-15 shrink-0 items-center bg-brand-900 pr-3 pl-2.5 text-white dark:border-b dark:border-line dark:bg-panel-solid">
      {leading}
      <Link
        variant="plain"
        href={homeHref}
        aria-label={`${appName}, go to Home`}
        onNavigate={onNavigate}
        className="ml-2.5 flex h-11 shrink-0 items-center gap-2.5 rounded-control px-2 transition hover:bg-white/10"
      >
        <Orb aria-hidden className="orb block size-6 rounded-full" />
        <span className="text-[17px] font-bold tracking-tight max-sm:hidden">{appName}</span>
      </Link>
      <span aria-hidden className="mx-3 h-6 w-px shrink-0 bg-white/20" />
      {children}
      <span className="min-w-2 flex-1" />
      {trailing}
    </header>
  )
}
