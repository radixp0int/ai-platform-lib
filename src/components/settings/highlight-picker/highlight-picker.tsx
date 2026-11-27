import { SectionHeading } from '../section-heading'
import type { HighlightPickerProps } from '../types'

const SAMPLE = (
  <>
    Preview: <mark>86 documents still answer questions</mark> until it reconnects.
  </>
)

/**
 * Pick the `<mark>` colour behind a cited passage — the reference panel and a
 * citation chip's hover preview both use it.
 *
 * Each chip pairs the swatch with its name, so the choice never rests on hue
 * alone. The preview line sits in a `data-chat-highlight` scope, so its
 * `<mark>`s take the chosen colour's real `--highlight` and strength from
 * brand.css §5 — what is shown here is what lands on the page.
 */
export function HighlightPicker({
  options,
  value,
  onChange,
  title = 'Citation highlight',
  description = 'The colour behind text an answer quotes from a source. Every option keeps the text readable.',
  preview = SAMPLE,
}: HighlightPickerProps) {
  if (options.length === 0) return null

  return (
    <section>
      <SectionHeading title={title} description={description} />
      <div role="radiogroup" aria-label={title} className="mt-3 flex flex-wrap gap-2">
        {options.map(({ id, label, swatch }) => {
          const on = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(id)}
              className={`inline-flex h-8 items-center gap-2 rounded-full pr-3 pl-2 text-[12.5px] font-semibold transition ${
                on
                  ? 'text-ink-strong ring-2 ring-accent'
                  : 'text-ink ring-1 ring-line hover:ring-ink-soft/50'
              }`}
            >
              <span
                aria-hidden
                style={{ background: swatch }}
                className="size-4 rounded-full ring-1 ring-ink-soft/20"
              />
              {label}
            </button>
          )
        })}
      </div>
      {preview !== null && (
        // The wash is composed on each <mark> (not read from a token) for the
        // reason chat.css gives at `.highlight-wash`: the mix must resolve
        // against the swatch scope the mark actually sits in.
        <p
          data-chat-highlight={value}
          className="mt-3 text-[13px] leading-relaxed text-ink [&_mark]:rounded-[3px] [&_mark]:bg-[color-mix(in_oklab,var(--highlight)_var(--highlight-strength,25%),transparent)] [&_mark]:px-0.5 [&_mark]:text-ink-strong [&_mark]:shadow-[inset_0_-2px_0_var(--highlight)]"
        >
          {preview}
        </p>
      )}
    </section>
  )
}
