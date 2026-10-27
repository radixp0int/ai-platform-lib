import { useState } from 'react'
import { MenuPanelLabel, MenuPanelRow, MenuPanelSearch } from '../../components/side-menu'
import type { NavigateHandler } from '../../primitives/link'
import type { Run } from '../../fixtures/platform/work'

// What the shell puts in the panels of the apps that have one. Each is built
// from the menu's own pieces, so a panel is the same shape whichever app it is
// for: a search, then small headings over rows.

type PanelProps = {
  base: string
  runs: Run[]
  activeId?: string
  onNavigate: NavigateHandler
}

const dotOf = (run: Run) => (run.status === 'waiting' ? 'bg-notify' : 'bg-accent')

/** The Workflows panel: find a run, jump to a view of them, or to one you were just in. */
export function WorkflowsPanel({ base, runs, activeId, onNavigate }: PanelProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const found = runs.filter((run) => run.title.toLowerCase().includes(needle))
  return (
    <div className="flex flex-col gap-0.5">
      <MenuPanelSearch
        label="Jump to a workflow"
        placeholder="Jump to a workflow"
        value={query}
        onChange={setQuery}
      />
      {needle ? (
        <>
          <MenuPanelLabel>Workflows</MenuPanelLabel>
          {found.map((run) => (
            <MenuPanelRow
              key={run.id}
              href={`${base}/${run.path}`}
              dot={dotOf(run)}
              name={run.title}
              onNavigate={onNavigate}
            />
          ))}
          {found.length === 0 && (
            <p className="px-2 py-3 text-[13px] text-ink-soft">No workflow called “{query}”.</p>
          )}
        </>
      ) : (
        <>
          <MenuPanelLabel>Views</MenuPanelLabel>
          <MenuPanelRow
            href={`${base}/workflows`}
            current={activeId === 'runs'}
            dot="bg-ink-strong"
            name="All workflows"
            count={runs.length}
            onNavigate={onNavigate}
          />
          <MenuPanelRow
            href={`${base}/workflows/live`}
            current={activeId === 'runs-live'}
            dot="bg-accent"
            name="Live runs"
            onNavigate={onNavigate}
          />
          {runs.length > 0 && <MenuPanelLabel>Recently viewed</MenuPanelLabel>}
          {runs.map((run) => (
            <MenuPanelRow
              key={run.id}
              href={`${base}/${run.path}`}
              dot={dotOf(run)}
              name={run.title}
              sub={run.step}
              onNavigate={onNavigate}
            />
          ))}
        </>
      )}
    </div>
  )
}

/** The short version, for the card over the rail while the panel is folded. */
export function WorkflowsFlyout({ base, runs, onNavigate }: PanelProps) {
  return (
    <>
      <MenuPanelLabel>Recently viewed</MenuPanelLabel>
      {runs.map((run) => (
        <MenuPanelRow
          key={run.id}
          href={`${base}/${run.path}`}
          dot={dotOf(run)}
          name={run.title}
          count={run.status === 'waiting' ? 'Waiting' : 'Running'}
          onNavigate={onNavigate}
        />
      ))}
      <MenuPanelRow href={`${base}/workflows`} name="All runs" onNavigate={onNavigate} />
    </>
  )
}
