import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../../primitives/button'
import { SectionCard } from './section-card'

const meta = {
  title: 'Components/Section card',
  component: SectionCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-[48rem] p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Inputs and outputs',
    description: 'What a run needs to start, and what it produces when it finishes',
    children: <p className="m-0 px-5 py-4 text-sm text-ink">The section’s content.</p>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A bordered section of a page: a header with a title, a line under it and one action, then the content, then an optional strip beneath. The content area has no padding, so a picture or a table can run to the edge.',
      },
    },
  },
} satisfies Meta<typeof SectionCard>
export default meta
type Story = StoryObj<typeof meta>

/** A title and a line under it. */
export const Default: Story = {}

/** One action at the end of the header. */
export const WithAction: Story = {
  args: {
    action: (
      <Button variant="secondary" size="md" onClick={fn()}>
        Try the start form
      </Button>
    ),
  },
}

/** A strip under the content, for a legend or a line of meta text. */
export const WithFooter: Story = {
  args: { footer: 'Dashed steps only run sometimes.' },
}

/** Content that runs to the edge of the card, as a picture or a table would. */
export const FullBleed: Story = {
  args: {
    children: <div className="h-32 bg-tint/10" aria-hidden />,
  },
}
