import type { MenuStatus } from './types'

/**
 * The dot for each status. `warning` is the attention orange the rail's count
 * uses, `info` the brand blue, and `idle` a hollow ring. Each colour carries its
 * own dark value. Written out in full because Tailwind scans for class names.
 */
export const MENU_STATUS_DOT: Record<MenuStatus, string> = {
  warning: 'bg-notify',
  error: 'bg-danger-fg',
  info: 'bg-brand-fg',
  success: 'bg-success',
  idle: 'bg-transparent shadow-[inset_0_0_0_1.5px_var(--ink-soft)]',
}
