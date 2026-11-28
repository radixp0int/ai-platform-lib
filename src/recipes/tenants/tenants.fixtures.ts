// The organisations the Tenants recipe lists: the rows of the Finals 2.0
// Tenants board, with their created dates moved up to today. One of them is
// the tenant you are in.
import { asOfToday } from '../../fixtures/as-of-today'

export type Plan = 'Enterprise' | 'Growth' | 'Starter'
export type Region = 'US East' | 'US Central' | 'US West' | 'UK' | 'EU West' | 'EU Central'

export type Org = {
  id: string
  name: string
  domain: string
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
}

export const PLANS: Plan[] = ['Enterprise', 'Growth', 'Starter']
export const REGIONS: Region[] = ['US East', 'US Central', 'US West', 'UK', 'EU West', 'EU Central']

type Row = [string, string, Plan, Region, string, string, number, number, string]

// prettier-ignore
const rows: Row[] = [
  ['Alderfinch Group', 'alderfinch.example', 'Enterprise', 'US East', 'Dana Whitfield', 'dana.w@example.com', 820, 1000, '2025-03-02'],
  ['Bayshore Foods', 'bayshore.example', 'Enterprise', 'US East', 'Marcus Webb', 'marcus.w@example.com', 182, 200, '2026-01-11'],
  ['Capstone Travel', 'capstonetravel.example', 'Growth', 'EU West', 'Jessica Nguyen', 'jessica.n@example.com', 31, 50, '2026-02-21'],
  ['Crestview Builders', 'crestview.example', 'Growth', 'US West', 'Sarah Johnson', 'sarah.j@example.com', 41, 50, '2026-03-14'],
  ['Fairfield Studios', 'fairfield.example', 'Starter', 'US East', 'Nia Coleman', 'nia.c@example.com', 6, 10, '2026-11-04'],
  ['Granite State Solar', 'granitesolar.example', 'Enterprise', 'US East', 'Priya Raman', 'priya.r@example.com', 260, 300, '2026-01-19'],
  ['Harbor Lane Logistics', 'harborlane.example', 'Enterprise', 'US Central', 'Daniel Ortiz', 'daniel.o@example.com', 118, 150, '2026-08-02'],
  ['Ironwood Health', 'ironwood.example', 'Enterprise', 'US West', 'Grace Kim', 'grace.k@example.com', 410, 500, '2025-06-15'],
  ['Juniper Labs', 'juniperlabs.example', 'Growth', 'EU West', 'Omar Haddad', 'omar.h@example.com', 12, 25, '2026-11-18'],
  ['Kestrel Media', 'kestrel.example', 'Starter', 'UK', 'Ellie Brooks', 'ellie.b@example.com', 7, 10, '2026-09-09'],
  ['Lumen Robotics', 'lumenrobotics.example', 'Growth', 'US West', 'Victor Chen', 'victor.c@example.com', 22, 50, '2026-10-21'],
  ['Meadowbrook Schools', 'meadowbrook.example', 'Enterprise', 'US Central', 'Hannah Pierce', 'hannah.p@example.com', 140, 250, '2025-04-30'],
  ['Northwind Outdoor', 'northwind.example', 'Starter', 'EU Central', 'Lars Nilsson', 'lars.n@example.com', 4, 10, '2025-07-07'],
  ['Oakridge Energy', 'oakridge.example', 'Growth', 'US Central', 'Tomás Rivera', 'tomas.r@example.com', 18, 25, '2026-10-02'],
  ['Pinecrest Retail', 'pinecrest.example', 'Growth', 'UK', 'Amara Okafor', 'amara.o@example.com', 9, 25, '2026-11-24'],
]

export const ORGS: Org[] = rows.map(
  ([name, domain, plan, region, contact, email, seatsUsed, seats, created], i) => ({
    id: `org_${String(i + 1).padStart(2, '0')}`,
    name,
    domain,
    plan,
    region,
    contact,
    email,
    seatsUsed,
    seats,
    created: asOfToday(created),
  }),
)

/** The tenant you are in: Alderfinch Group. */
export const CURRENT_ORG_ID = 'org_01'

/** "BF" for Bayshore Foods. */
export const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
