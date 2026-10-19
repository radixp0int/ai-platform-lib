import type { LogEntry } from '../../engine/index'

export type RunLogProps = {
  entries: LogEntry[]
  /** How many older lines the cap dropped. */
  trimmed: number
  open: boolean
  /** Step id → title, so a line can be attributed to the step it names. */
  stepTitles: Map<string, string>
  onSelectStep: (id: string) => void
  onClose: () => void
}
