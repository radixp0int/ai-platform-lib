import { StatusDot } from '../../../primitives/status-dot'
import type { RunTopBarProps } from './types'
// The bar above the canvas: what this run is, and the controls over it.
//
// Named for the run rather than the app, because demo/components/TopBar.tsx is
// the chat one and these are not interchangeable.
//
// It is sized by a @container, not the viewport: this column is only ~700px wide
// on a 1440 screen, so a viewport breakpoint never fires and the bar overflows
// its panel. As the column narrows it sheds the breadcrumb, then the pill's
// words, then the pill, then the run controls — and only then does the title
// truncate. The details toggle is never dropped: a narrow window is exactly when
// someone wants that 400px back. See docs/workflows/design.md.
import { IconButton } from '../../../primitives/icon-button'
import { ChevronRightIcon, HistoryIcon, RefreshIcon } from '../../../primitives/icons'
import {
  PanelRightIcon,
  WorkflowPauseIcon,
  WorkflowPlayIcon,
} from '../../../primitives/icons/workflow-icons'

export function RunTopBar({
  title,
  waitingCount,
  phase,
  onControl,
  detailsOpen,
  onToggleDetails,
  logOpen,
  onToggleLog,
}: RunTopBarProps) {
  const paused = phase === 'paused'
  const over = phase === 'finished' || phase === 'failed'

  return (
    <div className="flex h-[72px] shrink-0 items-center gap-3 overflow-hidden border-b border-line pr-5 pl-6">
      {/* First to go when the column gets tight — the page title says it anyway. */}
      <span className="shrink-0 text-[13px] text-ink-soft @max-[880px]:hidden">Workflows</span>
      <ChevronRightIcon
        width={14}
        height={14}
        className="shrink-0 text-ink-soft @max-[880px]:hidden"
      />
      <h1 className="min-w-0 truncate text-base font-bold tracking-tight text-ink-strong">
        {title}
      </h1>
      {/* Sheds words, then disappears — the menu's "Needs you" count carries
          the same fact, so this is the first thing that can go. */}
      {waitingCount > 0 && (
        <span className="ml-2 inline-flex h-7 shrink-0 items-center gap-2 rounded-control bg-notify/12 px-3 text-xs font-bold whitespace-nowrap text-ink-strong @max-[620px]:hidden">
          <StatusDot className="size-2 rounded-full bg-notify" aria-hidden />
          <span className="@max-[760px]:hidden">
            Waiting on {waitingCount} approval{waitingCount === 1 ? '' : 's'}
          </span>
          <span className="@min-[760px]:hidden">
            {waitingCount} approval{waitingCount === 1 ? '' : 's'}
          </span>
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Icon-only: beside a title and a status pill, labelled buttons don't
            fit the column at any useful width. There is no theme switch here —
            that belongs to the app's top bar, not to one page of it. */}
        <IconButton
          shape="rounded"
          onClick={onToggleLog}
          active={logOpen}
          aria-pressed={logOpen}
          aria-expanded={logOpen}
          aria-controls="wf-run-log"
          aria-label="Run log"
          title="Run log"
          className="@max-[560px]:hidden"
        >
          <HistoryIcon width={16} height={16} />
        </IconButton>
        <IconButton
          shape="rounded"
          onClick={() => onControl(paused ? 'resume' : 'pause')}
          disabled={over}
          active={paused}
          aria-pressed={paused}
          aria-label={paused ? 'Resume run' : 'Pause run'}
          title={paused ? 'Resume run' : 'Pause run'}
          className="@max-[560px]:hidden"
        >
          {paused ? (
            <WorkflowPlayIcon width={16} height={16} />
          ) : (
            <WorkflowPauseIcon width={16} height={16} />
          )}
        </IconButton>
        <IconButton
          shape="rounded"
          onClick={() => onControl('restart')}
          aria-label="Restart run"
          title="Restart run"
          className="@max-[560px]:hidden"
        >
          <RefreshIcon width={16} height={16} />
        </IconButton>
        {/* Deliberately never hidden: a narrow window is exactly when someone
            wants the 400px details panel back. */}
        <IconButton
          shape="rounded"
          onClick={onToggleDetails}
          active={detailsOpen}
          aria-pressed={detailsOpen}
          aria-label={detailsOpen ? 'Hide step details' : 'Show step details'}
          title={detailsOpen ? 'Hide step details' : 'Show step details'}
        >
          <PanelRightIcon width={16} height={16} />
        </IconButton>
      </div>
    </div>
  )
}
