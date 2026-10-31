import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AppProviders, useI18n, useTheme } from '@/providers';
import { TokyoFaq, TokyoFooter, TokyoNavbar, TokyoPricing } from './index';

function ThemeAndLocaleProbe() {
  const { resolvedTheme } = useTheme();
  const { setLocale } = useI18n();
  return (
    <div>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button type="button" onClick={() => setLocale('fr')}>
        Set French
      </button>
      <button type="button" onClick={() => setLocale('ar')}>
        Set Arabic
      </button>
    </div>
  );
}

describe('Tokyo Website Sections', () => {
  it('TokyoFooter ThemeSwitcher updates ThemeProvider state and localStorage instead of bypassing provider', () => {
    localStorage.clear();
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <ThemeAndLocaleProbe />
        <TokyoFooter />
      </AppProviders>,
    );

    expect(screen.getByTestId('resolved-theme').textContent).toBe('light');

    const footerToggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(footerToggle);

    expect(screen.getByTestId('resolved-theme').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('TokyoNavbar implements non-modal disclosure with aria-controls, Escape close, and zero scroll lock', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <TokyoNavbar />
      </AppProviders>,
    );

    const trigger = screen.getByRole('button', { name: /toggle navigation menu/i });
    const menuId = trigger.getAttribute('aria-controls');
    expect(menuId).toBeTruthy();

    const menu = document.getElementById(menuId!);
    expect(menu).not.toBeNull();
    expect(menu?.hasAttribute('hidden')).toBe(true);

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(menu?.hasAttribute('hidden')).toBe(false);
    expect(menu?.getAttribute('role')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(menu?.hasAttribute('hidden')).toBe(true);
  });

  it('TokyoPricing preserves USD currency across locales and exposes aria-pressed on billing toggle', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <ThemeAndLocaleProbe />
        <TokyoPricing />
      </AppProviders>,
    );

    const monthlyBtn = screen.getByRole('button', { name: /monthly/i });
    const annualBtn = screen.getByRole('button', { name: /annually/i });
    expect(annualBtn.getAttribute('aria-pressed')).toBe('true');
    expect(monthlyBtn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(monthlyBtn);
    expect(monthlyBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('$39')).toBeTruthy();

    // Switch to French and Arabic: USD currency must NOT silently turn into EUR or SAR
    fireEvent.click(screen.getByRole('button', { name: /set french/i }));
    expect(document.body.textContent).not.toMatch(/39\s*€|EUR/);

    fireEvent.click(screen.getByRole('button', { name: /set arabic/i }));
    expect(document.body.textContent).not.toMatch(/€|EUR|SAR|ر\.س/);
  });

  it('TokyoFaq pairs each trigger aria-controls with its region id via useId', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <TokyoFaq />
      </AppProviders>,
    );

    const firstTrigger = screen.getByRole('button', {
      name: /how does the tokyo wireframe differ/i,
    });
    const panelId = firstTrigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    const region = document.getElementById(panelId!);
    expect(region?.getAttribute('role')).toBe('region');
    expect(region?.getAttribute('aria-labelledby')).toBe(firstTrigger.id);
  });
});
