import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { SettingsDialog } from './settings-dialog'
import type { SettingsDialogSection } from '../types'

// jsdom has no top layer. Enough of <dialog> for Modal to open and close.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.open = false
  }
})

function sections(onResetLook = vi.fn(), onResetFeatures = vi.fn()): SettingsDialogSection[] {
  return [
    {
      id: 'look',
      label: 'Profile and look',
      description: 'Your profile and how the chat looks.',
      reset: { label: 'Reset appearance', onReset: onResetLook },
      content: <p>Look content</p>,
    },
    {
      id: 'features',
      label: 'Answer features',
      description: 'Choose what an answer shows.',
      reset: { label: 'Reset to defaults', onReset: onResetFeatures },
      content: <p>Features content</p>,
    },
  ]
}

describe('SettingsDialog', () => {
  it('is named by its title and opens on the first section', () => {
    render(<SettingsDialog open onOpenChange={() => {}} sections={sections()} />)
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Profile and look' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel', { name: 'Profile and look' })).toHaveTextContent(
      'Look content',
    )
    expect(screen.getByRole('heading', { name: 'Profile and look' })).toBeInTheDocument()
  })

  it('switches section and the footer reset follows it', () => {
    const onResetFeatures = vi.fn()
    render(
      <SettingsDialog open onOpenChange={() => {}} sections={sections(vi.fn(), onResetFeatures)} />,
    )
    expect(screen.getByRole('button', { name: 'Reset appearance' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Answer features' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Features content')
    fireEvent.click(screen.getByRole('button', { name: 'Reset to defaults' }))
    expect(onResetFeatures).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Reset appearance' })).not.toBeInTheDocument()
  })

  it('moves between sections with the arrow keys', () => {
    render(<SettingsDialog open onOpenChange={() => {}} sections={sections()} />)
    const first = screen.getByRole('tab', { name: 'Profile and look' })
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    const second = screen.getByRole('tab', { name: 'Answer features' })
    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(second).toHaveFocus()
    fireEvent.keyDown(second, { key: 'ArrowDown' })
    expect(first).toHaveAttribute('aria-selected', 'true')
  })

  it('reports section changes when controlled', () => {
    const onSectionChange = vi.fn()
    function Controlled() {
      const [section, setSection] = useState('features')
      return (
        <SettingsDialog
          open
          onOpenChange={() => {}}
          sections={sections()}
          section={section}
          onSectionChange={(id) => {
            onSectionChange(id)
            setSection(id)
          }}
        />
      )
    }
    render(<Controlled />)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Features content')
    fireEvent.click(screen.getByRole('tab', { name: 'Profile and look' }))
    expect(onSectionChange).toHaveBeenCalledWith('look')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Look content')
  })

  it('opens with focus on the pane, not the close button', () => {
    render(<SettingsDialog open onOpenChange={() => {}} sections={sections()} />)
    expect(screen.getByRole('tabpanel').lastElementChild).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Close dialog' })).not.toHaveFocus()
  })

  it('closes with Done, and shows the saved note', () => {
    const onOpenChange = vi.fn()
    render(<SettingsDialog open onOpenChange={onOpenChange} sections={sections()} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('leaves out the saved note when status is null', () => {
    render(<SettingsDialog open onOpenChange={() => {}} sections={sections()} status={null} />)
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })
})
