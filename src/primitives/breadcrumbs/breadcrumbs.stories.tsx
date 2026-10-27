import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../button'
import { ChevronRightIcon } from '../icons'
import { NavigateProvider } from '../link'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumbs,
} from './breadcrumbs'

const navigate = fn()

const meta = {
  title: 'Primitives/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Dashboard', href: '#dashboard' },
      { label: 'Tenants', href: '#tenants' },
      { label: 'Northeast portfolio', href: '#northeast' },
      { label: 'Crestview Health' },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'A location trail, `nav > ol > li`, from the top down and ending at the page you are on. Give it `items` and it draws the trail; give it children and you compose the pieces yourself. Links go through the host’s `NavigateProvider`, so a client-side router handles them. Page actions are composed beside it, never inside it.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

/** Four levels: a link for every step but the page you are on. */
export const Trail: Story = {}

/** The shortest useful trail: where you came from, and where you are. */
export const TwoLevels: Story = {
  args: {
    items: [{ label: 'Workflows', href: '#workflows' }, { label: 'Commercial loan review' }],
  },
}

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

/** A long last item truncates at the width of the trail rather than overflowing it. */
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
      { label: 'Workflows', href: '#workflows' },
      { label: 'Commercial loan review · Harbor Street Bakery Limited Liability Company' },
    ],
  },
}

/** A step with no `href` is plain text, not a link and not the current page. */
export const StepWithoutALink: Story = {
  args: { items: [{ label: 'Ingestion' }, { label: 'Add a source' }] },
}

/** In a narrow column the trail wraps rather than pushing the page wider. */
export const WrappingInANarrowColumn: Story = {
  decorators: [
    (Story) => (
      <div className="w-64 rounded-control border border-dashed border-line p-3">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      { label: 'Dashboard', href: '#dashboard' },
      { label: 'Tenants', href: '#tenants' },
      { label: 'Northeast portfolio', href: '#northeast' },
      { label: 'Harbor Street Credit Union', href: '#harbor' },
      { label: 'Access and roles' },
    ],
  },
}

/** Page actions are siblings of the trail. */
export const WithPageAction: Story = {
  args: {
    items: [{ label: 'Tenants', href: '#tenants' }, { label: 'Crestview Health' }],
  },
  render: (args) => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Breadcrumbs {...args} />
      <Button variant="primary">Add new tenant</Button>
    </div>
  ),
}

/** `tone="inverse"` reads on a dark brand band, as in the top bar of a focused flow. */
export const OnABrandBand: Story = {
  args: {
    tone: 'inverse',
    items: [{ label: 'Ingestion' }, { label: 'Add a source' }],
  },
  decorators: [
    (Story) => (
      <div className="flex h-15 items-center bg-brand-900 px-4">
        <Story />
      </div>
    ),
  ],
}

/** A host's router takes the click, so the page does not reload. */
export const WithARouter: Story = {
  args: {
    items: [{ label: 'Workflows', href: '/t/alderfinch-treasury/workflows' }, { label: 'Run 41' }],
  },
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

/** The pieces on their own, for a step that needs more than a label — here, a custom separator. */
export const ComposedByHand: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#tenants">Tenants</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRightIcon width={12} height={12} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="#crestview">Crestview Health</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Access and roles</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumbs>
  ),
}
