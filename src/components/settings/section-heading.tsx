/**
 * The small uppercase heading every settings section opens with, and its one
 * line of explanation. Shared by the pickers and the switch list so the
 * sections of one dialog read as one set. Not exported from the package.
 */
export function SectionHeading({
  title,
  description,
  id,
}: {
  title: string
  description?: string
  id?: string
}) {
  return (
    <>
      <h4 id={id} className="text-[11px] font-bold tracking-[0.12em] text-ink-soft uppercase">
        {title}
      </h4>
      {description && <p className="mt-1 text-xs leading-snug text-ink-soft">{description}</p>}
    </>
  )
}
