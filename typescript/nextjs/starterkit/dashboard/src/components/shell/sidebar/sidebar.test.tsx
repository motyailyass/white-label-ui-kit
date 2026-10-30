import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LayoutProvider, useLayout } from '../layout-context';
import { Sidebar, SidebarItem, SidebarTrigger } from './sidebar';

const CustomLink = ({ href, children, ...rest }: any) => (
  <a href={href} data-custom-link="true" {...rest}>
    {children}
  </a>
);

function MobileOpenHelper() {
  const { setSidebarOpenMobile } = useLayout();
  return <button onClick={() => setSidebarOpenMobile(true)}>Open Mobile</button>;
}

function ControlledSidebarParent() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
      <button onClick={() => setCollapsed(!collapsed)}>Toggle Controlled</button>
    </Sidebar>
  );
}

describe('Sidebar Components', () => {
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
    it('provides accurate aria-expanded on desktop trigger and toggles correctly', () => {
      render(
        <LayoutProvider defaultSidebarCollapsed={false}>
          <SidebarTrigger />
          <Sidebar>
            <div>Nav content</div>
          </Sidebar>
        </LayoutProvider>,
      );

      const trigger = screen.getByRole('button', { name: /toggle navigation sidebar/i });
      expect(trigger.getAttribute('aria-controls')).toBe('app-sidebar');
      // On desktop, open sidebar should report aria-expanded="true"
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      // Click to collapse
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      // Click to expand again
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
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

    it('handles mobile drawer escape key and traps/releases focus correctly', () => {
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

      // Open mobile drawer
      fireEvent.click(screen.getByRole('button', { name: /open mobile/i }));
      expect(aside.getAttribute('data-mobile-open')).toBe('true');

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(aside.getAttribute('data-mobile-open')).toBe('false');
    });
  });
});
