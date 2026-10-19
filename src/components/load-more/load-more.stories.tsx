import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { LoadMore } from './load-more'
import type { LoadMoreProps } from './types'

const meta = {
  title: 'Components/LoadMore',
  component: LoadMore,
  tags: ['autodocs'],
  args: { hasMore: true, loading: false, onLoadMore: fn(), auto: false },
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'The tail of a list that grows. It fetches nothing and holds no rows: the host owns the list and the request, and this reports that more is wanted. `auto` is off in the state stories so that looking at one does not fire it.',
      },
    },
  },
} satisfies Meta<typeof LoadMore>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A page is in flight. The button stays where it is, so focus does too. */
export const Loading: Story = { args: { loading: true } }

/** A failure stops loading on scroll; only Retry asks again. */
export const Failed: Story = { args: { error: true } }

/** The host's own words for what went wrong. */
export const FailedWithMessage: Story = {
  args: { error: 'The history service timed out.' },
}

export const End: Story = { args: { hasMore: false } }

export const CustomLabels: Story = {
  args: { labels: { loadMore: 'Cargar más', loading: 'Cargando…' } },
}

const TOTAL = 95
const PAGE = 20

/** A host: it owns the rows, the count and the (pretend) request. */
function RowsHost({ failOnce = false, ...props }: Partial<LoadMoreProps> & { failOnce?: boolean }) {
  const [count, setCount] = useState(PAGE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const failed = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const loadMore = () => {
    if (loading) return
    setLoading(true)
    setError(false)
    timer.current = setTimeout(() => {
      setLoading(false)
      if (failOnce && !failed.current) {
        failed.current = true
        return setError(true)
      }
      setCount((shown) => Math.min(TOTAL, shown + PAGE))
    }, 600)
  }

  return (
    <div
      role="region"
      aria-label="Rows"
      tabIndex={0}
      className="h-80 overflow-y-auto rounded-surface border border-line bg-panel-solid"
    >
      <ul>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="border-b border-line px-4 py-2.5 text-[13px] text-ink">
            Row {index + 1}
          </li>
        ))}
      </ul>
      <LoadMore
        {...props}
        hasMore={count < TOTAL}
        loading={loading}
        error={error}
        onLoadMore={() => {
          props.onLoadMore?.()
          loadMore()
        }}
      />
    </div>
  )
}

/** Scroll the panel: each page arrives before the end of the one above it. */
export const LoadsOnScroll: Story = {
  args: { auto: true },
  render: (args) => <RowsHost {...args} />,
}

/** `auto` off: nothing loads until the button is pressed. */
export const ButtonOnly: Story = {
  render: (args) => <RowsHost {...args} />,
}

/** The second page fails once. Scrolling does not retry it; the button does. */
export const FailsThenRecovers: Story = {
  args: { auto: true },
  render: (args) => <RowsHost {...args} failOnce />,
}
