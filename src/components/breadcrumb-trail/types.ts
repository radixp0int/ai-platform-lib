export type BreadcrumbTrailItem = {
  label: string
  /** Where it goes. Leave it out for the page you are on, which is always the last. */
  href?: string
}

export type BreadcrumbTrailProps = {
  /** From the top down. The last is the current page, so it is not a link. */
  items: BreadcrumbTrailItem[]
  /** What the trail is, for someone who cannot see it. Defaults to "Breadcrumb". */
  label?: string
  className?: string
}
