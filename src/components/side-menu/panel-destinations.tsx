import type { NavigateHandler } from '../../primitives/link'
import { StatusDot } from '../../primitives/status-dot'
import { MenuPanelLabel, MenuPanelRow } from './panel-parts'
import { MENU_STATUS_DOT } from './status-dots'
import type { MenuDestination, MenuSection } from './types'

// The destinations a panel lists (`SideMenuPanel.sections`), drawn with the
// same rows a host builds by hand, so a listed page and a hand-made row match.

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
          // A continuous 1px rule, 13px in; the children's pills sit 6px past
          // it, never touching it, so a child's label starts 20px right of its
          // parent's (13 + 1 + 6). The right edge stays the panel's.
          className="ml-[13px] flex flex-col gap-0.5 border-l border-line pl-1.5"
        >
          {children.map((child) => (
            <Destination key={child.id} item={child} activeId={activeId} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </>
  )
}
