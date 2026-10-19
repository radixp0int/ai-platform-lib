import type { ReactNode } from 'react'

export type PanelProps = {
  title: string
  closeLabel?: string
  className?: string
  onClose: () => void
  /** Controls placed before the close button. Navigation, not content actions. */
  actions?: ReactNode
  children: ReactNode
}
