import { type ReactNode } from 'react'
import {
  type AskedOverChip,
  type AskedOverScope,
  type ChainControls,
  type ComposerFeatures,
  type Message,
  type QueueMove,
  type QueuedMessage,
  type Suggestion,
} from '../../engine/types'
import type { MarkdownQuoteStyle } from '../markdown'

export type ConversationProps = {
  disclaimer?: string
  greeting?: ReactNode
  messages: Message[]
  busy: boolean
  /** Messages written but not yet run — the dock above the composer. */
  queue: QueuedMessage[]
  held: boolean
  onSubmit: (text: string) => void
  onStop: () => void
  onSendNow: (text: string) => void
  /** Filters in force now — a question recorded under different ones says so. */
  scopeChips?: AskedOverChip[]
  onRestoreScope?: (scope: AskedOverScope) => void
  onSendQueuedNow: (id: number) => void
  onEditQueued: (id: number, text: string) => void
  onMoveQueued: (id: number, to: QueueMove) => void
  onRemoveQueued: (id: number) => void
  onHold: () => void
  onResume: () => void
  onClearQueue: () => void
  onRetry: (id: number) => void
  /** The chain being built or run, and its controls. */
  chain: ChainControls
  /** Composer features switched on for this viewer. */
  features?: ComposerFeatures
  /** Today's suggested questions, and more for suggest-as-you-type. */
  suggestions: Suggestion[]
  typeaheadPool?: Suggestion[]
  /** Demo toggle: the copy / regenerate / vote row under a finished answer. */
  showActions?: boolean
  /**
   * Lays out the page before the first message, given the composer to place
   * in it — a greeting band with the composer lifted over its edge, say. Left
   * out, the page is the greeting, the composer and today's suggestions.
   */
  landing?: (composer: ReactNode) => ReactNode
  /**
   * A standing notice docked above the composer once the chat has begun — an
   * `Alert variant="bar"`. While it shows, the disclaimer line under the
   * composer steps aside, so the same words are not said twice.
   */
  notice?: ReactNode
  /** How quotes in the answers look, passed to each message's `Markdown`. */
  quote?: MarkdownQuoteStyle
}
