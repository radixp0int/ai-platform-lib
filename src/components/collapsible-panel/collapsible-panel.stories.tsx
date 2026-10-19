import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../../primitives/button'
import { CollapsiblePanel } from './collapsible-panel'

const meta = {
  title: 'Components/CollapsiblePanel',
  component: CollapsiblePanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CollapsiblePanel>

export default meta
type Story = StoryObj<typeof CollapsiblePanel>

function Frame({ startOpen }: { startOpen: boolean }) {
  const [left, setLeft] = useState(startOpen)
  const [right, setRight] = useState(startOpen)
  return (
    <div className="flex h-[360px] gap-4 bg-canvas p-4">
      <CollapsiblePanel open={left} width="w-64" gutter="-mr-4">
        <div className="h-full rounded-surface border border-line bg-panel-solid p-4 text-[13px] text-ink-soft">
          Left panel
        </div>
      </CollapsiblePanel>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2 rounded-surface border border-line bg-panel-solid p-4">
        <span className="text-[13px] text-ink-soft">
          The middle takes whatever the panels give back.
        </span>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setLeft((value) => !value)}>
            {left ? 'Hide' : 'Show'} left
          </Button>
          <Button size="sm" onClick={() => setRight((value) => !value)}>
            {right ? 'Hide' : 'Show'} right
          </Button>
        </div>
      </div>
      <CollapsiblePanel open={right} width="w-72" gutter="-ml-4">
        <div className="h-full rounded-surface border border-line bg-panel-solid p-4 text-[13px] text-ink-soft">
          Right panel
        </div>
      </CollapsiblePanel>
    </div>
  )
}

export const BothOpen: Story = { render: () => <Frame startOpen /> }

/** Closed panels leave no gap behind: the gutter class pulls it back. */
export const BothClosed: Story = { render: () => <Frame startOpen={false} /> }

/** One panel on its own, toggled from the content beside it. */
export const SinglePanel: Story = {
  render: function SinglePanelStory() {
    const [open, setOpen] = useState(true)
    return (
      <div className="flex h-[360px] gap-4 bg-canvas p-4">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 rounded-surface border border-line bg-panel-solid p-4">
          <span className="text-[13px] text-ink-soft">The canvas</span>
          <Button size="sm" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? 'Hide' : 'Show'} details
          </Button>
        </div>
        <CollapsiblePanel open={open} width="w-80" gutter="-ml-4">
          <div className="h-full rounded-surface border border-line bg-panel-solid p-4 text-[13px] text-ink-soft">
            Details
          </div>
        </CollapsiblePanel>
      </div>
    )
  },
}
