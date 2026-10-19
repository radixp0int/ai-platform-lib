import type { StageProgressProps } from './types'
// How far through its stages a run has got, as one segment per stage.
//
// Segments share the width equally, so the bar is the same size for a run of
// five stages as for one of ten — which is what lets a column of them line up in
// a table. Finished and current stages are filled; a stage not reached yet is an
// outline, so the two are told apart by shape as well as by colour.

const FILL = {
  done: 'bg-accent',
  running: 'bg-brand-solid',
  waiting: 'bg-notify',
  upcoming: 'border border-ink-soft/60 bg-panel-solid',
}

export function StageProgress({
  segments,
  label,
  current = 'running',
  className = '',
}: StageProgressProps) {
  return (
    <span role="img" aria-label={label} className={`flex h-2 gap-[3px] ${className}`}>
      {segments.map((status, index) => (
        <span
          // Segments have no identity beyond their place in the run.
          key={index}
          className={`h-full min-w-0 flex-1 rounded-[3px] ${
            FILL[status === 'current' ? current : status]
          }`}
        />
      ))}
    </span>
  )
}
