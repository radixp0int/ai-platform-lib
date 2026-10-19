import { IconButton } from '../../primitives/icon-button'
import { XIcon } from '../../primitives/icons'
import type { PanelProps } from './types'

/**
 * A docked side panel's frame: a title, a close button, and whatever is being
 * looked at. One copy, so two panels that show different things in the same
 * place cannot drift apart.
 *
 * It fills its container and brings no width of its own; put it in a
 * `CollapsiblePanel` or a sized column. The body is the children, which own
 * their padding and scrolling so a footer can be pinned.
 */
export function Panel({
  title,
  onClose,
  actions,
  children,
  closeLabel = `Hide ${title.toLowerCase()}`,
  className = '',
}: PanelProps) {
  return (
    <aside
      className={`flex h-full w-full flex-col border-l border-line bg-panel-solid/45 ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b border-line py-3 pr-3.5 pl-5">
        <span className="flex-1 text-[13px] font-bold text-ink-strong">{title}</span>
        {actions}
        <IconButton onClick={onClose} aria-label={closeLabel} title={closeLabel}>
          <XIcon width={14} height={14} />
        </IconButton>
      </div>
      {children}
    </aside>
  )
}
