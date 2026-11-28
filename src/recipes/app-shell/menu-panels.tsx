import { useState } from 'react'
import {
  MENU_STATUS_DOT,
  MenuPanelLabel,
  MenuPanelRow,
  MenuPanelSearch,
  type MenuStatus,
} from '../../components/side-menu'
import type { NavigateHandler } from '../../primitives/link'
import type { WorkflowRow, WorkflowStatus } from '../workflows/fixtures/workflows'

// What the shell puts in the panels of the apps that have one. Each is built
// from the menu's own pieces, so a panel is the same shape whichever app it is
// for: a search, then small headings over rows.

type PanelProps = {
  base: string
  /** The tenant's workflows, as the runs list shows them. */
  workflows: WorkflowRow[]
  /** The path below the tenant, to mark the row being viewed. */
  path?: string
  onNavigate: NavigateHandler
}

const DOT: Record<WorkflowStatus, MenuStatus> = {
  needs: 'warning',
  waiting: 'warning',
  failed: 'error',
  running: 'info',
  idle: 'idle',
}

/** The panel's groups, in order: what needs you, then what waits on others, runs, and sits idle. */
const GROUPS: { label: string; statuses: WorkflowStatus[] }[] = [
  { label: 'Needs you', statuses: ['needs', 'failed'] },
  { label: 'Waiting on someone', statuses: ['waiting'] },
  { label: 'Running', statuses: ['running'] },
  { label: 'Idle', statuses: ['idle'] },
]

const subOf = (row: WorkflowRow) =>
  row.status === 'failed' ? `Failed: ${row.now}` : row.status === 'idle' ? 'No live run' : row.now

function Row({
  row,
  base,
  path,
  onNavigate,
}: { row: WorkflowRow } & Omit<PanelProps, 'workflows'>) {
  const href = `${base}/workflows/${row.id}`
  return (
    <MenuPanelRow
      href={href}
      current={path === `/workflows/${row.id}` || !!path?.startsWith(`/workflows/${row.id}/`)}
      dot={MENU_STATUS_DOT[DOT[row.status]]}
      name={row.name}
      sub={subOf(row)}
      onNavigate={onNavigate}
    />
  )
}

/** The Workflows panel: All workflows, then each workflow under where its live run stands. */
export function WorkflowsPanel({ base, workflows, path, onNavigate }: PanelProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const found = workflows.filter((row) => row.name.toLowerCase().includes(needle))
  const needYou = workflows.filter((row) => row.status === 'needs').length
  return (
    <div className="flex flex-col gap-0.5">
      <MenuPanelSearch
        label="Find a workflow"
        placeholder="Find a workflow"
        value={query}
        onChange={setQuery}
      />
      {needle ? (
        <>
          <MenuPanelLabel>Workflows</MenuPanelLabel>
          {found.map((row) => (
            <Row key={row.id} row={row} base={base} path={path} onNavigate={onNavigate} />
          ))}
          {found.length === 0 && (
            <p className="px-2 py-3 text-[13px] text-ink-soft">No workflow called “{query}”.</p>
          )}
        </>
      ) : (
        <>
          <MenuPanelRow
            href={`${base}/workflows`}
            current={path === '/workflows'}
            name="All workflows"
            sub={`${workflows.length} workflows${needYou ? ` · ${needYou} need you` : ''}`}
            onNavigate={onNavigate}
          />
          {GROUPS.map((group) => {
            const rows = workflows.filter((row) => group.statuses.includes(row.status))
            return rows.length === 0 ? null : (
              <div key={group.label} className="flex flex-col gap-0.5">
                <MenuPanelLabel>{group.label}</MenuPanelLabel>
                {rows.map((row) => (
                  <Row key={row.id} row={row} base={base} path={path} onNavigate={onNavigate} />
                ))}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

/** The short version, for the card over the rail while the panel is folded. */
export function WorkflowsFlyout({ base, workflows, onNavigate }: PanelProps) {
  const needYou = workflows.filter((row) => row.status === 'needs' || row.status === 'failed')
  return (
    <>
      {needYou.length > 0 && <MenuPanelLabel>Needs you</MenuPanelLabel>}
      {needYou.map((row) => (
        <Row key={row.id} row={row} base={base} onNavigate={onNavigate} />
      ))}
      <MenuPanelRow href={`${base}/workflows`} name="All workflows" onNavigate={onNavigate} />
    </>
  )
}
