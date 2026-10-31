import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import { LayoutProvider, useLayout } from '../layout-context';
import { Sidebar, SidebarItem, SidebarTrigger } from './sidebar';

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
  });
});
