import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AppProviders, useI18n, useTheme } from '@/providers';
import {
  TokyoFaq,
  TokyoFooter,
  TokyoHero,
  TokyoNavbar,
  TokyoPricing,
  TokyoProcess,
} from './index';

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
    // Billing options are kit Toggle primitives, not hand-rolled buttons.
    expect(annualBtn.getAttribute('data-state')).toBe('on');
    expect(monthlyBtn.getAttribute('data-state')).toBe('off');

    fireEvent.click(monthlyBtn);
    expect(monthlyBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('$39')).toBeTruthy();

    // Switch to French and Arabic: USD currency must NOT silently turn into EUR or SAR
    fireEvent.click(screen.getByRole('button', { name: /set french/i }));
    expect(document.body.textContent).not.toMatch(/39\s*€|EUR/);

    fireEvent.click(screen.getByRole('button', { name: /set arabic/i }));
    expect(document.body.textContent).not.toMatch(/€|EUR|SAR|ر\.س/);
  });

  it('TokyoPricing keeps explicit EUR/JPY tier currencies across locale changes', () => {
    const { container } = render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <ThemeAndLocaleProbe />
        <TokyoPricing
          tiers={[
            {
              id: 'eur-plan',
              name: 'Euro Plan',
              description: 'Billed in euros',
              monthlyPrice: 49,
              annualPrice: 490,
              currency: 'EUR',
              features: [],
            },
            {
              id: 'jpy-plan',
              name: 'Yen Plan',
              description: 'Billed in yen',
              monthlyPrice: 5000,
              annualPrice: 50000,
              currency: 'JPY',
              features: [],
            },
          ]}
        />
      </AppProviders>,
    );

    const expectExplicitCurrencies = () => {
      const text = container.textContent ?? '';
      expect(text).toMatch(/€|EUR/);
      expect(text).toMatch(/¥|JPY/);
      expect(text).not.toContain('$');
    };

    expectExplicitCurrencies();
    fireEvent.click(screen.getByRole('button', { name: /set french/i }));
    expectExplicitCurrencies();
    fireEvent.click(screen.getByRole('button', { name: /set arabic/i }));
    expectExplicitCurrencies();
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

  it('TokyoHero renders 2-column wireframe layout with placeholder and filter bar by default', () => {
    const { container } = render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <TokyoHero />
      </AppProviders>,
    );

    const section = container.querySelector('section');
    expect(section?.getAttribute('data-layout')).toBe('two-column');
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('TokyoProcess renders 3-step wireframe timeline with accessible headings and steps', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <TokyoProcess />
      </AppProviders>,
    );

    expect(screen.getByText('Choose Location')).toBeInTheDocument();
    expect(screen.getByText('Pick-up Date')).toBeInTheDocument();
    expect(screen.getByText('Book your car')).toBeInTheDocument();
  });
});
