import { useState } from 'react'
import { PinnedPages, type PinnedPage } from '../../components/pinned-pages'
import { flattenMenu } from '../../components/side-menu'
import { TenantSwitcher } from '../../components/tenant-switcher'
import { TopBar, TopBarButton } from '../../components/top-bar'
import { buildMenu } from '../../fixtures/platform/menu'
import { INITIAL_TENANTS, describeSpaces } from '../../fixtures/platform/tenants'
import { APP_NAME } from '../../fixtures/platform/user'
import { BellIcon, SearchIcon, SideMenuIcon, XIcon } from '../../primitives/icons'
import { AccountButton } from './account-button'
export function TopBarRecipe({
  wizard = false,
  admin = false,
}: {
  wizard?: boolean
  admin?: boolean
}) {
  const [currentId, setCurrentId] = useState(INITIAL_TENANTS[0].id)
  const [count, setCount] = useState(admin ? 6 : 2)
  const tenant = INITIAL_TENANTS.find((t) => t.id === currentId)!
  const destinations = flattenMenu(buildMenu(tenant, 2))
  const [pages, setPages] = useState<PinnedPage[]>(
    destinations.filter((d) => ['tasks', 'runs', 'chat'].includes(d.id)),
  )
  return (
    <TopBar
      appName={APP_NAME}
      homeHref={`/t/${currentId}/home`}
      leading={
        <TopBarButton aria-label={wizard ? 'Close source' : 'Toggle menu'}>
          {wizard ? <XIcon width={20} height={20} /> : <SideMenuIcon width={20} height={20} />}
        </TopBarButton>
      }
      trailing={
        <>
          <TenantSwitcher
            tenants={INITIAL_TENANTS.slice(0, count).map((t) => ({
              ...t,
              description: describeSpaces(t.spaces),
            }))}
            currentId={currentId}
            onSelect={setCurrentId}
            readOnly={wizard}
            remaining={admin ? INITIAL_TENANTS.length - count : 0}
            pageSize={6}
            onLoadMore={
              admin ? () => setCount((n) => Math.min(INITIAL_TENANTS.length, n + 6)) : undefined
            }
            onViewAll={admin ? () => {} : undefined}
            onEditTenant={admin ? () => {} : undefined}
          />
          {!wizard && (
            <>
              <TopBarButton aria-label="Search (not available yet)" aria-disabled>
                <SearchIcon width={20} height={20} />
              </TopBarButton>
              <TopBarButton aria-label="Notifications">
                <BellIcon width={20} height={20} />
              </TopBarButton>
            </>
          )}
          <AccountButton onOpenUserSettings={() => {}} onOpenFeatureToggles={() => {}} />
        </>
      }
    >
      {wizard ? (
        <span className="truncate px-2 text-sm font-semibold text-brand-100">
          Ingestion <span aria-hidden>›</span> Add a source
        </span>
      ) : (
        <PinnedPages pages={pages} onPagesChange={setPages} />
      )}
    </TopBar>
  )
}
