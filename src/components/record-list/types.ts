import type { ReactNode } from 'react'
export type RecordListProps<T> = {
  items: readonly T[]
  columns: readonly ReactNode[]
  headerClassName: string
  className?: string
  getKey: (item: T) => string
  renderRow: (item: T, index: number) => ReactNode
  empty?: ReactNode
}
