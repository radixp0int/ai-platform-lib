import type { HTMLAttributes, LiHTMLAttributes, OlHTMLAttributes, ReactNode, Ref } from 'react'
import type { LinkProps } from '../link'

/** One step of a trail given as data. */
export type BreadcrumbEntry = {
  label: string
  /**
   * Where it goes. Leave it out for a step that is not a link. The last entry
   * is the page you are on, so it is never a link, whatever it carries.
   */
  href?: string
}

/** `default` reads on the page; `inverse` reads on a dark brand band, such as the top bar. */
export type BreadcrumbsTone = 'default' | 'inverse'

// The landmark's accessible name is `aria-label`, which defaults to "Breadcrumb".
type BreadcrumbsBase = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Where the trail sits. Defaults to `default`. */
  tone?: BreadcrumbsTone
  ref?: Ref<HTMLElement>
}

export type BreadcrumbsProps = BreadcrumbsBase &
  (
    | {
        /**
         * The trail from the top down, rendered for you: a link for each entry
         * that has an `href`, a separator between steps, and the last entry
         * marked as the current page.
         */
        items: BreadcrumbEntry[]
        children?: never
      }
    | {
        items?: never
        /**
         * Compose the pieces yourself — `BreadcrumbList`, `BreadcrumbItem`,
         * `BreadcrumbLink`, `BreadcrumbPage` and `BreadcrumbSeparator` — when
         * a step needs more than a label and a link.
         */
        children: ReactNode
      }
  )

export type BreadcrumbListProps = OlHTMLAttributes<HTMLOListElement> & {
  ref?: Ref<HTMLOListElement>
}
export type BreadcrumbItemProps = LiHTMLAttributes<HTMLLIElement> & { ref?: Ref<HTMLLIElement> }
/** A link that goes through the host's `NavigateProvider`, so a client-side router can take the click. */
export type BreadcrumbLinkProps = Omit<LinkProps, 'variant'>
export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement> & { ref?: Ref<HTMLSpanElement> }
export type BreadcrumbSeparatorProps = LiHTMLAttributes<HTMLLIElement> & {
  ref?: Ref<HTMLLIElement>
}
