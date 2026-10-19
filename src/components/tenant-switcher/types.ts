/** What the switcher needs to draw one tenant. It knows nothing about spaces
 *  or status — `description` is whatever one line the host wants under the name. */
export type TenantOption = {
  id: string
  name: string
  initials: string
  description?: string
}

export type TenantSwitcherLabels = {
  choose: string
  title: string
  search: string
  current: string
  edit: (name: string) => string
  trigger: (name: string | undefined) => string
  readOnly: (name: string | undefined) => string
  empty: (query: string, hasMore: boolean) => string
  loadMore: (count: number) => string
  remaining: (count: number) => string
  viewAll: string
}

export type TenantSwitcherProps = {
  labels?: Partial<TenantSwitcherLabels>
  popoverWidth?: number
  className?: string
  /** The tenants fetched so far, in the order to list them. */
  tenants: TenantOption[]
  currentId: string
  onSelect: (id: string) => void
  /** How many more exist beyond `tenants`. Read by the footer's count. */
  remaining?: number
  /** What one "more" fetches. The button names it, so it must be true. */
  pageSize?: number
  /** Optional: draws "Load N more" while `remaining` is above zero. */
  onLoadMore?: () => void
  /** Optional: draws "View all tenants" in the footer. */
  onViewAll?: () => void
  /** Optional: draws an edit control on each row but the current one. */
  onEditTenant?: (id: string) => void
  /** Shows the tenant as a fixed label — inside a wizard, where switching
   *  would abandon the work in progress. */
  readOnly?: boolean
}
