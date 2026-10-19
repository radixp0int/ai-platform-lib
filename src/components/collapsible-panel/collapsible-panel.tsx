import type { CollapsiblePanelProps } from './types'

/**
 * A side panel that collapses by animating its width.
 *
 * It animates rather than unmounting so whatever sits between two panels
 * reflows smoothly — a canvas re-measures as it goes instead of snapping. The
 * inner element keeps the panel's full width throughout, so its contents don't
 * reflow while the wrapper shrinks around them.
 *
 * `gutter` is for a panel sitting in a flex row with a gap: a closed panel
 * still leaves its share of that gap behind, so the wrapper pulls it back with
 * a negative margin on the side the gap is on.
 */
export function CollapsiblePanel({ open, width, gutter, children }: CollapsiblePanelProps) {
  return (
    <div
      className={`shrink-0 overflow-hidden transition-[width,margin] duration-300 ease-out ${
        open ? width : `w-0 ${gutter ?? ''}`
      }`}
    >
      <div className={`h-full ${width}`}>{children}</div>
    </div>
  )
}
