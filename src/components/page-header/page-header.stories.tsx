import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageHeader } from './page-header'
const meta = {
  title: 'Components/Page header',
  component: PageHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: { title: 'Runs', description: 'Workflows in Alderfinch Treasury.' },
}

/** A title alone, when the page needs no explaining. */
export const TitleOnly: Story = { args: { title: 'Tasks' } }

/** Anything after the description rides in the header: a status, a count. */
export const WithStatus: Story = {
  args: {
    title: 'Tasks',
    className: 'flex items-center gap-3',
    children: (
      <span className="inline-flex h-6 items-center rounded-control border border-pill-yellow-line bg-pill-yellow-surface px-2 text-[11.5px] font-bold text-pill-yellow-fg">
        2 waiting
      </span>
    ),
  },
}

/** Actions sit beside the header, not inside it, so the heading stays a heading. */
export const BesideAnAction: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <PageHeader {...args} />
      <button
        type="button"
        className="inline-flex h-9 items-center rounded-control bg-brand-solid px-4 text-[13px] font-bold text-on-brand-solid"
      >
        Add a source
      </button>
    </div>
  ),
  args: { title: 'Ingestion', description: 'Documents and API sources for Alderfinch Treasury.' },
}

/** A welcome line uses the same header with a longer, friendlier description. */
export const Greeting: Story = {
  args: {
    title: 'Welcome, Joe',
    description: 'One run is waiting on your approval.',
    descriptionClassName: 'text-[15px] text-ink-soft',
  },
}
