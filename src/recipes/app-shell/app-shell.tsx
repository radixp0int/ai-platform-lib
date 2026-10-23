import { SlideOver } from '../../components/slide-over'
import { NavigateProvider } from '../../primitives/link'
import { HomePage } from './pages/HomePage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { RunsPage } from './pages/RunsPage'
import { TasksPage } from './pages/TasksPage'
import { TenantsPage } from './pages/TenantsPage'
import { WizardPage } from './pages/WizardPage'
// The platform shell: one top bar and one side menu around every page.
//
// It keeps a path in state, builds that tenant's menu, and renders a sample page — or, when the URL names a
// space the tenant does not have, the page that says so. The atoms it composes
// (TopBar, PinnedPages, TenantSwitcher, SideMenu) take data and
// callbacks and know nothing of the router; this file is where routing,
// the demo's fixtures meet them.
import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PinnedPages, type PinnedPage } from '../../components/pinned-pages'
import {
  SideMenu,
  SideMenuSlotProvider,
  flattenMenu,
  matchDestination,
  parentOf,
  type SideMenuMode,
} from '../../components/side-menu'
import { TenantSwitcher } from '../../components/tenant-switcher'
import { TopBar, TopBarButton } from '../../components/top-bar'
import { buildMenu } from '../../fixtures/platform/menu'
import {
  DEFAULT_TENANT_ID,
  INITIAL_TENANTS,
  SPACE_ORDER,
  describeSpaces,
  type SpaceId,
  type Tenant,
} from '../../fixtures/platform/tenants'
import { APP_NAME } from '../../fixtures/platform/user'
import { runsFor, tasksFor } from '../../fixtures/platform/work'
import { BellIcon, SearchIcon, SideMenuIcon, XIcon } from '../../primitives/icons'
import type { NavigateHandler } from '../../primitives/link'
import { ThemeToggle } from '../../primitives/theme-toggle'
import { FeatureTogglesModal } from '../settings/feature-toggles-modal'
import { DemoFeaturesProvider, useDemoFeatureState } from '../settings/settings-state'
import { UserSettingsModal } from '../settings/user-settings-modal'
import { AccountButton } from '../top-bar/account-button'
import { SpaceUnavailablePage } from './pages/SpaceUnavailablePage'
import { PlatformContext, type PlatformValue } from './platform-context'

const DEFAULT_PINS = ['tasks', 'runs', 'chat']
const MAX_PINS = 3
/** How many tenants the switcher lists before "Load more". */
const SWITCHER_PAGE = 6

/** Pages that bring their own side panel, so the platform menu is not docked
 *  beside them — it opens over the page from the top bar instead. */
const FOCUSED = [/^\/chat(\/|$)/]
/** Below this a docked menu leaves a canvas too little room, so it starts as a rail. */
const TABLET = '(max-width: 1279px)'
/** A wizard: no menu at all, a close button, and the tenant shown as a label. */
const WIZARD = /^\/ingestion\/new(\/|$)/

