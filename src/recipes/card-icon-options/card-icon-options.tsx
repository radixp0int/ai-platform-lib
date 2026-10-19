// The accepted Card treatment, alongside its previous look and a plain alternative.
import { Card } from '../../primitives/card'
import { ChatIcon, TriangleAlertIcon } from '../../primitives/icons'

const options = [
  { id: 'current', label: 'Previous', note: 'Original filled chip and icon colour.' },
  {
    id: 'muted',
    label: 'Muted tile (selected)',
    note: 'Card’s default: softer background and icon.',
  },
  { id: 'plain', label: 'Plain icon', note: 'Same spacing; muted icon with no tile background.' },
] as const

export function CardIconOptions() {
  return (
    <div className="card-icon-options mx-auto max-w-6xl p-6">
      <style>{`
        .card-icon-options [data-treatment="current"] > section > header > span[aria-hidden="true"] {
          background: var(--chip);
          color: var(--chip-fg);
        }
        .card-icon-options [data-treatment="plain"] > section > header > span[aria-hidden="true"] {
          background: transparent;
          color: var(--ink-soft);
        }
      `}</style>
      <h1 className="mb-2 text-2xl font-light text-ink-strong">Card icon treatments</h1>
      <p className="mb-7 max-w-2xl text-sm text-ink-soft">
        Only the icon tile changes. Size, spacing, typography, and the rest of the card stay the
        same. The muted tile is now Card’s default; the other treatments are shown for comparison.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {options.map((option) => (
          <div key={option.id}>
            <h2 className="mb-1 text-sm font-semibold text-ink-strong">{option.label}</h2>
            <p className="mb-4 text-xs text-ink-soft">{option.note}</p>
            <div data-treatment={option.id}>
              <Card
                title="Questions asked"
                eyebrow="Last 30 days"
                description="All members of Crestview Bank"
                icon={<ChatIcon width={17} height={17} />}
                footer={<span>Updated 2 minutes ago</span>}
              >
                <div className="flex items-baseline gap-2.5">
                  <b className="text-[32px] font-extrabold text-ink-strong tabular-nums">1,284</b>
                  <span className="text-xs font-bold text-success-fg">+12% vs August</span>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
      <WarningIconOptions />
    </div>
  )
}

/** Semantic colour is appropriate when the card communicates an actual warning. */
export function WarningIconOptions() {
  return (
    <div className="card-warning-options mt-10">
      <h2 className="mb-2 text-xl font-light text-ink-strong">Warning icon on a muted card</h2>
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        A real warning can use the gold caution colour with a soft tinted tile. The title and
        warning glyph carry the meaning too; the rest of the card stays neutral.
      </p>
      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        {[
          {
            id: 'muted',
            label: 'Neutral muted icon',
            note: 'The same neutral treatment as other cards.',
          },
          {
            id: 'caution',
            label: 'Muted warning colour',
            note: 'Existing caution tokens, also used by Alert.',
          },
        ].map((option) => (
          <div key={option.id}>
            <h3 className="mb-1 text-sm font-semibold text-ink-strong">{option.label}</h3>
            <p className="mb-4 text-xs text-ink-soft">{option.note}</p>
            <div data-treatment={option.id}>
              <Card
                title="Source needs attention"
                eyebrow="Source health"
                description="Some documents could not be indexed"
                icon={<TriangleAlertIcon width={17} height={17} />}
                iconTone={option.id === 'caution' ? 'warning' : 'neutral'}
                footer={<span>Last checked 2 minutes ago</span>}
              >
                <p className="m-0 text-sm text-ink-soft">
                  Three documents need review. Search still works for the remaining documents.
                </p>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
