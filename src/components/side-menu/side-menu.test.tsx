import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { flattenMenu, matchDestination, parentOf } from './menu'
import { SideMenu } from './side-menu'
import { InSideMenu, SideMenuSlotProvider } from './slot'
import type { MenuSection, SideMenuPanel, SideMenuProps } from './types'

const sections: MenuSection[] = [
  {
    id: 'top',
    items: [
      { id: 'home', label: 'Home', href: '/home', icon: <span /> },
      { id: 'chat', label: 'Chat', href: '/chat', icon: <span /> },
    ],
  },
]

const home: SideMenuPanel = {
  sections: [
    {
      id: 'build',
      label: 'Build',
      items: [
        {
          id: 'ingestion',
          label: 'Ingestion',
          href: '/ingestion',
          description: '13 of 14 sources syncing',
          status: 'warning',
        },
        { id: 'config', label: 'Chat Config', href: '/config', status: 'idle' },
      ],
    },
    {
      id: 'govern',
      label: 'Govern',
      items: [
        {
          id: 'tenant-admin',
          label: 'Tenant Admin',
          href: '/admin',
          children: [
            { id: 'tenants', label: 'Tenants', href: '/admin/tenants' },
            { id: 'people', label: 'People and roles', href: '/admin/people' },
          ],
        },
      ],
    },
  ],
}

const props: SideMenuProps = {
  sections,
  rail: ['home', 'chat'],
  activeId: 'tenants',
  panels: { home },
}

/** Makes every media query below 1200px match, or none. */
function viewport(narrow: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: narrow && query.includes('1200px'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  }))
}

describe('SideMenu panel destinations', () => {
  it('draws each destination with its second line under a group heading', () => {
    viewport(false)
    render(<SideMenu {...props} />)
    const panel = screen.getByRole('complementary', { name: 'Home' })
    expect(within(panel).getByText('Build')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /Ingestion/ })).toHaveTextContent(
      '13 of 14 sources syncing',
    )
  })

  it('puts a dot before a destination with a status, and none before one without', () => {
    viewport(false)
    const { container } = render(<SideMenu {...props} />)
    expect(container.querySelector('[data-status="warning"]')).toHaveClass('bg-notify')
    expect(container.querySelector('[data-status="idle"]')).toHaveClass('bg-transparent')
    expect(container.querySelectorAll('[data-status]')).toHaveLength(2)
  })

  it('indents the children as a group, marking the current child and not its parent', () => {
    viewport(false)
    render(<SideMenu {...props} />)
    const group = screen.getByRole('group', { name: 'Tenant Admin' })
    expect(within(group).getAllByRole('link')).toHaveLength(2)
    expect(within(group).getByRole('link', { name: 'Tenants' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Tenant Admin' })).not.toHaveAttribute('aria-current')
  })

  it('makes the app whose panel lists the page the one you are in', () => {
    viewport(false)
    render(<SideMenu {...props} />)
    const rail = screen.getByRole('navigation', { name: 'Apps' })
    expect(within(rail).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('SideMenu below 1200px', () => {
  it('sits beside the page on a wide screen', () => {
    viewport(false)
    render(<SideMenu {...props} />)
    expect(screen.getByRole('complementary')).not.toHaveAttribute('data-overlay')
  })

  it('starts closed, even with defaultPanelOpen, and the rail icon opens it over the page', async () => {
    viewport(true)
    render(<SideMenu {...props} defaultPanelOpen />)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    const icon = screen.getByRole('link', { name: 'Home' })
    expect(icon).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(icon)
    expect(screen.getByRole('complementary', { name: 'Home' })).toHaveAttribute(
      'data-overlay',
      'true',
    )
    expect(icon).toHaveAttribute('aria-expanded', 'true')
  })

  it('shuts on Escape and hands focus back to the rail', async () => {
    viewport(true)
    render(<SideMenu {...props} />)
    await userEvent.click(screen.getByRole('link', { name: 'Home' }))
    fireEvent.keyDown(screen.getByRole('link', { name: 'Tenants' }), { key: 'Escape' })
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus()
  })

  it('shuts when another page is picked', async () => {
    viewport(true)
    const onPanelOpenChange = vi.fn()
    const { rerender } = render(<SideMenu {...props} onPanelOpenChange={onPanelOpenChange} />)
    await userEvent.click(screen.getByRole('link', { name: 'Home' }))
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    rerender(<SideMenu {...props} activeId="people" onPanelOpenChange={onPanelOpenChange} />)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(onPanelOpenChange).toHaveBeenLastCalledWith(false)
  })
})

describe('menu helpers', () => {
  const nested: MenuSection[] = [
    { id: 's', items: [{ ...sections[0].items[0], children: home.sections![1].items }] },
  ]

  it('flatten and match through grandchildren', () => {
    expect(flattenMenu(nested).map((item) => item.id)).toEqual([
      'home',
      'tenant-admin',
      'tenants',
      'people',
    ])
    expect(matchDestination(nested, '/admin/people/42')?.id).toBe('people')
  })

  it('finds the parent of a grandchild', () => {
    expect(parentOf(nested, 'tenants')?.id).toBe('tenant-admin')
  })
})

describe('InSideMenu', () => {
  it("adds the page's rows to the panel and its action to the panel's heading", async () => {
    viewport(false)
    const onNew = vi.fn()
    render(
      <SideMenuSlotProvider>
        <SideMenu
          sections={sections}
          rail={['home', 'chat']}
          activeId="chat"
          panels={{ chat: { title: 'Chat' } }}
        />
        <InSideMenu action={{ label: 'New chat', onSelect: onNew }}>
          <p>Recent chats</p>
        </InSideMenu>
      </SideMenuSlotProvider>,
    )
    const panel = screen.getByRole('complementary', { name: 'Chat' })
    expect(within(panel).getByText('Recent chats')).toBeTruthy()
    const heading = within(panel).getByRole('heading', { name: 'Chat' }).parentElement!
    await userEvent.click(within(heading).getByRole('button', { name: 'New chat' }))
    expect(onNew).toHaveBeenCalledOnce()
  })

  it('draws nothing where there is no panel', () => {
    render(
      <InSideMenu action={{ label: 'New chat', onSelect: () => {} }}>
        <p>Recent chats</p>
      </InSideMenu>,
    )
    expect(screen.queryByText('Recent chats')).toBeNull()
    expect(screen.queryByRole('button', { name: 'New chat' })).toBeNull()
  })
})
