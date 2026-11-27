import type { AlertTone } from '../../primitives/alert'

/**
 * A row's state, drawn as a 3px accent edge down its left side. The same names
 * `Alert` takes, so a failed row and the error alert above it agree.
 */
export type RowTone = AlertTone

/**
 * The edge for each tone, as an inset shadow so it takes no layout: the cells
 * stay exactly where an untoned row puts them. The colours are `Alert`'s edge
 * colours, which carry their own dark values: warning is the caution amber,
 * error the danger red.
 *
 * Written out in full because Tailwind scans source text for class names.
 */
export const ROW_TONE_EDGE: Record<RowTone, string> = {
  info: 'shadow-[inset_3px_0_0_var(--brand-fg)]',
  success: 'shadow-[inset_3px_0_0_var(--success-fg)]',
  warning: 'shadow-[inset_3px_0_0_var(--caution)]',
  error: 'shadow-[inset_3px_0_0_var(--danger-fg)]',
}
