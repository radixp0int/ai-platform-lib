import { Fragment } from 'react'
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumbs,
} from '../../primitives/breadcrumbs'
import { Link } from '../../primitives/link'
import type { BreadcrumbTrailProps } from './types'
// Where you are, from the top down, as a trail of links ending at the page you
// are on. The primitive's pieces assembled from a list, with links that go
// through the host's `NavigateProvider` so a client-side router handles them.

export function BreadcrumbTrail({
  items,
  label = 'Breadcrumb',
  className = '',
}: BreadcrumbTrailProps) {
  return (
    <Breadcrumbs aria-label={label} className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <Fragment key={`${index}-${item.label}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {last || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <Link variant="plain" href={item.href} className="text-ink-soft hover:underline">
                    {item.label}
                  </Link>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumbs>
  )
}
