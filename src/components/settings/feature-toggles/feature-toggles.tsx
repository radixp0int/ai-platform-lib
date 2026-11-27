import { Switch } from '../../../primitives/switch'
import { SectionHeading } from '../section-heading'
import type { FeatureTogglesProps } from '../types'

/**
 * The switch list for a feature catalogue — sections, each with a heading, an
 * optional description, and its rows.
 *
 * Presentational and entirely data-driven: it renders the sections it is
 * handed, in order, and nothing else. There is no dialog, header or reset
 * button here on purpose — every product wants its own settings shell, and an
 * inherited one is the part people end up fighting. SettingsDialog is the
 * library's shell for it.
 *
 * Entitlement is not this component's job. A feature the tenant does not have
 * is absent from the catalogue, so it cannot render; a feature they have but
 * may not change carries `locked`. A section left empty by that filtering
 * renders nothing at all, which is what lets one catalogue be narrowed per
 * viewer without leaving headings over blank space.
 *
 * Each row is the Switch primitive turned around — label on the left, switch
 * on the right — so the labels line up down the list.
 */
export function FeatureToggles<Id extends string = string>({
  catalogue,
  flags,
  onChange,
  intro,
  spine = false,
}: FeatureTogglesProps<Id>) {
  const sections = catalogue.filter((s) => s.features.length > 0)
  if (sections.length === 0) return null

  return (
    <div>
      {intro && <p className="mb-3 text-xs leading-snug text-ink-soft">{intro}</p>}
      {/* ink-soft rather than --line: at 10% alpha in the light theme a --line
          hairline vanishes, and this one carries structure. */}
      <div className={spine ? 'ml-1 border-l border-ink-soft/25 pl-5' : undefined}>
        {sections.map((section) => (
          <section
            key={section.id}
            className={`group relative py-4 first:pt-0 last:pb-0 ${spine ? '' : 'border-t border-line first:border-t-0'}`}
          >
            {spine && (
              // -left-6 puts the node's centre on the spine: pl-5 (20px) plus
              // the 1px border, less half the node. 21px = the section's pt-4
              // plus the heading's half line, less half the node.
              <span
                aria-hidden
                className="absolute top-[21px] -left-6 size-[7px] rounded-full border border-ink-soft/30 bg-panel-solid group-first:top-[5px]"
              />
            )}
            <SectionHeading title={section.title} description={section.description} />
            <div className="mt-1">
              {section.features.map(({ id, label, hint, locked, lockedReason }) => (
                <Switch
                  key={id}
                  checked={flags[id] === true}
                  onChange={(on) => onChange(id, on)}
                  disabled={locked}
                  label={
                    <span className="text-[13.5px] font-semibold text-ink-strong">{label}</span>
                  }
                  // The reason is part of the switch's name rather than a
                  // tooltip: "why can't I change this" is the question a
                  // locked switch provokes, and a tooltip does not answer it
                  // for a screen reader.
                  description={
                    hint || (locked && lockedReason) ? (
                      <>
                        {hint && <span className="block leading-snug">{hint}</span>}
                        {locked && lockedReason && (
                          <span className="mt-0.5 block leading-snug text-caution">
                            {lockedReason}
                          </span>
                        )}
                      </>
                    ) : undefined
                  }
                  className="flex-row-reverse justify-between py-2 text-left"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
