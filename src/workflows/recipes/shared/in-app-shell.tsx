import type { ReactNode } from 'react'
import { AppShell } from '../../../recipes/app-shell'
import { DEFAULT_TENANT_ID } from '../../../fixtures/platform/tenants'

/**
 * Puts a workflow page where it lives: inside the platform shell, whose one
 * side menu carries the run's outline. The page has no panel of its own to show
 * without it, so every story and check of a whole run goes through here.
 */
export function InAppShell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      initialPath={`/t/${DEFAULT_TENANT_ID}/workflows/live`}
      renderSpace={({ space }) => (space === 'workflows' ? children : undefined)}
    />
  )
}
