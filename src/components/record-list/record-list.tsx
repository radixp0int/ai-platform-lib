import { Fragment } from 'react'
import type { RecordListProps } from './types'
/** Open grid records. The caller supplies each row's link or selection semantics. */
export function RecordList<T>({
  items,
  columns,
  headerClassName,
  className = 'flex flex-col',
  getKey,
  renderRow,
  empty,
}: RecordListProps<T>) {
  return (
    <div className={className}>
      <div className={headerClassName}>
        {columns.map((column, index) => (
          <span key={index}>{column}</span>
        ))}
      </div>
      {items.map((item, index) => (
        <Fragment key={getKey(item)}>{renderRow(item, index)}</Fragment>
      ))}
      {items.length === 0 && empty}
    </div>
  )
}
