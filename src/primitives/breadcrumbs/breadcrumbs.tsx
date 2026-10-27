import { Fragment } from 'react'
import { ChevronRightIcon } from '../icons'
import { Link } from '../link'
import type {
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbsProps,
} from './types'

const join = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ')

// The tone lives on the landmark as `data-tone`, and the pieces read it through
// the `group/crumbs` variant, so a trail can be composed by hand and still match.
const stepColour = 'text-ink-soft group-data-[tone=inverse]/crumbs:text-brand-200'

/**
 * A location trail: a `nav` landmark holding an ordered list of steps, the last
 * of which is the page you are on.
 *
 * Pass `items` and it draws the trail. Pass children and you compose it from
 * the pieces below. Page actions stay siblings of the trail, never inside it.
 */
export function Breadcrumbs({
  items,
  tone = 'default',
  className = '',
  children,
  ...rest
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-tone={tone}
      className={join('group/crumbs min-w-0', className)}
      {...rest}
    >
      {items ? (
        <BreadcrumbList>
          {items.map((item, index) => {
            const last = index === items.length - 1
            return (
              <Fragment key={`${index}-${item.label}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className={last ? undefined : 'max-w-full shrink-0'}>
                  {last ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink href={item.href} className="truncate">
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <span className={join('truncate', stepColour)}>{item.label}</span>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      ) : (
        children
      )}
    </nav>
  )
}

export function BreadcrumbList({ className = '', ...rest }: BreadcrumbListProps) {
  return (
    <ol
      className={join(
        'flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]',
        className,
      )}
      {...rest}
    />
  )
}

export function BreadcrumbItem({ className = '', ...rest }: BreadcrumbItemProps) {
  return <li className={join('inline-flex min-w-0 items-center', className)} {...rest} />
}

export function BreadcrumbLink({ className = '', ...rest }: BreadcrumbLinkProps) {
  return (
    <Link
      variant="plain"
      className={join(
        'rounded-sm underline-offset-4 transition-colors',
        stepColour,
        'hover:text-ink hover:underline group-data-[tone=inverse]/crumbs:hover:text-white',
        className,
      )}
      {...rest}
    />
  )
}

export function BreadcrumbPage({ className = '', ...rest }: BreadcrumbPageProps) {
  return (
    <span
      aria-current="page"
      className={join(
        'truncate font-medium text-ink group-data-[tone=inverse]/crumbs:text-white',
        className,
      )}
      {...rest}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  className = '',
  ...rest
}: BreadcrumbSeparatorProps) {
  return (
    <li
      {...rest}
      role="presentation"
      aria-hidden="true"
      className={join('inline-grid shrink-0 place-items-center', stepColour, className)}
    >
      {children ?? <ChevronRightIcon width={12} height={12} />}
    </li>
  )
}
