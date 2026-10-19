import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoadMore } from './load-more'

// jsdom's observer is inert, so these cover the button and the states. That a
// scroll loads the next page is checked in a browser, in `load-more.e2e.ts`.
describe('LoadMore', () => {
  it('asks for more when the button is pressed', async () => {
    const onLoadMore = vi.fn()
    render(<LoadMore hasMore onLoadMore={onLoadMore} />)
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('keeps the button but ignores it while a page is in flight', async () => {
    const onLoadMore = vi.fn()
    render(<LoadMore hasMore loading onLoadMore={onLoadMore} />)
    const button = screen.getByRole('button', { name: 'Loading more…' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toBeEnabled()
    await userEvent.click(button)
    expect(onLoadMore).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Loading more…')
  })

  it('shows a failure with a retry, in the host’s words when given', async () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(<LoadMore hasMore error onLoadMore={onLoadMore} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load more.')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onLoadMore).toHaveBeenCalledOnce()

    rerender(<LoadMore hasMore error="The service timed out." onLoadMore={onLoadMore} />)
    expect(screen.getByRole('alert')).toHaveTextContent('The service timed out.')
  })

  it('says the list has ended, unless told not to', () => {
    const { rerender, container } = render(<LoadMore hasMore={false} onLoadMore={() => {}} />)
    expect(container).toHaveTextContent('You have reached the end.')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    rerender(<LoadMore hasMore={false} showEnd={false} onLoadMore={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('takes translated labels', () => {
    render(<LoadMore hasMore onLoadMore={() => {}} labels={{ loadMore: 'Cargar más' }} />)
    expect(screen.getByRole('button', { name: 'Cargar más' })).toBeInTheDocument()
  })
})