function useNarrow(): boolean {
  const query = '(max-width: 767px)'
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setNarrow(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return narrow
}

export type SpacePageProps = {
  space: SpaceId
  path: string
  tenant: Tenant
  base: string
  onOpenUserSettings: () => void
  onOpenFeatureToggles: () => void
}
export type AppShellProps = {
  initialPath?: string
  initialMenuMode?: SideMenuMode
  renderSpace?: (props: SpacePageProps) => ReactNode
}
export function AppShell({
  initialPath = `/t/${DEFAULT_TENANT_ID}/home`,
  initialMenuMode,
  renderSpace,
}: AppShellProps) {
  const [pathname, navigate] = useState(initialPath)
  const narrow = useNarrow()
  // Owned here so the chat page and the two settings dialogs share one copy:
  // the dialogs are opened from the top bar, the flags are read by the chat.
  const demo = useDemoFeatureState()
  const [dialog, setDialog] = useState<'user' | 'features' | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS)

  const routeTenantId = /^\/t\/([^/]+)/.exec(pathname)?.[1]
  const [lastTenantId, setLastTenantId] = useState(DEFAULT_TENANT_ID)
  const routeTenant = tenants.find((item) => item.id === routeTenantId)
  // `/tenants` sits outside any tenant, so it keeps the chrome of the last one.
  const tenant = routeTenant ?? tenants.find((item) => item.id === lastTenantId) ?? tenants[0]

  useEffect(() => {
    if (!routeTenant) return
    setLastTenantId(routeTenant.id)
  }, [routeTenant])

  const base = `/t/${tenant.id}`
  const rest = routeTenantId ? pathname.slice(base.length) : ''
  const runs = useMemo(() => runsFor(tenant), [tenant])
  const tasks = useMemo(() => tasksFor(tenant), [tenant])
  const sections = useMemo(() => buildMenu(tenant, tasks.length), [tenant, tasks.length])
  const active = routeTenantId ? matchDestination(sections, pathname) : undefined

  // ── Side menu ────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<SideMenuMode>(
    () => initialMenuMode ?? (window.matchMedia(TABLET).matches ? 'rail' : 'expanded'),
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openIds, setOpenIds] = useState<string[]>([])
  const wizard = WIZARD.test(rest)
  const focused = FOCUSED.some((pattern) => pattern.test(rest))
  const docked = !wizard && !focused && !narrow
  const activeParentId = active ? parentOf(sections, active.id)?.id : undefined

  // Arriving somewhere opens the section it lives in; the user can fold it again.
  useEffect(() => {
    if (activeParentId)
      setOpenIds((ids) => (ids.includes(activeParentId) ? ids : [...ids, activeParentId]))
  }, [activeParentId])
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const onNavigate: NavigateHandler = useCallback(
    (href, event) => {
      event.preventDefault()
      navigate(href)
    },
    [navigate],
  )

  // ── Pinned pages ─────────────────────────────────────────────────────────
  const [pinsByTenant, setPinsByTenant] = useState<Record<string, string[]>>({})
  const pinIds = pinsByTenant[tenant.id] ?? DEFAULT_PINS
  const destinations = useMemo(() => flattenMenu(sections), [sections])
  const toPinned = useCallback(
    (id: string): PinnedPage | undefined => {
      const item = destinations.find((destination) => destination.id === id)
      if (!item) return undefined
      const parent = parentOf(sections, id)
      return {
        id: item.id,
        label: item.label,
        href: item.href,
        icon: item.icon ?? parent?.icon,
        context: parent?.label,
      }
    },
    [destinations, sections],
  )
  // A pin for a space this tenant lost simply does not resolve.
  const pinned = pinIds.flatMap((id) => toPinned(id) ?? []).slice(0, MAX_PINS)
  const setPinned = (pages: PinnedPage[]) => {
    const ids = pages.map((page) => page.id)
    setPinsByTenant((all) => ({ ...all, [tenant.id]: ids }))
  }

  // ── Tenant switcher ──────────────────────────────────────────────────────
  const [loaded, setLoaded] = useState(SWITCHER_PAGE)
  const listed = useMemo(
    () => [tenant, ...tenants.filter((item) => item.id !== tenant.id)].slice(0, loaded),
    [tenant, tenants, loaded],
  )
  const switchTo = (id: string) => {
    const target = tenants.find((item) => item.id === id)
    if (!target) return
    // Stay in the same place when the other tenant has it; its Home when not.
    const segment = rest.split('/')[1] ?? ''
    const keep =
      segment === 'tasks' ||
      (SPACE_ORDER.includes(segment as SpaceId) && target.spaces.includes(segment as SpaceId))
    navigate(`/t/${id}/${keep ? segment : 'home'}`)
  }

  const value: PlatformValue = {
    tenant,
    tenants,
    base,
    runs,
    tasks,
    updateTenant: (id, patch) =>
      setTenants((all) => all.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    go: navigate,
  }

  useEffect(() => {
    if (routeTenantId && !routeTenant) navigate(`${base}/home`)
  }, [routeTenantId, routeTenant, base])
  const space = SPACE_ORDER.find((id) => rest === `/${id}` || rest.startsWith(`/${id}/`))
  const unavailable = space && !tenant.spaces.includes(space) ? space : undefined

  const toggle = docked ? (
    <TopBarButton
      aria-label={mode === 'expanded' ? 'Collapse menu' : 'Expand menu'}
      aria-expanded={mode === 'expanded'}
      onClick={() => setMode(mode === 'expanded' ? 'rail' : 'expanded')}
    >
      <SideMenuIcon width={20} height={20} />
    </TopBarButton>
  ) : (
    <TopBarButton
      aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={drawerOpen}
      active={drawerOpen}
      onClick={() => setDrawerOpen((open) => !open)}
    >
      <SideMenuIcon width={20} height={20} />
    </TopBarButton>
  )

  return (
    <NavigateProvider value={onNavigate}>
      <DemoFeaturesProvider value={demo}>
        <PlatformContext.Provider value={value}>
          <SideMenuSlotProvider>
            <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
              <TopBar
                appName={APP_NAME}
                homeHref={`${base}/home`}
                onNavigate={onNavigate}
                leading={
                  wizard ? (
                    <TopBarButton
                      aria-label="Close and discard this source"
                      onClick={() => navigate(`${base}/ingestion`)}
                    >
                      <XIcon width={20} height={20} />
                    </TopBarButton>
                  ) : (
                    toggle
                  )
                }
                trailing={
                  <>
                    <TenantSwitcher
                      tenants={listed.map((item) => ({
                        id: item.id,
                        name: item.name,
                        initials: item.initials,
                        description:
                          item.status === 'active'
                            ? describeSpaces(item.spaces)
                            : `${item.status === 'pending' ? 'Pending' : 'Suspended'} · ${describeSpaces(item.spaces)}`,
                      }))}
                      currentId={tenant.id}
                      onSelect={switchTo}
                      readOnly={wizard}
                      remaining={tenants.length - listed.length}
                      pageSize={SWITCHER_PAGE}
                      onLoadMore={() => setLoaded((count) => count + SWITCHER_PAGE)}
                      onViewAll={() => navigate('/tenants')}
                      onEditTenant={(id) => navigate(`/tenants?edit=${id}`)}
                    />
                    {!wizard && (
                      <>
                        {/* Search is not built yet. The control keeps its place in
                        the bar so the layout does not shift when it arrives. */}
                        <TopBarButton
                          aria-label="Search (not available yet)"
                          title="Search is not available yet"
                          aria-disabled
                          className="max-sm:hidden"
                        >
                          <SearchIcon width={20} height={20} />
                        </TopBarButton>
                        {/* The one theme switch for every page under this bar, so
                        no page needs to carry its own. Restyled from the
                        primitive's glass disc to sit among the bar's buttons. */}
                        <ThemeToggle className="!size-11 shrink-0 !rounded-control !border-0 !bg-transparent !text-brand-100 !backdrop-filter-none hover:!bg-white/10 hover:!text-white max-sm:hidden" />
                        <TopBarButton
                          aria-label="Notifications"
                          title="Notifications"
                          className="max-sm:hidden"
                        >
                          <BellIcon width={20} height={20} />
                        </TopBarButton>
                      </>
                    )}
                    <AccountButton
                      onOpenUserSettings={() => setDialog('user')}
                      onOpenFeatureToggles={() => setDialog('features')}
                    />
                  </>
                }
              >
                {wizard ? (
                  <span className="truncate px-2 text-sm font-semibold text-brand-100">
                    Ingestion <span aria-hidden>›</span> Add a source
                  </span>
                ) : (
                  <PinnedPages
                    pages={pinned}
                    activeId={active?.id}
                    current={active ? toPinned(active.id) : undefined}
                    onPagesChange={setPinned}
                    onNavigate={onNavigate}
                    max={MAX_PINS}
                  />
                )}
              </TopBar>

              <div className="relative flex min-h-0 flex-1">
                {docked && (
                  <SideMenu
                    sections={sections}
                    activeId={active?.id}
                    mode={mode}
                    openIds={openIds}
                    onOpenIdsChange={setOpenIds}
                    onNavigate={onNavigate}
                  />
                )}
                <SlideOver
                  open={!docked && drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  label="Menu"
                >
                  <SideMenu
                    sections={sections}
                    activeId={active?.id}
                    openIds={openIds}
                    onOpenIdsChange={setOpenIds}
                    onNavigate={onNavigate}
                  />
                </SlideOver>
                {/* The workflow pages were built to fill the viewport (`h-dvh`).
                Under the top bar that is one bar too tall, so here — and only
                here — a full-viewport page is told to fill this box instead.
                Done from the outside so those pages, and their stories, still
                stand on their own. */}
                <div className="relative min-w-0 flex-1 overflow-y-auto [&>.h-dvh]:h-full [&>.min-h-dvh]:min-h-full">
                  {unavailable ? (
                    <SpaceUnavailablePage space={unavailable} />
                  ) : (
                    <Suspense
                      fallback={
                        <div
                          role="status"
                          className="grid h-full place-items-center text-sm text-ink-soft"
                        >
                          Loading…
                        </div>
                      }
                    >
                      {pathname.split('?')[0] === '/tenants' ? (
                        <TenantsPage
                          editId={new URLSearchParams(pathname.split('?')[1]).get('edit')}
                          onClearEdit={() => navigate('/tenants')}
                        />
                      ) : rest === '/home' || !rest ? (
                        <HomePage />
                      ) : rest === '/tasks' ? (
                        <TasksPage />
                      ) : wizard ? (
                        <WizardPage />
                      ) : space ? (
                        (renderSpace?.({
                          space,
                          path: rest,
                          tenant,
                          base,
                          onOpenUserSettings: () => setDialog('user'),
                          onOpenFeatureToggles: () => setDialog('features'),
                        }) ??
                        (space === 'workflows' ? (
                          <RunsPage />
                        ) : (
                          <PlaceholderPage
                            title={
                              active?.label ??
                              (space === 'chat'
                                ? 'Chat'
                                : space === 'insights'
                                  ? 'Insights'
                                  : 'Ingestion')
                            }
                            addSource={space === 'ingestion'}
                          />
                        )))
                      ) : (
                        <PlaceholderPage title="Page unavailable" />
                      )}
                    </Suspense>
                  )}
                </div>
              </div>
            </div>
          </SideMenuSlotProvider>

          <UserSettingsModal open={dialog === 'user'} onClose={() => setDialog(null)} />
          <FeatureTogglesModal open={dialog === 'features'} onClose={() => setDialog(null)} />
        </PlatformContext.Provider>
      </DemoFeaturesProvider>
    </NavigateProvider>
  )
}
