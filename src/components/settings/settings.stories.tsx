import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SHIPPED_HIGHLIGHTS, SHIPPED_PALETTES } from '../../lib/settings/appearance'
import type { ThemeMode } from '../../lib/settings/theme-mode'
import type { FeatureCatalogue, FeatureFlags } from '../../lib/settings/types'
import { Button } from '../../primitives/button'
import { SlidersIcon, UserIcon } from '../../primitives/icons'
import { AnswerPreview } from './answer-preview'
import { FeatureToggles } from './feature-toggles'
import { HighlightPicker } from './highlight-picker'
import { PalettePicker } from './palette-picker'
import { ProfileCard } from './profile-card'
import { SettingsDialog } from './settings-dialog'
import { ThemeModePicker } from './theme-mode-picker'

type Id = 'suggestions' | 'queue' | 'thinking' | 'tools' | 'sources' | 'followups' | 'audit'

const CATALOGUE: FeatureCatalogue<Id> = [
  {
    id: 'composer',
    title: 'Before you ask',
    description: 'What the message box offers while you write.',
    features: [
      {
        id: 'suggestions',
        label: 'Suggested questions',
        hint: 'The sparkle drop-up, and suggest-as-you-type.',
      },
      {
        id: 'queue',
        label: 'Queueing and steering',
        hint: 'Queue or interrupt while an answer runs.',
      },
    ],
  },
  {
    id: 'before',
    title: 'Before the answer',
    description: 'What the assistant shows while it is still working.',
    features: [
      { id: 'thinking', label: 'Reasoning', hint: 'The collapsible “Thought for Ns” block.' },
      { id: 'tools', label: 'Tool calls', hint: 'Status chips for each tool call.' },
    ],
  },
  {
    id: 'after',
    title: 'After the answer',
    features: [
      {
        id: 'sources',
        label: 'Sources and citations',
        hint: 'Inline [n] markers and the reference panel.',
      },
      { id: 'followups', label: 'Follow-up suggestions' },
      {
        id: 'audit',
        label: 'Audit trail',
        hint: 'Every answer is logged for compliance review.',
        locked: true,
        lockedReason: 'Required by your organisation',
      },
    ],
  },
]

const INITIAL: FeatureFlags<Id> = {
  suggestions: true,
  queue: true,
  thinking: true,
  tools: false,
  sources: true,
  followups: true,
  audit: true,
}

const meta = {
  title: 'Components/Settings',
  component: FeatureToggles,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Data-driven, presentational settings sections, and `SettingsDialog`, the shell that holds them: a section list (tabs below 900px), the open section’s pane, and a Reset / Saved / Done footer. Nothing here persists. `FeatureToggles` renders a `FeatureCatalogue`; entitlement is the host’s job — a feature the tenant lacks is absent, one they may not change is `locked`, and an empty section renders nothing.',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-lg">{Story()}</div>],
} satisfies Meta<typeof FeatureToggles>

export default meta
type Story = StoryObj<typeof FeatureToggles>

export const Toggles: Story = {
  render: function TogglesStory() {
    const [flags, setFlags] = useState(INITIAL)
    return (
      <FeatureToggles
        catalogue={CATALOGUE}
        flags={flags}
        onChange={(id, on) => setFlags((f) => ({ ...f, [id]: on }))}
        intro="Choose what the assistant shows around each answer."
      />
    )
  },
}

/** The spine implies order — right for “before / during / after”, wrong for most settings. */
export const TogglesWithSpine: Story = {
  render: function SpineStory() {
    const [flags, setFlags] = useState(INITIAL)
    return (
      <FeatureToggles
        catalogue={CATALOGUE}
        flags={flags}
        onChange={(id, on) => setFlags((f) => ({ ...f, [id]: on }))}
        spine
      />
    )
  },
}

/** Tiles preview each theme’s dark canvas, panel and action — independent of the active one. */
export const Palette: Story = {
  render: function PaletteStory() {
    const [value, setValue] = useState('default')
    return <PalettePicker options={SHIPPED_PALETTES} value={value} onChange={setValue} />
  },
}

export const Highlight: Story = {
  render: function HighlightStory() {
    const [value, setValue] = useState('orange')
    return <HighlightPicker options={SHIPPED_HIGHLIGHTS} value={value} onChange={setValue} />
  },
}

export const ThemeModeStory: Story = {
  name: 'Theme mode',
  render: function ThemeModeRender() {
    const [value, setValue] = useState<ThemeMode>('system')
    return <ThemeModePicker value={value} onChange={setValue} />
  },
}

export const Profile: Story = {
  render: () => (
    <ProfileCard
      name="Rowan Tate"
      email="rowan.tate@example.com"
      initials="RT"
      plan="Team plan"
      manageHref="#account"
    />
  ),
}

/** Each switch shows or hides its part of the answer. */
export const Preview: Story = {
  render: function PreviewStory() {
    const [flags, setFlags] = useState(INITIAL)
    return (
      <div className="flex flex-col gap-5">
        <FeatureToggles
          catalogue={CATALOGUE}
          flags={flags}
          onChange={(id, on) => setFlags((f) => ({ ...f, [id]: on }))}
        />
        <AnswerPreview
          className="self-start"
          show={{
            reasoning: flags.thinking,
            tools: flags.tools,
            citations: flags.sources,
            followups: flags.followups,
          }}
        />
      </div>
    )
  },
}

/** The shell on its own, with two small sections. */
export const Dialog: Story = {
  render: function DialogStory() {
    const [open, setOpen] = useState(true)
    const [flags, setFlags] = useState(INITIAL)
    const [palette, setPalette] = useState('default')
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open settings</Button>
        <SettingsDialog
          open={open}
          onOpenChange={setOpen}
          footnote="Saved on this device."
          sections={[
            {
              id: 'look',
              label: 'Look',
              icon: <UserIcon />,
              description: 'How the chat looks.',
              reset: { label: 'Reset appearance', onReset: () => setPalette('default') },
              content: (
                <PalettePicker options={SHIPPED_PALETTES} value={palette} onChange={setPalette} />
              ),
            },
            {
              id: 'features',
              label: 'Features',
              icon: <SlidersIcon />,
              description: 'Choose what an answer shows.',
              reset: { label: 'Reset to defaults', onReset: () => setFlags(INITIAL) },
              content: (
                <FeatureToggles
                  catalogue={CATALOGUE}
                  flags={flags}
                  onChange={(id, on) => setFlags((f) => ({ ...f, [id]: on }))}
                />
              ),
            },
          ]}
        />
      </>
    )
  },
}
