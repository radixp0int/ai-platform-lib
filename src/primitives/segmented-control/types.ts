import type { ReactNode } from 'react'
export type SegmentedControlProps = {
  label: string
  value: string
  options: { value: string; label: ReactNode; disabled?: boolean }[]
  onValueChange: (value: string) => void
  /**
   * `inverse` draws the control for a brand band (PageBand's date range): a
   * translucent white track, pale labels, and the chosen segment in white.
   */
  tone?: 'default' | 'inverse'
  className?: string
}
