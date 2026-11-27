import type { NavigateHandler } from '../../primitives/link'
import { StatusDot } from '../../primitives/status-dot'
import { MenuPanelLabel, MenuPanelRow } from './panel-parts'
import type { MenuDestination, MenuSection, MenuStatus } from './types'

// The destinations a panel lists (`SideMenuPanel.sections`), drawn with the
// same rows a host builds by hand, so a listed page and a hand-made row match.

/**
 * The dot for each status. `warning` is the attention orange the rail's count
 * uses, `info` the brand blue, and `idle` a hollow ring. Each colour carries its
 * own dark value. Written out in full because Tailwind scans for class names.
 */
const MENU_STATUS_DOT: Record<MenuStatus, string> = {
  warning: 'bg-notify',
  error: 'bg-danger-fg',
  info: 'bg-brand-fg',
  success: 'bg-success',
  idle: 'bg-transparent shadow-[inset_0_0_0_1.5px_var(--ink-soft)]',
}

type Props = {
  sections: MenuSection[]
  activeId?: string
  onNavigate?: NavigateHandler
}

export function MenuPanelDestinations({ sections, activeId, onNavigate }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      {sections.map((section) => (
        <div key={section.id} className="flex flex-col gap-0.5">
          {section.label && <MenuPanelLabel>{section.label}</MenuPanelLabel>}
          {section.items.map((item) => (
            <Destination key={item.id} item={item} activeId={activeId} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** One row, and under it its children: indented, behind a thin rule. */
function Destination({
  item,
  activeId,
  onNavigate,
}: {
  item: MenuDestination
  activeId?: string
  onNavigate?: NavigateHandler
}) {
  const children = item.children ?? []
  return (
    <>
      <MenuPanelRow
        href={item.href}
        name={item.label}
        sub={item.description}
        count={item.badge || undefined}
        current={item.id === activeId}
        onNavigate={onNavigate}
        leading={
          item.status && (
            <StatusDot
              data-status={item.status}
              className={`size-[7px] shrink-0 ${MENU_STATUS_DOT[item.status]}`}
            />
          )
        }
      />
      {children.length > 0 && (
        <div
          role="group"
          aria-label={item.label}
          className="ml-5 flex flex-col gap-0.5 border-l border-line"
        >
          {children.map((child) => (
            <Destination key={child.id} item={child} activeId={activeId} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </>
  )
}
