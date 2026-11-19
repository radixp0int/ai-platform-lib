import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { FeedbackTab } from './feedback-tab'

/** A framed page for the tab to sit on: a top bar, a rail and some cards. */
const page: Decorator = (Story) => (
  <div className="relative flex h-[480px] flex-col overflow-hidden rounded-surface border border-line bg-canvas">
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel-solid px-5">
      <span className="size-7 rounded-control bg-brand-solid" />
      <span className="font-bold text-ink-strong">Platform</span>
    </div>
    <div className="flex min-h-0 flex-1">
      <div className="w-16 shrink-0 border-r border-line bg-panel-solid" />
      <div className="grid flex-1 grid-cols-3 content-start gap-4 p-7">
        <div className="h-28 rounded-surface border border-line bg-panel-solid" />
        <div className="h-28 rounded-surface border border-line bg-panel-solid" />
        <div className="h-28 rounded-surface border border-line bg-panel-solid" />
        <div className="col-span-3 h-56 rounded-surface border border-line bg-panel-solid" />
      </div>
    </div>
    <Story />
  </div>
)

const meta = {
  title: 'Components/FeedbackTab',
  component: FeedbackTab,
  tags: ['autodocs'],
  decorators: [page],
  args: { anchor: 'container', onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'A slim orange tab on the right edge of the app shell that reads “Feedback”. Hover or focus it and it slides out to say “Report a bug”; a click opens the host’s report form. Give it `onClick` for a dialog, or `href` for a form at an address. In an app, leave `anchor` at `viewport` and render it once, beside the shell.',
      },
    },
  },
} satisfies Meta<typeof FeedbackTab>

export default meta
type Story = StoryObj<typeof meta>

/** Hover the tab, or Tab to it, to see it slide out. */
export const Playground: Story = {}

/** Held open, the way it looks on hover. */
export const Expanded: Story = { args: { expanded: true } }

/** A form at an address: the tab is a link, so open-in-new-tab works. */
export const AsLink: Story = {
  args: { href: 'https://example.com/report-a-bug', newTab: true, onClick: undefined },
}

/** Your own words. An empty `description` drops the second line. */
export const CustomCopy: Story = {
  args: { label: 'Help us', title: 'Send feedback', description: '', expanded: true },
}
