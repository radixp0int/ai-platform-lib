import type { ReactNode } from 'react'

export type CollapsiblePanelProps = {
  open: boolean
  /** Tailwind width class, e.g. `w-72`. Applied to the wrapper and the inner element. */
  width: string
  /** Negative-margin class that swallows the flex gap when closed, e.g. `-mr-4`. */
  gutter?: string
  children: ReactNode
}
