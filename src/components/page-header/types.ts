import type { HTMLAttributes, ReactNode } from 'react'
export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  titleClassName?: string
  descriptionClassName?: string
}
