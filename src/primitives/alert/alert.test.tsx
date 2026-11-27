import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from './alert'
import type { AlertTone } from './types'

const tones: AlertTone[] = ['info', 'success', 'warning', 'error']

describe('Alert', () => {
  it('is a panel unless told otherwise, the same as asking for one', () => {
    const { container: implicit } = render(<Alert title="Saved">Done.</Alert>)
    const { container: explicit } = render(
      <Alert variant="panel" title="Saved">
        Done.
      </Alert>,
    )
    expect(implicit.firstElementChild).toHaveAttribute('data-variant', 'panel')
    expect(implicit.innerHTML).toBe(explicit.innerHTML)
  })

  it.each(tones)('draws the %s tone as a bar with the same role, copy and glyph', (tone) => {
    render(
      <Alert variant="bar" tone={tone} title="Acme can make mistakes.">
        Check the sources.
      </Alert>,
    )
    const alert = screen.getByRole(tone === 'error' ? 'alert' : 'status')
    expect(alert).toHaveAttribute('data-variant', 'bar')
    expect(alert).toHaveAttribute('data-tone', tone)
    expect(alert).toHaveTextContent('Acme can make mistakes.Check the sources.')
    expect(alert.querySelector('[aria-hidden="true"] svg')).not.toBeNull()
  })

  it('keeps the action and dismiss working as a bar', async () => {
    const onClick = vi.fn()
    const onDismiss = vi.fn()
    render(
      <Alert
        variant="bar"
        tone="warning"
        title="Two sources are out of date"
        secondaryAction={{ label: 'Review sources', onClick }}
        onDismiss={onDismiss}
        dismissLabel="Dismiss source notice"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Review sources' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss source notice' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('drops the glyph in a bar when asked', () => {
    render(<Alert variant="bar" icon={false} title="Live run" />)
    expect(screen.getByRole('status').querySelector('svg')).toBeNull()
  })
})
