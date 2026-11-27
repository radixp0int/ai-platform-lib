import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../../../primitives/button'
import { DemoFeaturesProvider, useDemoFeatureState } from '../shared/demoFeatures'
import { DemoSettingsDialog, type DemoSettingsSection } from './settings-dialog'

function Settings({ section = 'look' }: { section?: DemoSettingsSection }) {
  const value = useDemoFeatureState()
  const [open, setOpen] = useState(true)
  const [current, setCurrent] = useState(section)
  return (
    <DemoFeaturesProvider value={value}>
      <Button onClick={() => setOpen(true)}>Open settings</Button>
      <DemoSettingsDialog
        open={open}
        onClose={() => setOpen(false)}
        section={current}
        onSectionChange={setCurrent}
      />
    </DemoFeaturesProvider>
  )
}

const meta = {
  title: 'Chat/Recipes/Settings dialog',
  component: Settings,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The demo’s one Settings dialog, opened from the account menu on either section. “Profile and look” holds the profile, theme, dark palette and citation highlight; “Answer features” holds the switches beside a preview answer that follows them. Below 900px the section list becomes tabs.',
      },
    },
  },
  argTypes: {
    section: { control: 'inline-radio', options: ['look', 'features'] },
  },
} satisfies Meta<typeof Settings>

export default meta
type Story = StoryObj<typeof meta>

export const ProfileAndLook: Story = {}

export const AnswerFeatures: Story = { args: { section: 'features' } }

export const Dark: Story = { args: { section: 'features' }, globals: { mode: 'dark' } }

export const DarkProfileAndLook: Story = { globals: { mode: 'dark' } }

/** Below 900px the section list turns into a row of tabs above the pane. */
export const Narrow: Story = {
  args: { section: 'features' },
  globals: { viewport: { value: 'tablet', isRotated: false } },
}
