import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageBand } from './page-band'

const stats = [
  { label: 'Active', value: '9' },
  { label: 'Suspended', value: '2', note: 'Nobody can sign in' },
]

describe('PageBand', () => {
  it('draws the title as the level-one heading, with the line under it', () => {
    render(<PageBand title="Tenants" description="Every organisation." />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tenants')
    expect(screen.getByText('Every organisation.')).toBeInTheDocument()
  })

  it('draws the trail when given one, and no trail when not', () => {
    const { rerender } = render(
      <PageBand
        title="Tenants"
        breadcrumbs={[{ label: 'Overview', href: '#o' }, { label: 'Govern' }]}
      />,
    )
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    rerender(<PageBand title="Tenants" />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('opens and closes the strip from the link, and says which it will do', async () => {
    render(<PageBand title="Tenants" details={{ summary: '5 need a look', stats }} />)
    const link = screen.getByRole('button', {
      name: /5 need a look · Show details/,
    })
    expect(link).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('group', { name: 'Tenants details' })).not.toBeInTheDocument()
    await userEvent.click(link)
    expect(link).toHaveAttribute('aria-expanded', 'true')
    expect(link).toHaveTextContent('Hide details')
    const strip = screen.getByRole('group', { name: 'Tenants details' })
    expect(strip).toHaveTextContent('Nobody can sign in')
    expect(link).toHaveAttribute('aria-controls', strip.id)
  })

  it('can be controlled', async () => {
    const onOpenChange = vi.fn()
    render(<PageBand title="Tenants" details={{ stats, open: false, onOpenChange }} />)
    await userEvent.click(screen.getByRole('button', { name: /Show details/ }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: /Show details/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('makes a figure a button only when it has onSelect', async () => {
    const onSelect = vi.fn()
    render(
      <PageBand
        title="Tenants"
        details={{
          stats: [
            { label: 'Active', value: '9', onSelect },
            { label: 'Seats', value: '78%' },
          ],
          defaultOpen: true,
        }}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Active/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: /Seats/ })).not.toBeInTheDocument()
  })

  it('puts the actions and the lifted body on the page', () => {
    render(
      <PageBand title="Tenants" actions={<button type="button">Add a tenant</button>}>
        <section aria-label="All tenants" />
      </PageBand>,
    )
    expect(screen.getByRole('button', { name: 'Add a tenant' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'All tenants' })).toBeInTheDocument()
  })

  it('draws a footer row in the band only when given one', () => {
    const { container, rerender } = render(<PageBand title="Insights" />)
    expect(container.querySelector('[data-page-band-footer]')).toBeNull()
    rerender(<PageBand title="Insights" footer={<h2>Overview</h2>} />)
    const footer = container.querySelector('[data-page-band-footer]')
    expect(footer).toContainElement(screen.getByRole('heading', { level: 2, name: 'Overview' }))
    expect(screen.getByRole('banner')).toContainElement(footer as HTMLElement)
  })
})
