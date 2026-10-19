/** One run in the list. Everything shown is the host's wording. */
export type RecentRun = {
  id: string
  /** The workflow's name. */
  title: string
  /** Which run of it: "New hire · Priya Raman". */
  sub: string
  state: 'waiting' | 'running' | 'idle'
  /**
   * The one fact worth a glance: how long a waiting run has left ("3h 40m"),
   * or the stage a running one is on ("Diagnose").
   */
  trailing?: string
}

export type RecentRunsProps = {
  runs: RecentRun[]
  /** The run on screen, if it is one of these. */
  activeId?: string | null
  onOpen: (id: string) => void
  className?: string
}
