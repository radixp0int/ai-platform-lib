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
      shortLabel: 'Flows',
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
