import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LayoutProvider } from '../layout-context';
import { Sidebar, SidebarItem, SidebarTrigger } from './sidebar';

const CustomLink = ({ href, children, ...rest }: any) => (
  <a href={href} data-custom-link="true" {...rest}>
    {children}
  </a>
);

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

  describe('Sidebar & SidebarTrigger accessibility', () => {
    it('provides aria-controls and aria-expanded on trigger and escapes on keydown', () => {
      render(
        <LayoutProvider>
          <SidebarTrigger />
          <Sidebar>
            <div>Nav content</div>
          </Sidebar>
        </LayoutProvider>,
      );

      const trigger = screen.getByRole('button', { name: /toggle navigation sidebar/i });
      expect(trigger.getAttribute('aria-controls')).toBe('app-sidebar');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      const aside = screen.getByLabelText(/sidebar navigation/i);
      expect(aside.id).toBe('app-sidebar');
    });
  });
});
