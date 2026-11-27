import { THEME_MODES, type ThemeMode } from '../../../lib/settings/theme-mode'
import { SegmentedControl } from '../../../primitives/segmented-control'
import { SectionHeading } from '../section-heading'
import type { ThemeModePickerProps } from '../types'

/**
 * Light, dark, or match the operating system — three equal segments across
 * the section. Pair it with `useThemeMode`, which persists the choice and
 * applies it.
 */
export function ThemeModePicker({
  value,
  onChange,
  title = 'Theme',
  description,
}: ThemeModePickerProps) {
  return (
    <section>
      <SectionHeading title={title} description={description} />
      <SegmentedControl
        label={title}
        value={value}
        options={THEME_MODES}
        onValueChange={(next) => onChange(next as ThemeMode)}
        className="mt-3 w-full [&>button]:flex-1"
      />
    </section>
  )
}
