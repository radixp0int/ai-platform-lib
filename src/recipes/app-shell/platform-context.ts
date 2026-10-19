import { createContext, useContext } from 'react'
import type { Tenant } from '../../fixtures/platform/tenants'
import type { Run, Task } from '../../fixtures/platform/work'

/** What the shell hands the pages it hosts. */
export type PlatformValue = {
  /** The tenant in the URL — or, on `/tenants`, the one last used. */
  tenant: Tenant
  /** Every tenant, as edited this session. */
  tenants: Tenant[]
  /** `/t/<tenant>` — prefix for links inside the tenant. */
  base: string
  runs: Run[]
  tasks: Task[]
  updateTenant: (id: string, patch: Partial<Pick<Tenant, 'name' | 'spaces'>>) => void
  /** Client-side navigation, for buttons that are not anchors. */
  go: (href: string) => void
}

export const PlatformContext = createContext<PlatformValue | null>(null)

export function usePlatform(): PlatformValue {
  const value = useContext(PlatformContext)
  if (!value) throw new Error('usePlatform must be used inside PlatformShell')
  return value
}
