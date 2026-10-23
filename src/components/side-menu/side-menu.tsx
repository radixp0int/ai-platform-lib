import { MenuItem } from './menu-item'
import { RailItem } from './rail-item'
import { useSideMenuSlots } from './slot-context'
import type { SideMenuProps } from './types'

/**
 * The platform's side menu: small labelled groups of destinations, each able
 * to open into its sub-sections, and the whole thing able to fold to an icon
 * rail that still works.
 *
 * In the rail, an item with sub-sections opens them in a flyout beside its
 * icon rather than expanding in place — there is no room in 64px — and an item
 * without any is a plain link with a tooltip for its name.
 *
 * It is also the one place a page's own navigation lives: a page adds a
 * section under the destinations with `InSideMenu`, in both modes.
 */
export function SideMenu({
  sections,
  activeId,
  mode = 'expanded',
  label = 'Main',
  openIds,
  onOpenIdsChange,
  onNavigate,
  className = '',
}: SideMenuProps) {
  const rail = mode === 'rail'
  const slots = useSideMenuSlots()
  const toggle = (id: string) =>
    onOpenIdsChange(openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id])

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-y-auto border-r border-line bg-panel-solid ${
        rail ? 'w-16 items-center px-0 py-3' : 'w-62 p-3'
      } ${className}`}
    >
      <nav aria-label={label} className={`flex flex-col gap-0.5 ${rail ? 'items-center' : ''}`}>
        {sections.map((section, index) => (
          <div key={section.id} className={`flex flex-col gap-0.5 ${rail ? 'items-center' : ''}`}>
            {index > 0 &&
              (rail ? (
                <span aria-hidden className="my-2 h-px w-7 bg-line" />
              ) : (
                section.label && (
                  <h2 className="px-2.5 pt-4 pb-1.5 text-xs font-semibold text-ink-soft">
                    {section.label}
                  </h2>
                )
              ))}
            {section.items.map((item) =>
              rail ? (
                <RailItem key={item.id} item={item} activeId={activeId} onNavigate={onNavigate} />
              ) : (
                <MenuItem
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  open={openIds.includes(item.id)}
                  onToggle={() => toggle(item.id)}
                  onNavigate={onNavigate}
                />
              ),
            )}
          </div>
        ))}
      </nav>
      {/* Where a page adds its own section — see InSideMenu. Empty, it takes no room. */}
      {rail ? (
        <div
          ref={slots?.setRail}
          className="flex w-full flex-1 flex-col items-center empty:hidden"
        />
      ) : (
        <div ref={slots?.setExpanded} className="flex min-h-0 flex-1 flex-col empty:hidden" />
      )}
    </aside>
  )
}
