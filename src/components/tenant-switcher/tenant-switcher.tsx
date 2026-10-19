import { withDefaults } from '../../lib/withDefaults'
import { useMemo, useState } from 'react'
import { Avatar } from '../../primitives/avatar'
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, PencilIcon } from '../../primitives/icons'
import { Popover } from '../../primitives/popover'
import { SearchField } from '../../primitives/search-field'
import type { TenantSwitcherProps } from './types'

const tile =
  'grid shrink-0 place-items-center rounded-control bg-brand-50 font-extrabold text-brand-950'

/**
 * The tenant control in the top bar: the current tenant's name on a button,
 * and a searchable list of the others underneath it.
 *
 * The three actions — load more, view all, edit — are each drawn only when
 * their handler is passed. A member of two tenants gets a plain list; a
 * platform admin with a hundred gets paging and a way to the full table. The
 * component is the same in both, which is why none of them is a mode.
 */
export function TenantSwitcher({
  tenants,
  currentId,
  onSelect,
  remaining = 0,
  pageSize = 10,
  onLoadMore,
  onViewAll,
  onEditTenant,
  readOnly = false,
  labels: overrides,
  popoverWidth = 400,
  className = '',
}: TenantSwitcherProps) {
  const labels = withDefaults(
    {
      choose: 'Choose a tenant',
      title: 'Tenants',
      search: 'Find a tenant',
      current: 'Current tenant',
      viewAll: 'View all tenants',
      edit: (name: string) => `Edit ${name}`,
      trigger: (name: string | undefined) => `Switch tenant. Current tenant: ${name ?? 'none'}`,
      readOnly: (name: string | undefined) => `Tenant: ${name ?? 'none'}`,
      empty: (query: string, hasMore: boolean) =>
        `No loaded tenant matches “${query}”.${hasMore ? ' Load more, or open the full list.' : ''}`,
      loadMore: (n: number) => `Load ${n} more`,
      remaining: (n: number) => `${n} more. Searching is usually quicker.`,
    },
    overrides,
  )
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const current = tenants.find((tenant) => tenant.id === currentId)
  const term = query.trim().toLocaleLowerCase()
  const shown = useMemo(
    () =>
      term ? tenants.filter((tenant) => tenant.name.toLocaleLowerCase().includes(term)) : tenants,
    [tenants, term],
  )
  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const face = (
    <>
      <Avatar
        variant="text"
        text={current?.initials ?? '–'}
        shape="square"
        size={28}
        style={{ fontSize: 11 }}
        aria-hidden
        className={tile}
      ></Avatar>
      <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">
        {current?.name ?? labels.choose}
      </span>
    </>
  )

  if (readOnly) {
    return (
      <span
        aria-label={labels.readOnly(current?.name)}
        className={`mx-1 flex h-11 max-w-64 items-center gap-2.5 rounded-control border border-white/20 pr-3.5 pl-2 text-white ${className}`}
      >
        {face}
      </span>
    )
  }

  return (
    <>
      <button
        ref={setTrigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={labels.trigger(current?.name)}
        onClick={() => (open ? close() : setOpen(true))}
        className={`mx-1 flex h-11 w-64 min-w-0 shrink items-center gap-2.5 rounded-control border pr-2.5 pl-2 text-white transition max-md:w-auto ${
          open ? 'border-white/70 bg-white/20' : 'border-white/20 bg-white/10 hover:bg-white/15'
        } ${className}`}
      >
        {face}
        <ChevronDownIcon
          width={16}
          height={16}
          className={`shrink-0 text-brand-100 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <Popover
        anchor={trigger}
        open={open}
        onClose={close}
        label={labels.trigger(current?.name)}
        width={popoverWidth}
        align="end"
      >
        <SearchField
          label={labels.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.search}
        />

        <p className="flex items-baseline gap-2 px-3 pt-3 pb-1 text-xs text-ink-soft">
          <span className="font-semibold">{labels.title}</span>
          {remaining > 0 && !term && (
            <span className="tabular-nums">
              {tenants.length} of {tenants.length + remaining}
            </span>
          )}
        </p>

        <ul className="flex flex-col gap-0.5">
          {shown.map((tenant) => {
            const isCurrent = tenant.id === currentId
            return (
              <li
                key={tenant.id}
                className={`group flex items-center gap-1 rounded-control pr-1 transition ${
                  isCurrent ? 'bg-tint/5' : 'hover:bg-tint/5'
                }`}
              >
                <button
                  type="button"
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => {
                    close()
                    if (!isCurrent) onSelect(tenant.id)
                  }}
                  className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-control pl-3 text-left"
                >
                  <Avatar
                    variant="text"
                    text={tenant.initials}
                    shape="square"
                    size={32}
                    style={{ fontSize: 12 }}
                    aria-hidden
                    className={`grid size-8 shrink-0 place-items-center rounded-control text-xs font-extrabold ${
                      isCurrent ? 'bg-brand-solid text-on-brand-solid' : 'bg-chip text-chip-fg'
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink-strong">
                      {tenant.name}
                    </span>
                    {tenant.description && (
                      <span className="block truncate text-xs text-ink-soft">
                        {tenant.description}
                      </span>
                    )}
                  </span>
                </button>
                {isCurrent ? (
                  <span className="grid size-11 shrink-0 place-items-center text-brand-fg">
                    <CheckIcon width={18} height={18} strokeWidth={2} aria-hidden={false} />
                    <span className="sr-only">{labels.current}</span>
                  </span>
                ) : (
                  onEditTenant && (
                    <button
                      type="button"
                      aria-label={labels.edit(tenant.name)}
                      title={labels.edit(tenant.name)}
                      onClick={() => {
                        close()
                        onEditTenant(tenant.id)
                      }}
                      className="grid size-11 shrink-0 place-items-center rounded-control text-ink-soft opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-tint/8 hover:text-ink-strong focus-visible:opacity-100"
                    >
                      <PencilIcon width={16} height={16} />
                    </button>
                  )
                )}
              </li>
            )
          })}
        </ul>

        {shown.length === 0 && (
          <p className="px-3 py-4 text-[13px] text-ink-soft">
            {labels.empty(query.trim(), remaining > 0)}
          </p>
        )}

        {onLoadMore && remaining > 0 && !term && (
          <div className="flex shrink-0 flex-col gap-1.5 px-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onLoadMore}
              className="h-11 rounded-control border border-line bg-panel-solid text-sm font-bold text-ink-strong transition hover:bg-tint/8"
            >
              {labels.loadMore(Math.min(pageSize, remaining))}
            </button>
            <span className="text-xs text-ink-soft">{labels.remaining(remaining)}</span>
          </div>
        )}

        {onViewAll && (
          <div className="mt-1.5 shrink-0 border-t border-line px-3 pt-1">
            <button
              type="button"
              onClick={() => {
                close()
                onViewAll()
              }}
              className="flex h-11 items-center gap-1 text-sm font-bold text-accent-fg hover:underline"
            >
              {labels.viewAll}
              <ChevronRightIcon width={16} height={16} />
            </button>
          </div>
        )}
      </Popover>
    </>
  )
}
