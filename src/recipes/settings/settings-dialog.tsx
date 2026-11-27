import {
  AnswerPreview,
  FeatureToggles,
  HighlightPicker,
  PalettePicker,
  ProfileCard,
  SettingsDialog,
  ThemeModePicker,
} from '../../components/settings'
import { DEMO_USER } from '../../fixtures/platform/user'
import { SHIPPED_HIGHLIGHTS, SHIPPED_PALETTES } from '../../lib/settings/appearance'
import { SlidersIcon, UserIcon } from '../../primitives/icons'
import { DEMO_APPEARANCE, DEMO_CATALOGUE, useDemoFeatures } from './settings-state'

/** The dialog's two sections. The account menu opens it on either one. */
export type DemoSettingsSection = 'look' | 'features'

/**
 * The demo's Settings: one dialog for the viewer's profile and look, and for
 * what an answer shows. It is this app's arrangement of `components/settings`
 * — which sections, in what order, with which copy — and owns no control.
 *
 * Centred rather than docked to an edge: the Answer features pane carries its
 * own preview answer, so the conversation behind the dialog no longer has to
 * stay in view for a switch to make sense.
 */
export function DemoSettingsDialog({
  open,
  onClose,
  section,
  onSectionChange,
}: {
  open: boolean
  onClose: () => void
  /** Controlled. Leave it out to let the dialog keep its own. */
  section?: DemoSettingsSection
  onSectionChange?: (section: DemoSettingsSection) => void
}) {
  const demo = useDemoFeatures()

  return (
    <SettingsDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      section={section}
      onSectionChange={(id) => onSectionChange?.(id as DemoSettingsSection)}
      footnote="Saved on this device. Your admin can turn some features off for everyone."
      sections={[
        {
          id: 'look',
          label: 'Profile and look',
          icon: <UserIcon />,
          description: 'Your profile and how the chat looks.',
          reset: { label: 'Reset appearance', onReset: demo.resetAppearance },
          content: (
            <div className="divide-y divide-line *:py-5 *:first:pt-0 *:last:pb-0">
              {/* Wrapped: the stack's padding lands on its children, and the
                  card has padding of its own. */}
              <div>
                <ProfileCard {...DEMO_USER} manageHref="#account" />
              </div>
              <ThemeModePicker value={demo.themeMode} onChange={demo.setThemeMode} />
              {DEMO_APPEARANCE.palette.show && (
                <PalettePicker
                  options={SHIPPED_PALETTES}
                  value={demo.palette}
                  onChange={demo.setPalette}
                  title={DEMO_APPEARANCE.palette.title}
                  description={DEMO_APPEARANCE.palette.description}
                />
              )}
              {DEMO_APPEARANCE.highlight.show && (
                <HighlightPicker
                  options={SHIPPED_HIGHLIGHTS}
                  value={demo.highlight}
                  onChange={demo.setHighlight}
                  title={DEMO_APPEARANCE.highlight.title}
                  description={DEMO_APPEARANCE.highlight.description}
                />
              )}
            </div>
          ),
        },
        {
          id: 'features',
          label: 'Answer features',
          icon: <SlidersIcon />,
          description: 'Choose what an answer shows. The preview updates as you go.',
          reset: { label: 'Reset to defaults', onReset: demo.reset },
          content: (
            // Beside each other once the pane is wide enough for both; the
            // preview stays in view while the switches scroll.
            <div className="grid gap-6 @min-[600px]:grid-cols-[minmax(0,1fr)_280px]">
              <FeatureToggles
                catalogue={DEMO_CATALOGUE}
                flags={demo.flags}
                onChange={demo.setFlag}
              />
              <AnswerPreview
                className="self-start @min-[600px]:sticky @min-[600px]:top-0"
                show={{
                  reasoning: demo.flags.thinking,
                  tools: demo.flags.tools,
                  citations: demo.flags.sources,
                  actions: demo.flags.actions,
                  turnDetails: demo.flags.trace,
                  followups: demo.flags.followups,
                }}
              />
            </div>
          ),
        },
      ]}
    />
  )
}
