import type { Highlight, Source } from '../../engine/types'

/**
 * The quote's rail. `subtle` is the 2px `--rail` every turn rail uses
 * (reasoning, tool payloads, the trace). `accent` is 3px in the paler
 * `--rail-accent`: decoration rather than a 3:1 cue, so pair it with
 * `quoteTint` or `quoteFont="italic"` when the quote must stand out on its own.
 */
export type MarkdownQuoteRail = 'subtle' | 'accent'

/** `italic` is soft ink, slanted. `regular` is upright, in full body ink. */
export type MarkdownQuoteFont = 'italic' | 'regular'

/**
 * Room inside the rail. `snug` is 16px to the left of the text and nothing
 * above or below. `roomy` is 12px above and below and 14px either side — what
 * a tinted quote needs so its text doesn't touch the panel's edge.
 */
export type MarkdownQuoteSpacing = 'snug' | 'roomy'

export type MarkdownProps = {
  text: string
  streaming?: boolean
  /** When present, inline [n] markers matching a source id become chips. */
  sources?: Source[]
  onCite?: (sourceId: number) => void
  /** Passages to highlight, grouped by referenceNumber. */
  highlights?: Highlight[]
  /** The reference (referenceNumber) whose passages should currently highlight. */
  activeRef?: number | null
  /** Blockquote rail. Defaults to `subtle`. */
  quoteRail?: MarkdownQuoteRail
  /** Blockquote text. Defaults to `italic`. */
  quoteFont?: MarkdownQuoteFont
  /** Blockquote padding. Defaults to `snug`. */
  quoteSpacing?: MarkdownQuoteSpacing
  /** A light wash behind the blockquote (`--quote-tint`). Defaults to off. */
  quoteTint?: boolean
}
