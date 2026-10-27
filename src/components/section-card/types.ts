import type { ReactNode } from 'react'

export type SectionCardProps = {
  title: ReactNode
  /** One line under the title. */
  description?: ReactNode
  /** One control at the end of the header, such as a button. */
  action?: ReactNode
  children: ReactNode
  /** A strip under the content: a legend, a line of meta text. */
  footer?: ReactNode
  /** The heading's level. Defaults to 2. */
  headingLevel?: 2 | 3 | 4
  /** Classes for the content area. It has none of its own, so content can run to the edge. */
  bodyClassName?: string
  className?: string
}
