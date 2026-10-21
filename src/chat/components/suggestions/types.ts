import type { Suggestion } from '../../engine/types'

export type SuggestionsMenuProps = {
  /** Today's suggested questions, best first. The menu shows them all. */
  suggestions: Suggestion[]
  /** Put a suggestion in the draft — picking one never sends by itself. */
  onPick: (text: string) => void
  /** Add a suggestion to the queue. Omitted, rows offer no queue button. */
  onQueue?: (text: string) => void
  /** Suggest-as-you-type, switched from the menu's footer. */
  typeahead: boolean
  onTypeaheadChange: (on: boolean) => void
  /** Compact density: a smaller trigger and a narrower panel. */
  compact: boolean
  /** Which way the panel opens. Up above a docked composer; down under the
   *  centered one, where there is no room above. */
  placement?: 'up' | 'down'
}

export type SuggestionListProps = {
  id: string
  /** Heading above the rows — "Today's suggestions", "Matches". */
  label: string
  items: Suggestion[]
  /** The typed text, bolded where it occurs in each row. */
  query: string
  /** Row under the keyboard; -1 for none. */
  active: number
  onPick: (text: string) => void
  compact: boolean
  placement?: 'up' | 'down'
}

export type SuggestedQuestionsProps = {
  suggestions: Suggestion[]
  /** Ask it — the empty state sends the question straight away. */
  onPick: (text: string) => void
  /** How many to show, best first. */
  limit?: number
  /** Smaller rows, without the reasons — for a narrow column. */
  compact?: boolean
  /** The row the assistant is typing into the composer, drawn in the brand
   *  colour so the two read as one suggestion. -1 or omitted for none. */
  activeIndex?: number
}
