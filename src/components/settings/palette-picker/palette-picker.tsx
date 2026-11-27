import { CheckIcon } from '../../../primitives/icons'
import { SectionHeading } from '../section-heading'
import type { PalettePickerProps } from '../types'

/**
 * Pick a `chat-theme-*` palette.
 *
 * Each card is a real preview rather than a label — the plate is the theme's
 * own dark canvas, the bar its dark panel, the dot the ember `--action` fill
 * those surfaces exist to set off. See PaletteOption for why those are
 * literals and why they are dark values in both modes. The chosen palette's
 * `hint` sits under the cards as a one-line note.
 */
export function PalettePicker({
  options,
  value,
  onChange,
  title = 'Dark palette',
  description = 'Light mode looks the same with each. They change how much colour the dark page carries.',
}: PalettePickerProps) {
  if (options.length === 0) return null
  const active = options.find((o) => o.id === value)

  return (
    <section>
      <SectionHeading title={title} description={description} />
      <div role="radiogroup" aria-label={title} className="mt-3 grid grid-cols-3 gap-2.5">
        {options.map(({ id, label, canvas, panel, action }) => {
          const on = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(id)}
              className={`flex min-w-0 flex-col gap-2 rounded-surface p-2 text-left transition ${
                on ? 'ring-2 ring-accent' : 'ring-1 ring-line hover:ring-ink-soft/50'
              }`}
            >
              <span
                aria-hidden
                style={{ background: canvas }}
                className="relative block h-[52px] w-full overflow-hidden rounded-control"
              >
                <span
                  style={{ background: panel }}
                  className="absolute inset-x-2 top-2 h-2.5 rounded-[3px]"
                />
                <span
                  style={{ background: action }}
                  className="absolute right-2 bottom-2 size-3.5 rounded-full"
                />
              </span>
              <span className="flex items-center justify-between gap-2 text-[12.5px] font-bold text-ink-strong">
                <span className="truncate">{label}</span>
                {on && (
                  <span
                    aria-hidden
                    className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-on-accent"
                  >
                    <CheckIcon width={10} height={10} />
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
      {active?.hint && <p className="mt-2.5 text-[12.5px] leading-snug text-ink">{active.hint}</p>}
    </section>
  )
}
