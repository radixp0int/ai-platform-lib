import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { NavigateProvider } from '../../primitives/link'
import { BreadcrumbTrail } from './breadcrumb-trail'

const navigate = fn()

const meta = {
  title: 'Components/Breadcrumb trail',
  component: BreadcrumbTrail,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Workflows', href: '/t/alderfinch-treasury/workflows' },
      { label: 'Commercial loan review' },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Where you are, from the top down, as links ending at the page you are on. Built from the Breadcrumbs primitive; its links go through the host’s `NavigateProvider`, so a client-side router handles them.',
      },
    },
  },
} satisfies Meta<typeof BreadcrumbTrail>
export default meta
type Story = StoryObj<typeof meta>

/** Two levels: a link up, and the page you are on. */
export const TwoLevels: Story = {}

/** Three levels: the middle one is a link too. */
export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Workflows', href: '/t/alderfinch-treasury/workflows' },
      { label: 'Commercial loan review', href: '/t/alderfinch-treasury/workflows/loan-review' },
      { label: 'Harbor Street Bakery · $450,000' },
    ],
  },
}

/** A long last item truncates rather than pushing the trail onto a second line. */
export const LongLastItem: Story = {
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      { label: 'Workflows', href: '/t/alderfinch-treasury/workflows' },
      { label: 'Commercial loan review · Harbor Street Bakery Limited Liability Company' },
    ],
  },
}

/** A host's router takes the click, so the page does not reload. */
export const WithARouter: Story = {
  decorators: [
    (Story) => (
      <NavigateProvider
        value={(href, event) => {
          event.preventDefault()
          navigate(href)
        }}
      >
        <Story />
      </NavigateProvider>
    ),
  ],
}
