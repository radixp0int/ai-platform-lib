import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../../primitives/button'
import { IconButton } from '../../primitives/icon-button'
import { ExpandDiagonalIcon } from '../../primitives/icons'
import { Panel } from './panel'

const meta = {
  title: 'Components/Panel',
  component: Panel,
  tags: ['autodocs'],
  args: { title: 'Step details', onClose: fn() },
  decorators: [
    (Story) => (
      <div className="h-[420px] w-[400px] bg-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Panel>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    children: (
      <div className="flex-1 overflow-y-auto px-6 py-5 text-[13px] leading-5 text-ink-soft">
        The body owns its padding and its scrolling.
      </div>
    ),
  },
}

/** Navigation controls sit in the header, before the close button. */
export const WithActions: Story = {
  args: {
    actions: (
      <IconButton aria-label="Open full view" title="Open full view" onClick={fn()}>
        <ExpandDiagonalIcon width={14} height={14} />
      </IconButton>
    ),
    children: (
      <div className="flex-1 overflow-y-auto px-6 py-5 text-[13px] leading-5 text-ink-soft">
        Expanding is navigation, so it lives up here rather than beside the decision buttons.
      </div>
    ),
  },
}

/** A scrolling body with a footer pinned under it. */
export const WithPinnedFooter: Story = {
  args: {
    children: (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-[13px] leading-6 text-ink-soft">
          {Array.from({ length: 14 }, (_, index) => (
            <p key={index}>A line of detail about the selected item.</p>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <Button onClick={fn()}>Request changes</Button>
          <Button variant="primary" onClick={fn()}>
            Approve
          </Button>
        </div>
      </>
    ),
  },
}
