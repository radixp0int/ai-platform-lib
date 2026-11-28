// The organisations the Tenants recipe lists: the rows of the Finals 2.0
// Tenants board, with their created dates moved up to today.
import { asOfToday } from '../../fixtures/as-of-today'

export type OrgStatus = 'active' | 'pending' | 'suspended'
export type Plan = 'Enterprise' | 'Growth' | 'Starter'
export type Region = 'US East' | 'US Central' | 'US West' | 'UK' | 'EU West' | 'EU Central'

export type Org = {
  id: string
  name: string
  domain: string
  status: OrgStatus
  plan: Plan
  region: Region
  contact: string
  email: string
  /** Seats signed in this month. */
  seatsUsed: number
  /** Seats paid for. */
  seats: number
  /** `yyyy-mm-dd`. */
  created: string
  /** Why a tenant that is not active is not: "Invite sent 23 days ago". */
  note: string
}

export const STATUS_LABEL: Record<OrgStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
}

export const STATUSES: OrgStatus[] = ['active', 'pending', 'suspended']
export const PLANS: Plan[] = ['Enterprise', 'Growth', 'Starter']
export const REGIONS: Region[] = ['US East', 'US Central', 'US West', 'UK', 'EU West', 'EU Central']

type Row = [string, string, OrgStatus, Plan, Region, string, string, number, number, string, string]

const rows: Row[] = [
  [
    'Bayshore Foods',
    'bayshore.example',
    'active',
    'Enterprise',
    'US East',
    'Marcus Webb',
    'marcus.w@example.com',
    182,
    200,
    '2026-01-11',
    '',
  ],
  [
    'Capstone Travel',
    'capstonetravel.example',
    'suspended',
    'Growth',
    'EU West',
    'Jessica Nguyen',
    'jessica.n@example.com',
    0,
    50,
    '2026-02-21',
    'Contract ended Oct 31',
  ],
  [
    'Crestview Builders',
    'crestview.example',
    'active',
    'Growth',
    'US West',
    'Sarah Johnson',
    'sarah.j@example.com',
    41,
    50,
    '2026-03-14',
    '',
  ],
  [
    'Fairfield Studios',
    'fairfield.example',
    'pending',
    'Starter',
    'US East',
    'Nia Coleman',
    'nia.c@example.com',
    0,
    10,
    '2026-11-04',
    'Invite sent 23 days ago',
  ],
  [
    'Granite State Solar',
    'granitesolar.example',
    'active',
    'Enterprise',
    'US East',
    'Priya Raman',
    'priya.r@example.com',
    260,
    300,
    '2026-01-19',
    '',
  ],
  [
    'Harbor Lane Logistics',
    'harborlane.example',
    'active',
    'Enterprise',
    'US Central',
    'Daniel Ortiz',
    'daniel.o@example.com',
    118,
    150,
    '2026-08-02',
    '',
  ],
  [
    'Ironwood Health',
    'ironwood.example',
    'active',
    'Enterprise',
    'US West',
    'Grace Kim',
    'grace.k@example.com',
    410,
    500,
    '2025-06-15',
    '',
  ],
  [
    'Juniper Labs',
    'juniperlabs.example',
    'pending',
    'Growth',
    'EU West',
    'Omar Haddad',
    'omar.h@example.com',
    0,
    25,
    '2026-11-18',
    'Invite sent 9 days ago',
  ],
  [
    'Kestrel Media',
    'kestrel.example',
    'active',
    'Starter',
    'UK',
    'Ellie Brooks',
    'ellie.b@example.com',
    7,
    10,
    '2026-09-09',
    '',
  ],
  [
    'Lumen Robotics',
    'lumenrobotics.example',
    'active',
    'Growth',
    'US West',
    'Victor Chen',
    'victor.c@example.com',
    22,
    50,
    '2026-10-21',
    '',
  ],
  [
    'Meadowbrook Schools',
    'meadowbrook.example',
    'active',
    'Enterprise',
    'US Central',
    'Hannah Pierce',
    'hannah.p@example.com',
    140,
    250,
    '2025-04-30',
    '',
  ],
  [
    'Northwind Outdoor',
    'northwind.example',
    'suspended',
    'Starter',
    'EU Central',
    'Lars Nilsson',
    'lars.n@example.com',
    0,
    10,
    '2025-07-07',
    'Paused at their request',
  ],
  [
    'Oakridge Energy',
    'oakridge.example',
    'active',
    'Growth',
    'US Central',
    'Tomás Rivera',
    'tomas.r@example.com',
    18,
    25,
    '2026-10-02',
    '',
  ],
  [
    'Pinecrest Retail',
    'pinecrest.example',
    'pending',
    'Growth',
    'UK',
    'Amara Okafor',
    'amara.o@example.com',
    0,
    25,
    '2026-11-24',
    'Invite sent 3 days ago',
  ],
]

export const ORGS: Org[] = rows.map(
  ([name, domain, status, plan, region, contact, email, seatsUsed, seats, created, note], i) => ({
    id: `org_${String(i + 1).padStart(2, '0')}`,
    name,
    domain,
    status,
    plan,
    region,
    contact,
    email,
    seatsUsed,
    seats,
    created: asOfToday(created),
    note,
  }),
)

/** "BF" for Bayshore Foods. */
export const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/**
 * The state edge a row should carry: the attention orange for a tenant
 * waiting on an invite, red for a suspended one, none for an active one.
 *
 * TODO(rowTone): pass this to the grid as `rowTone` once DataTable's `rowTone`
 * (branch claude/row-status-edge-b95de3) is on main. Until then the rows have
 * no edge; the status pill says the same thing in words.
 */
export const toneOf = (org: Org): 'warning' | 'error' | undefined =>
  org.status === 'pending' ? 'warning' : org.status === 'suspended' ? 'error' : undefined
