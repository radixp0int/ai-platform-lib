// The demo's tenants — one list, read by the switcher, the shell's route guard
// and the /tenants table, so they cannot disagree about who has what.
//
// The first three are the tenants the platform designs use (see
// /designs/platform-shell). The rest are DataTablePage's fixture, so the admin
// table and the switcher's "load more" have a list long enough to page.

/** The parts of the platform a tenant can be given. */
export type SpaceId = 'chat' | 'workflows' | 'insights' | 'ingestion'

export type TenantStatus = 'active' | 'pending' | 'suspended'

export type Tenant = {
  /** The slug in every route: `/t/<id>/…`. Fixed once created. */
  id: string
  name: string
  initials: string
  /** What the side menu lists and the route guard allows. */
  spaces: SpaceId[]
  status: TenantStatus
  contact: string
  /** ISO date. */
  created: string
}

export const SPACE_LABEL: Record<SpaceId, string> = {
  chat: 'Chat',
  workflows: 'Workflows',
  insights: 'Insights',
  ingestion: 'Ingestion',
}

export const SPACE_ORDER: SpaceId[] = ['chat', 'workflows', 'insights', 'ingestion']

const ALL: SpaceId[] = ['chat', 'workflows', 'insights', 'ingestion']

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'alderfinch-treasury',
    name: 'Alderfinch Treasury',
    initials: 'AT',
    spaces: ALL,
    status: 'active',
    contact: 'Dana Whitfield',
    created: '2026-01-06',
  },
  {
    id: 'alderfinch-retail',
    name: 'Alderfinch Retail',
    initials: 'AR',
    spaces: ['chat'],
    status: 'active',
    contact: 'Rachel Okafor',
    created: '2026-01-06',
  },
  {
    id: 'harbor-street',
    name: 'Harbor Street Credit Union',
    initials: 'HS',
    spaces: ['chat', 'workflows'],
    status: 'active',
    contact: 'Sam Raines',
    created: '2025-11-20',
  },
  {
    id: 'crestview',
    name: 'Crestview Bank',
    initials: 'CB',
    spaces: ALL,
    status: 'active',
    contact: 'Sarah Johnson',
    created: '2026-03-14',
  },
  {
    id: 'prosperity',
    name: 'Prosperity Bank',
    initials: 'PB',
    spaces: ['chat', 'insights'],
    status: 'active',
    contact: 'Michael Smith',
    created: '2026-03-12',
  },
  {
    id: 'liberty-savings',
    name: 'Liberty Savings & Loan',
    initials: 'LS',
    spaces: ['chat'],
    status: 'pending',
    contact: 'Emily Brown',
    created: '2026-03-09',
  },
  {
    id: 'horizon-national',
    name: 'Horizon National Bank',
    initials: 'HB',
    spaces: ['chat', 'workflows', 'ingestion'],
    status: 'active',
    contact: 'David Rodriguez',
    created: '2026-02-28',
  },
  {
    id: 'capital-trust',
    name: 'Capital Trust Bank',
    initials: 'CT',
    spaces: ['chat'],
    status: 'suspended',
    contact: 'Jessica Nguyen',
    created: '2026-02-21',
  },
  {
    id: 'integrity-financial',
    name: 'Integrity Financial Corp.',
    initials: 'IC',
    spaces: ['chat', 'workflows'],
    status: 'active',
    contact: 'Christopher Lee',
    created: '2026-02-14',
  },
  {
    id: 'summit-community',
    name: 'Summit Community Bank',
    initials: 'SB',
    spaces: ['chat', 'workflows'],
    status: 'active',
    contact: 'Ashley Taylor',
    created: '2026-02-02',
  },
  {
    id: 'pinnacle',
    name: 'Pinnacle Credit Union',
    initials: 'PC',
    spaces: ['chat'],
    status: 'pending',
    contact: 'Daniel Okafor',
    created: '2026-01-27',
  },
  {
    id: 'granite-state',
    name: 'Granite State Savings',
    initials: 'GS',
    spaces: ['chat', 'insights'],
    status: 'active',
    contact: 'Priya Raman',
    created: '2026-01-19',
  },
  {
    id: 'bayshore-financial',
    name: 'Bayshore Financial',
    initials: 'BF',
    spaces: ['chat', 'workflows'],
    status: 'active',
    contact: 'Marcus Webb',
    created: '2026-01-11',
  },
  {
    id: 'ironwood-mutual',
    name: 'Ironwood Mutual',
    initials: 'IM',
    spaces: ['chat'],
    status: 'suspended',
    contact: 'Helen Park',
    created: '2025-12-30',
  },
  {
    id: 'northgate-trust',
    name: 'Northgate Trust',
    initials: 'NT',
    spaces: ALL,
    status: 'active',
    contact: 'Tomas Alvarez',
    created: '2025-12-18',
  },
  {
    id: 'fairfield-savings',
    name: 'Fairfield Savings',
    initials: 'FS',
    spaces: ['chat'],
    status: 'pending',
    contact: 'Nia Coleman',
    created: '2025-12-04',
  },
  {
    id: 'redstone',
    name: 'Redstone Bancorp',
    initials: 'RB',
    spaces: ['chat', 'workflows', 'insights'],
    status: 'active',
    contact: 'Owen Fitzgerald',
    created: '2025-11-22',
  },
]

export const DEFAULT_TENANT_ID = 'alderfinch-treasury'

/** "Chat, Workflows" — the one-line summary under a tenant's name. */
export function describeSpaces(spaces: SpaceId[]): string {
  return SPACE_ORDER.filter((space) => spaces.includes(space))
    .map((space) => SPACE_LABEL[space])
    .join(', ')
}

export const formatTenantDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
