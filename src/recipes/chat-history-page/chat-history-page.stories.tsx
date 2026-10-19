import type { Meta, StoryObj } from '@storybook/react-vite'
import { chatHistory } from '../../fixtures/platform/chatHistory'
import { ChatHistoryPage } from './chat-history-page'
import { createHistoryApi } from './historyApi'

// Each story is the same page in front of a different endpoint. The endpoints
// are module constants because `fetchHistory` has to keep its identity: a new one
// on every render would restart the list on every render.
const slow = createHistoryApi(chatHistory, { latencyMs: 2_500 })
const failsOnce = createHistoryApi(chatHistory, {
  fails: (page, attempt) => page === 3 && attempt === 1,
})
const unreachable = createHistoryApi(chatHistory, { fails: () => true })
const empty = createHistoryApi([])
const short = createHistoryApi(chatHistory.slice(0, 5))

const meta = {
  title: 'Recipes/Chat history page',
  component: ChatHistoryPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Conversation cards — a title, when it was last updated, when it was created — fetched a page at a time as the reader scrolls. `LoadMore` reports that the end is near, `useInfinitePages` owns the page number and the request, and `fetchHistory` is the one seam to the server; here it is a simulated endpoint answering in the Django envelope. Search and the date filter (any time, 7 days, 14 days, a custom range) are sent with each request, so they narrow the whole history and not just the cards already loaded.',
      },
    },
  },
} satisfies Meta<typeof ChatHistoryPage>

export default meta
type Story = StoryObj<typeof meta>

/** Sixty conversations, twelve to a request. Scroll: the next page is fetched before the end is reached. */
export const History: Story = { name: 'Chat history page' }

/** 2.5s a page, long enough to read the placeholders and to scroll past them to the tail. */
export const SlowConnection: Story = { args: { fetchHistory: slow } }

/** The third page is refused once. The cards already shown stay; Try again fetches that same page. */
export const PageFails: Story = { args: { fetchHistory: failsOnce } }

/** Nothing ever arrives, so there is no list to keep: the failure takes its place. */
export const Unreachable: Story = { args: { fetchHistory: unreachable } }

export const Empty: Story = { args: { fetchHistory: empty } }

/** Fewer conversations than one page: no placeholders left over, and the tail says it is the end. */
export const SinglePage: Story = { args: { fetchHistory: short } }

/** Loading on scroll turned off. The button is the only thing that fetches. */
export const ButtonOnly: Story = { args: { loadOnScroll: false } }
