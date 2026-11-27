import type { ReactNode } from 'react'
import type { FeatureCatalogue, FeatureFlags } from '../../lib/settings/types'
import type { HighlightOption, PaletteOption } from '../../lib/settings/appearance'
import type { ThemeMode } from '../../lib/settings/theme-mode'

/**
 * Copy for a section heading. Every settings control takes these so a tenant
 * can retitle a section without forking the component; each has a sensible
 * default, so passing nothing is the normal case.
 */
export type SectionCopy = {
  title?: string
  description?: string
}

export type FeatureTogglesProps<Id extends string = string> = {
  catalogue: FeatureCatalogue<Id>
  flags: FeatureFlags<Id>
  onChange: (id: Id, on: boolean) => void
  /** Rendered above the first section — preamble that belongs to the whole
   *  list rather than to one group. */
  intro?: string
  /**
   * Draw a vertical spine down the left with a node per section, the way the
   * demo narrates a turn in order. Off by default: it implies the sections are
   * a sequence, which is true of "before / in / after the answer" and false of
   * most settings groupings.
   */
  spine?: boolean
}

export type PalettePickerProps = SectionCopy & {
  options: PaletteOption[]
  value: string
  onChange: (id: string) => void
}

export type HighlightPickerProps = SectionCopy & {
  options: HighlightOption[]
  value: string
  onChange: (id: string) => void
  /**
   * A line drawn in the chosen highlight. Every `<mark>` inside it takes the
   * chosen colour. Defaults to a sample sentence; `null` leaves it out.
   */
  preview?: ReactNode
}

export type ThemeModePickerProps = SectionCopy & {
  value: ThemeMode
  onChange: (mode: ThemeMode) => void
}

export type ProfileCardProps = {
  name: string
  email: string
  /** Drawn in the avatar. */
  initials: string
  /** A short pill after the name, such as the viewer's plan. */
  plan?: string
  /** Where "Manage account" goes. Leave it out to show no link. */
  manageHref?: string
  manageLabel?: string
}

/** The parts of an answer the preview can show or hide. */
export type AnswerPreviewPart =
  | 'reasoning'
  | 'tools'
  | 'citations'
  | 'actions'
  | 'turnDetails'
  | 'followups'

export type AnswerPreviewProps = {
  /** Which parts to draw. A part left out is shown. */
  show: Partial<Record<AnswerPreviewPart, boolean>>
  title?: string
  className?: string
}

export type SettingsDialogSection = {
  id: string
  /** The entry in the section list, and the pane's title. */
  label: string
  icon?: ReactNode
  /** One line under the pane's title. */
  description?: string
  content: ReactNode
  /** The footer's left button while this section is open. Leave it out for none. */
  reset?: { label: string; onReset: () => void }
}

export type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: SettingsDialogSection[]
  /** The open section, controlled. Leave it out to let the dialog keep it. */
  section?: string
  /** The section to open first when `section` is not controlled. */
  defaultSection?: string
  onSectionChange?: (id: string) => void
  /** Default "Settings". It names the dialog. */
  title?: string
  /** A note at the foot of the section list. Hidden below 900px. */
  footnote?: ReactNode
  /** The note beside Done. Default "Saved"; `null` leaves it out. */
  status?: ReactNode
  doneLabel?: string
}
