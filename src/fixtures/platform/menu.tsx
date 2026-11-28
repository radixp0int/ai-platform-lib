import type { MenuDestination, MenuSection } from '../../components/side-menu'
import {
  ChatIcon,
  HomeIcon,
  IngestionIcon,
  InsightsIcon,
  TasksIcon,
  WorkflowIcon,
} from '../../primitives/icons'
import type { SpaceId, Tenant } from './tenants'

export function buildMenu(tenant: Tenant, waiting: number): MenuSection[] {
  const base = `/t/${tenant.id}`
  const has = (space: SpaceId) => tenant.spaces.includes(space)

  const spaces: MenuDestination[] = []
  if (has('chat')) {
    spaces.push({ id: 'chat', label: 'Chat', href: `${base}/chat`, icon: <ChatIcon /> })
  }
  if (has('workflows')) {
    spaces.push({
      id: 'workflows',
      label: 'Workflows',
      href: `${base}/workflows`,
      icon: <WorkflowIcon />,
      children: [
        { id: 'runs', label: 'All workflows', href: `${base}/workflows` },
        { id: 'runs-live', label: 'Live runs', href: `${base}/workflows/live` },
      ],
    })
  }

  const data: MenuDestination[] = []
  if (has('insights')) {
    data.push({
      id: 'insights',
      label: 'Insights',
      href: `${base}/insights`,
      icon: <InsightsIcon />,
      children: [
        { id: 'insights-usage', label: 'Usage', href: `${base}/insights/usage` },
        { id: 'insights-questions', label: 'Top questions', href: `${base}/insights/questions` },
      ],
    })
  }
  if (has('ingestion')) {
    data.push({
      id: 'ingestion',
      label: 'Ingestion',
      href: `${base}/ingestion`,
      icon: <IngestionIcon />,
      children: [
        { id: 'ingestion-documents', label: 'Documents', href: `${base}/ingestion/documents` },
        { id: 'ingestion-api', label: 'API sources', href: `${base}/ingestion/api-sources` },
      ],
    })
  }

  const sections: MenuSection[] = [
    {
      id: 'top',
      items: [
        { id: 'home', label: 'Home', href: `${base}/home`, icon: <HomeIcon /> },
        {
          id: 'tasks',
          label: 'Tasks',
          href: `${base}/tasks`,
          icon: <TasksIcon />,
          badge: has('workflows') && waiting > 0 ? waiting : undefined,
        },
      ],
    },
  ]
  if (spaces.length > 0) sections.push({ id: 'spaces', label: 'Spaces', items: spaces })
  if (data.length > 0) sections.push({ id: 'data', label: 'Data', items: data })
  return sections
}

/**
 * The Home panel of the Finals 2.0 pages: every area the tenant has, grouped by
 * what it is for, each with a line on how it is doing. Tenant Admin's pages sit
 * under it. Listing a page here makes Home the app you are in when you open it.
 */
export function buildHomePanel(tenant: Tenant): MenuSection[] {
  const base = `/t/${tenant.id}`
  const has = (space: SpaceId) => tenant.spaces.includes(space)
  const groups: MenuSection[] = [
    {
      id: 'home-overview',
      items: [
        {
          id: 'home',
          label: 'Overview',
          href: `${base}/home`,
          description: 'Everything at a glance',
        },
      ],
    },
  ]
  if (has('chat')) {
    groups.push({
      id: 'home-use',
      label: 'Use',
      items: [
        {
          id: 'home-chat',
          label: 'Chat',
          href: `${base}/chat`,
          description: 'Ask across 14 sources',
        },
      ],
    })
  }
  if (has('ingestion')) {
    groups.push({
      id: 'home-build',
      label: 'Build',
      items: [
        {
          id: 'home-ingestion',
          label: 'Ingestion',
          href: `${base}/ingestion`,
          description: '13 of 14 sources syncing',
          status: 'warning',
        },
        {
          id: 'chat-config',
          label: 'Chat Config',
          href: `${base}/chat-config`,
          description: 'Instructions and tools',
          status: 'idle',
        },
      ],
    })
  }
  if (has('workflows')) {
    groups.push({
      id: 'home-automate',
      label: 'Automate',
      items: [
        {
          id: 'home-workflows',
          label: 'Workflows Studio',
          href: `${base}/workflows`,
          description: '4 running',
          status: 'info',
        },
      ],
    })
  }
  if (has('insights')) {
    groups.push({
      id: 'home-measure',
      label: 'Measure',
      items: [
        {
          id: 'home-insights',
          label: 'Insights',
          href: `${base}/insights`,
          description: 'Eval scores, feedback, errors',
        },
        {
          id: 'evaluations',
          label: 'Evaluations Manager',
          href: `${base}/evaluations`,
          description: '4 of 5 suites passing',
          status: 'error',
        },
      ],
    })
  }
  groups.push({
    id: 'home-govern',
    label: 'Govern',
    items: [
      {
        id: 'audit',
        label: 'Audit & Compliance',
        href: `${base}/audit`,
        description: '12 flagged',
        status: 'warning',
      },
      {
        id: 'tenant-admin',
        label: 'Tenant Admin',
        href: '/tenants',
        description: '15 tenants · 1,204 people',
        children: [
          {
            id: 'tenants',
            label: 'Tenants',
            href: '/tenants',
            description: 'Every organisation, and the one you are in',
          },
          {
            id: 'people',
            label: 'People and roles',
            href: `${base}/people`,
            description: '1,204 people',
          },
          {
            id: 'usage',
            label: 'Usage and plans',
            href: `${base}/usage`,
            description: '78% of seats in use',
          },
        ],
      },
    ],
  })
  return groups
}
