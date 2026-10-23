import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import type { RunPhase } from '../../engine'
import { RunTopBar } from './run-top-bar'

/** The run's top bar with every control live except the ones it hands back up. */
function TopBar({ phase, waitingCount = 1 }: { phase: RunPhase; waitingCount?: number }) {
  const [details, setDetails] = useState(true)
  const [log, setLog] = useState(false)
  return (
    <div className="@container rounded-surface border border-line bg-panel-solid">
      <RunTopBar
        title="Commercial loan review"
        waitingCount={waitingCount}
        phase={phase}
        onControl={fn()}
        detailsOpen={details}
        onToggleDetails={() => setDetails((d) => !d)}
        logOpen={log}
        onToggleLog={() => setLog((l) => !l)}
      />
    </div>
  )
}

const meta = {
  title: 'Workflows/Components/Run top bar',
  parameters: {
    docs: {
      description: {
        component:
          'The workflow page’s panels on their own. The top bar is sized by a `@container`, not the viewport: as its column narrows it sheds the breadcrumb, the pill’s words, the pill, then the run controls — the details toggle is never dropped.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TopBarRunning: Story = { render: () => <TopBar phase="running" waitingCount={0} /> }

export const TopBarAwaiting: Story = { render: () => <TopBar phase="awaiting" waitingCount={2} /> }

export const TopBarPaused: Story = { render: () => <TopBar phase="paused" /> }

export const TopBarFinished: Story = { render: () => <TopBar phase="finished" waitingCount={0} /> }

/** Narrow the column to watch the bar shed content in order. */
export const TopBarNarrow: Story = {
  render: () => (
    <div className="max-w-md">
      <TopBar phase="awaiting" waitingCount={2} />
    </div>
  ),
}
