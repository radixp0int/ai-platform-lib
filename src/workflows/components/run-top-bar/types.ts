import type { ControlAction, RunPhase } from '../../engine/index'

export type RunTopBarProps = {
  title: string
  waitingCount: number
  phase: RunPhase
  onControl: (action: ControlAction) => void
  runPanelOpen: boolean
  onShowRunPanel: () => void
  detailsOpen: boolean
  onToggleDetails: () => void
  logOpen: boolean
  onToggleLog: () => void
}
