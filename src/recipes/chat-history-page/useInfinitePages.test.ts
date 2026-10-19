import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Page, PageRequest } from '../../components/paging'
import { useInfinitePages, type FetchPage } from './useInfinitePages'

type Row = { id: string }
const row = (n: number): Row => ({ id: `row-${n}` })
const getId = (r: Row) => r.id

/** One page of `rows`, `size` at a time, as the adapters would hand it over. */
function pageOf(rows: Row[], { page, size, sort }: PageRequest): Page<Row> {
  const content = rows.slice((page - 1) * size, page * size)
  const totalPages = Math.max(1, Math.ceil(rows.length / size))
  return {
    content,
    page,
    size,
    elements: content.length,
    offset: (page - 1) * size + 1,
    first: page === 1,
    last: page >= totalPages,
    totalElements: rows.length,
    totalPages,
    sort,
  }
}

const TEN = Array.from({ length: 10 }, (_, index) => row(index + 1))
const ids = (rows: Row[]) => rows.map(getId)

/** An endpoint the test answers by hand, to hold a request open. */
function deferred() {
  const calls: { request: PageRequest; resolve: (page: Page<Row>) => void; reject: () => void }[] =
    []
  const fetchPage: FetchPage<Row> = (request) =>
    new Promise((resolve, reject) => calls.push({ request, resolve, reject }))
  return { calls, fetchPage }
}

describe('useInfinitePages', () => {
  it('fetches the first page on mount and appends the next on request', async () => {
    const fetchPage = vi.fn<FetchPage<Row>>(async (request) => pageOf(TEN, request))
    const { result } = renderHook(() => useInfinitePages(fetchPage, { size: 4, getId }))
    expect(result.current.pending).toBe(true)
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.items).toHaveLength(4))
    expect(result.current).toMatchObject({ total: 10, hasMore: true, loading: false })

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.items).toHaveLength(8))
    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.items).toHaveLength(10))

    expect(ids(result.current.items)).toEqual(ids(TEN))
    expect(result.current.hasMore).toBe(false)
    expect(fetchPage.mock.calls.map(([request]) => request.page)).toEqual([1, 2, 3])
  })

  it('stops asking once the last page has arrived', async () => {
    const fetchPage = vi.fn<FetchPage<Row>>(async (request) => pageOf(TEN.slice(0, 3), request))
    const { result } = renderHook(() => useInfinitePages(fetchPage, { size: 4, getId }))
    await waitFor(() => expect(result.current.hasMore).toBe(false))
    act(() => result.current.loadMore())
    expect(fetchPage).toHaveBeenCalledOnce()
  })

  it('ignores a second request while one is in flight', async () => {
    const { calls, fetchPage } = deferred()
    const { result } = renderHook(() => useInfinitePages(fetchPage, { size: 4, getId }))
    act(() => {
      result.current.loadMore()
      result.current.loadMore()
    })
    expect(calls).toHaveLength(1)

    await act(async () => calls[0].resolve(pageOf(TEN, calls[0].request)))
    act(() => {
      result.current.loadMore()
      result.current.loadMore()
    })
    expect(calls.map((call) => call.request.page)).toEqual([1, 2])
  })

  it('asks for the same page again after a failure, keeping the rows it has', async () => {
    const { calls, fetchPage } = deferred()
    const { result } = renderHook(() => useInfinitePages(fetchPage, { size: 4, getId }))
    await act(async () => calls[0].resolve(pageOf(TEN, calls[0].request)))

    act(() => result.current.loadMore())
    await act(async () => calls[1].reject())
    expect(result.current).toMatchObject({ failed: true, loading: false, hasMore: true })
    expect(result.current.items).toHaveLength(4)

    act(() => result.current.loadMore())
    expect(calls[2].request.page).toBe(2)
    expect(result.current.failed).toBe(false)
    await act(async () => calls[2].resolve(pageOf(TEN, calls[2].request)))
    expect(result.current.items).toHaveLength(8)
  })

  it('drops a row it already shows when the list shifts between requests', async () => {
    const { calls, fetchPage } = deferred()
    const { result } = renderHook(() => useInfinitePages(fetchPage, { size: 4, getId }))
    await act(async () => calls[0].resolve(pageOf(TEN, calls[0].request)))

    // A conversation further down was answered and moved to the top, so every
    // row slid one place: page 2 now starts with the row that ended page 1.
    const shifted = [row(9), ...TEN.filter((r) => r.id !== 'row-9')]
    act(() => result.current.loadMore())
    await act(async () => calls[1].resolve(pageOf(shifted, calls[1].request)))

    expect(ids(result.current.items)).toEqual(ids([1, 2, 3, 4, 5, 6, 7].map(row)))
  })

  it('throws away an answer that arrives after the page is gone', async () => {
    const { calls, fetchPage } = deferred()
    const aborted = vi.fn()
    const watching: FetchPage<Row> = (request, signal) => {
      signal.addEventListener('abort', aborted)
      return fetchPage(request, signal)
    }
    const { unmount } = renderHook(() => useInfinitePages(watching, { size: 4, getId }))
    unmount()
    expect(aborted).toHaveBeenCalledOnce()
    await act(async () => calls[0].resolve(pageOf(TEN, calls[0].request)))
  })

  it('starts over when the source changes', async () => {
    const first = vi.fn<FetchPage<Row>>(async (request) => pageOf(TEN, request))
    const second = vi.fn<FetchPage<Row>>(async (request) => pageOf([row(99)], request))
    const { result, rerender } = renderHook(
      ({ source }) => useInfinitePages(source, { size: 4, getId }),
      { initialProps: { source: first as FetchPage<Row> } },
    )
    await waitFor(() => expect(result.current.items).toHaveLength(4))

    rerender({ source: second })
    await waitFor(() => expect(ids(result.current.items)).toEqual(['row-99']))
    expect(second.mock.calls[0][0].page).toBe(1)
  })
})
