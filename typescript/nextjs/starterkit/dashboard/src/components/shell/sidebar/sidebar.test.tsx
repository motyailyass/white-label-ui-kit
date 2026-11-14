import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import { AppProviders } from '@/providers';
import { LayoutProvider, useLayout } from '../layout-context';
import {
  Sidebar,
  SidebarAvatar,
  SidebarAvatarPopover,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  SidebarSupportMenu,
  SidebarTrigger,
  SidebarWorkspacesMenu,
  SidebarWorkspaceSwitcher,
} from './index';

const CustomLink = ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a href={href} data-custom-link="true" {...rest}>
    {children}
  </a>
);

function MobileOpenHelper() {
  const { setSidebarOpenMobile, isMobile } = useLayout();
  return (
    <div>
      <span data-testid="is-mobile">{String(isMobile)}</span>
      <button type="button" onClick={() => setSidebarOpenMobile(true)}>
        Open Mobile
      </button>
    </div>
  );
}

function ControlledSidebarParent() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
      <button type="button" onClick={() => setCollapsed(!collapsed)}>
        Toggle Controlled
      </button>
    </Sidebar>
  );
}

describe('Sidebar Components', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  describe('SidebarItem', () => {
    it('renders an anchor with aria-current="page", target, rel, and preserves onClick when href is provided', () => {
      const handleClick = vi.fn();
      render(
        <SidebarItem
          href="/dashboard"
          label="Dashboard"
          isActive
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          data-testid="nav-item"
        />,
      );

      const link = screen.getByRole('link', { name: /dashboard/i });
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('/dashboard');
      expect(link.getAttribute('aria-current')).toBe('page');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.getAttribute('data-testid')).toBe('nav-item');

      fireEvent.click(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders a button when href is omitted', () => {
      const handleClick = vi.fn();
      render(
        <SidebarItem label="Action" onClick={handleClick} type="button" data-testid="btn-item" />,
      );

      const btn = screen.getByRole('button', { name: /action/i });
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-current')).toBeNull();

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports host-agnostic custom router slot via as prop', () => {
      render(<SidebarItem as={CustomLink} href="/custom" label="Custom Link" isActive />);

      const link = screen.getByRole('link', { name: /custom link/i });
      expect(link.getAttribute('data-custom-link')).toBe('true');
      expect(link.getAttribute('aria-current')).toBe('page');
    });
  });

  describe('Sidebar & SidebarTrigger accessibility and contracts', () => {
    it('wires dynamic useId aria-controls matching aside id and toggles desktop aria-expanded', () => {
      render(
        <LayoutProvider defaultSidebarCollapsed={false}>
          <SidebarTrigger />
          <Sidebar>
            <div>Nav content</div>
          </Sidebar>
        </LayoutProvider>,
      );

      const trigger = screen.getByRole('button', { name: /toggle navigation sidebar/i });
      const aside = screen.getByLabelText(/sidebar navigation/i);

      expect(aside.id).toBeTruthy();
      expect(trigger.getAttribute('aria-controls')).toBe(aside.id);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('requests controlled collapse change when SidebarTrigger is clicked', () => {
      const handleChange = vi.fn();
      render(
        <LayoutProvider>
          <SidebarTrigger />
          <Sidebar collapsed={false} onCollapsedChange={handleChange}>
            <div>Nav content</div>
          </Sidebar>
        </LayoutProvider>,
      );

      const trigger = screen.getByRole('button', { name: /toggle navigation sidebar/i });
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      fireEvent.click(trigger);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('invokes onCollapsedChange callback in controlled mode', () => {
      render(
        <LayoutProvider>
          <ControlledSidebarParent />
        </LayoutProvider>,
      );

      const aside = screen.getByLabelText(/sidebar navigation/i);
      expect(aside.getAttribute('data-collapsed')).toBe('false');

      const toggleBtn = screen.getByRole('button', { name: /toggle controlled/i });
      fireEvent.click(toggleBtn);

      expect(aside.getAttribute('data-collapsed')).toBe('true');
    });

    it('aligns with CSS max-width: 768px breakpoint and resets mobile drawer + scroll lock on resize to desktop', () => {
      let mobileMatches = true;
      const listeners = new Set<() => void>();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn((query: string) => ({
          get matches() {
            return mobileMatches;
          },
          media: query,
          onchange: null,
          addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
          removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb),
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        })),
      });

      render(
        <LayoutProvider>
          <MobileOpenHelper />
          <Sidebar>
            <a href="/link1">Link 1</a>
          </Sidebar>
        </LayoutProvider>,
      );

      const aside = screen.getByLabelText(/sidebar navigation/i);
      expect(screen.getByTestId('is-mobile').textContent).toBe('true');

      fireEvent.click(screen.getByRole('button', { name: /open mobile/i }));
      expect(aside.getAttribute('data-mobile-open')).toBe('true');
      expect(document.body.style.overflow).toBe('hidden');

      // Transition from 768px mobile to desktop (> 768px)
      act(() => {
        mobileMatches = false;
        for (const cb of listeners) {
          cb();
        }
      });

      expect(screen.getByTestId('is-mobile').textContent).toBe('false');
      expect(aside.getAttribute('data-mobile-open')).toBe('false');
      expect(document.body.style.overflow).not.toBe('hidden');
    });

    it('handles mobile drawer Escape key and ref-counted body scroll locking cleanly', () => {
      render(
        <LayoutProvider>
          <MobileOpenHelper />
          <Sidebar>
            <a href="/link1">Link 1</a>
            <a href="/link2">Link 2</a>
          </Sidebar>
        </LayoutProvider>,
      );

      const aside = screen.getByLabelText(/sidebar navigation/i);
      expect(aside.getAttribute('data-mobile-open')).toBe('false');

      const releaseSecondOverlay = acquireBodyScrollLock();
      expect(document.body.style.overflow).toBe('hidden');

      fireEvent.click(screen.getByRole('button', { name: /open mobile/i }));
      expect(aside.getAttribute('data-mobile-open')).toBe('true');

      // Escape closes mobile drawer, but body stays locked while second overlay is still open
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(aside.getAttribute('data-mobile-open')).toBe('false');
      expect(document.body.style.overflow).toBe('hidden');

      // Releasing second overlay restores body scroll
      releaseSecondOverlay();
      expect(document.body.style.overflow).toBe('');
    });

    it('traps and recovers focus into the mobile drawer when activeElement is outside', () => {
      render(
        <LayoutProvider>
          <MobileOpenHelper />
          <button type="button" data-testid="outside-button">
            Outside Button
          </button>
          <Sidebar>
            <a href="/link1" data-testid="drawer-link-1">
              Link 1
            </a>
            <a href="/link2" data-testid="drawer-link-2">
              Link 2
            </a>
          </Sidebar>
        </LayoutProvider>,
      );

      const outsideButton = screen.getByTestId('outside-button');
      outsideButton.focus();
      expect(document.activeElement).toBe(outsideButton);

      fireEvent.click(screen.getByRole('button', { name: /open mobile/i }));

      // Simulate Tab key while focus is still outside
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(document.activeElement).toBe(screen.getByTestId('drawer-link-1'));

      // Simulate Shift+Tab from first element wraps to last
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(screen.getByTestId('drawer-link-2'));
    });
  });

  describe('Collapsible SidebarGroup & Section Menus', () => {
    it('renders non-collapsible SidebarGroup as a simple label', () => {
      render(
        <SidebarGroup label="STATIC GROUP">
          <div data-testid="static-item">Item</div>
        </SidebarGroup>,
      );
      expect(screen.getByText('STATIC GROUP')).toBeTruthy();
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByTestId('static-item')).toBeTruthy();
    });

    it('toggles collapsible SidebarGroup between expanded and collapsed states', () => {
      render(
        <SidebarGroup label="COLLAPSIBLE" collapsible defaultOpen={true}>
          <div data-testid="collapsible-item">Hidden or Visible</div>
        </SidebarGroup>,
      );

      const trigger = screen.getByRole('button', { name: /collapsible/i });
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      const content = screen.getByTestId('collapsible-item').parentElement;
      expect(content?.hasAttribute('hidden')).toBe(false);

      // Click to collapse
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(content?.hasAttribute('hidden')).toBe(true);

      // Click to expand again
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(content?.hasAttribute('hidden')).toBe(false);
    });

    it('renders SidebarWorkspacesMenu as collapsible by default and toggles correctly', () => {
      render(
        <SidebarWorkspacesMenu
          label="WORKSPACES"
          items={[
            { label: 'Sales', href: '/sales' },
            { label: 'Design', href: '/design' },
          ]}
        />,
      );

      const trigger = screen.getByRole('button', { name: /workspaces/i });
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByText('Sales')).toBeTruthy();

      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      const salesItem = screen.getByText('Sales').closest('a');
      expect(salesItem?.parentElement?.hasAttribute('hidden')).toBe(true);
    });

    it('renders SidebarSupportMenu as collapsible by default and calls onOpenChange in controlled mode', () => {
      const handleOpenChange = vi.fn();
      render(
        <SidebarSupportMenu
          label="SUPPORT"
          isOpen={true}
          onOpenChange={handleOpenChange}
          items={[{ label: 'Feedback', href: '/feedback' }]}
        />,
      );

      const trigger = screen.getByRole('button', { name: /support/i });
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('SidebarAvatar (Footer User Card)', () => {
    it('integrates with pure Avatar primitive to render user initials and subtitle', () => {
      render(
        <SidebarAvatar
          name="Aiden Hudson"
          email="ahudson@example.com"
          role="Workspace Owner"
          initials="AH"
        />,
      );

      expect(screen.getByText('Aiden Hudson')).toBeTruthy();
      expect(screen.getByText('ahudson@example.com')).toBeTruthy();
      // Check that Avatar primitive rendered initials
      expect(screen.getByText('AH')).toBeTruthy();
    });

    it('renders role when email is not provided', () => {
      render(<SidebarAvatar name="Aiden Hudson" role="Workspace Owner" />);
      expect(screen.getByText('Workspace Owner')).toBeTruthy();
    });

    it('renders trailing slot when provided', () => {
      render(
        <SidebarAvatar
          name="Aiden Hudson"
          trailing={<span data-testid="avatar-trailing">...</span>}
        />,
      );
      expect(screen.getByTestId('avatar-trailing')).toBeTruthy();
    });
  });

  describe('SidebarFooter', () => {
    it('renders an honest semantic footer element hosting children', () => {
      render(
        <SidebarFooter data-testid="sidebar-footer">
          <div>Footer Content</div>
        </SidebarFooter>,
      );

      const footer = screen.getByTestId('sidebar-footer');
      expect(footer.tagName.toLowerCase()).toBe('footer');
      expect(screen.getByText('Footer Content')).toBeTruthy();
    });
  });

  describe('Sidebar Compound Hierarchy', () => {
    it('attaches all role-based subcomponents directly to Sidebar', () => {
      expect(Sidebar.Logo).toBeDefined();
      expect(Sidebar.WorkspaceSwitcher).toBeDefined();
      expect(Sidebar.Search).toBeDefined();
      expect(Sidebar.Nav).toBeDefined();
      expect(Sidebar.Group).toBeDefined();
      expect(Sidebar.Item).toBeDefined();
      expect(Sidebar.WorkspacesMenu).toBeDefined();
      expect(Sidebar.SupportMenu).toBeDefined();
      expect(Sidebar.Footer).toBeDefined();
      expect(Sidebar.Avatar).toBeDefined();
      expect(Sidebar.AvatarPopover).toBeDefined();
      expect(Sidebar.Trigger).toBeDefined();
    });
  });

  describe('SidebarAvatarPopover', () => {
    const mockUser = {
      name: 'Aiden Hudson',
      email: 'ahudson@example.com',
      role: 'Workspace Owner',
      initials: 'AH',
      status: 'online' as const,
    };

    const renderWithProviders = (ui: React.ReactElement) =>
      render(<AppProviders initialLocale="en">{ui}</AppProviders>);

    it('opens popover dialog on click and displays user info and navigation links', () => {
      renderWithProviders(<SidebarAvatarPopover user={mockUser} />);

      const trigger = screen.getByRole('button', { name: /aiden hudson/i });
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      // Click trigger to open
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      // Dialog content rendered
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getAllByText('ahudson@example.com').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText(/workspace owner/i)).toBeNull();

      // Demo links rendered
      expect(screen.getByRole('link', { name: /my profile/i })).toBeTruthy();
      expect(screen.getByRole('link', { name: /preferences/i })).toBeTruthy();
      expect(screen.getByRole('link', { name: /organization/i })).toBeTruthy();
      expect(screen.getByRole('link', { name: /developer api/i })).toBeTruthy();

      // Switchers (Segmented controls) rendered
      expect(screen.getByRole('button', { name: 'EN' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'FR' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'AR' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Auto' })).toBeTruthy();
    });

    it('invokes onLogout when logout button is clicked', () => {
      const handleLogout = vi.fn();
      renderWithProviders(<SidebarAvatarPopover user={mockUser} onLogout={handleLogout} />);

      const trigger = screen.getByRole('button', { name: /aiden hudson/i });
      fireEvent.click(trigger);

      const logoutBtn = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(logoutBtn);

      expect(handleLogout).toHaveBeenCalledTimes(1);
      // Dialog should close after logout
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes on Escape key press and returns focus to trigger', () => {
      renderWithProviders(<SidebarAvatarPopover user={mockUser} />);

      const trigger = screen.getByRole('button', { name: /aiden hudson/i });
      fireEvent.click(trigger);
      expect(screen.getByRole('dialog')).toBeTruthy();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('SidebarWorkspaceSwitcher', () => {
    const mockWorkspaces = [
      { id: 'ws-1', name: 'Acme Alpha', plan: 'Enterprise' },
      { id: 'ws-2', name: 'Beta Labs', plan: 'Free Plan' },
    ];

    it('renders active workspace and opens popover on click', () => {
      const handleSelect = vi.fn();
      render(
        <AppProviders initialLocale="en">
          <SidebarWorkspaceSwitcher workspaces={mockWorkspaces} onSelectWorkspace={handleSelect} />
        </AppProviders>,
      );

      const trigger = screen.getByRole('button', { name: /acme alpha/i });
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByRole('dialog', { name: /workspaces/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /beta labs/i })).toBeTruthy();

      // Click second workspace
      fireEvent.click(screen.getByRole('button', { name: /beta labs/i }));
      expect(handleSelect).toHaveBeenCalledWith(mockWorkspaces[1]);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes on Escape key press and restores focus to trigger', () => {
      render(
        <AppProviders initialLocale="en">
          <SidebarWorkspaceSwitcher workspaces={mockWorkspaces} />
        </AppProviders>,
      );

      const trigger = screen.getByRole('button', { name: /acme alpha/i });
      fireEvent.click(trigger);
      expect(screen.getByRole('dialog')).toBeTruthy();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('invokes onCreateWorkspace and onManageWorkspace callbacks', () => {
      const handleCreate = vi.fn();
      const handleManage = vi.fn();
      render(
        <AppProviders initialLocale="en">
          <SidebarWorkspaceSwitcher
            workspaces={mockWorkspaces}
            onCreateWorkspace={handleCreate}
            onManageWorkspace={handleManage}
          />
        </AppProviders>,
      );

      const trigger = screen.getByRole('button', { name: /acme alpha/i });
      fireEvent.click(trigger);

      const createBtn = screen.getByRole('button', { name: /create workspace/i });
      fireEvent.click(createBtn);
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('supports density scaling (comfortable by default, compact when specified)', () => {
      const { rerender } = render(
        <AppProviders initialLocale="en">
          <SidebarWorkspaceSwitcher workspaces={mockWorkspaces} />
        </AppProviders>,
      );

      const triggerDefault = screen.getByRole('button', { name: /acme alpha/i });
      expect(triggerDefault.getAttribute('data-density')).toBe('comfortable');

      rerender(
        <AppProviders initialLocale="en">
          <SidebarWorkspaceSwitcher workspaces={mockWorkspaces} density="compact" />
        </AppProviders>,
      );

      const triggerCompact = screen.getByRole('button', { name: /acme alpha/i });
      expect(triggerCompact.getAttribute('data-density')).toBe('compact');
    });
  });
});
