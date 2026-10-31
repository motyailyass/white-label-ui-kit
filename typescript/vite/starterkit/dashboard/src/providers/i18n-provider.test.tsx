import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider, useI18n } from './i18n-provider';

function CurrencyConsumer() {
  const { locale, direction, setLocale, formatCurrency, t } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="dir">{direction}</span>
      <span data-testid="price">{formatCurrency(100, 'USD', { maximumFractionDigits: 0 })}</span>
      <span data-testid="save">{t('common.save')}</span>
      <button type="button" onClick={() => setLocale('fr')}>
        Switch FR
      </button>
      <button type="button" onClick={() => setLocale('ar')}>
        Switch AR
      </button>
    </div>
  );
}

describe('I18nProvider', () => {
  it('derives direction from locale, persists via cookie only, and never mutates data currency', () => {
    localStorage.clear();
    const onLocaleChange = vi.fn();

    render(
      <I18nProvider initialLocale="en" onLocaleChange={onLocaleChange}>
        <CurrencyConsumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId('price').textContent).toContain('$100');

    fireEvent.click(screen.getByRole('button', { name: /switch fr/i }));
    expect(screen.getByTestId('locale').textContent).toBe('fr');
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
    expect(screen.getByTestId('price').textContent).toMatch(/\$|USD/);
    expect(screen.getByTestId('price').textContent).not.toMatch(/€|EUR/);
    expect(onLocaleChange).toHaveBeenCalledWith('fr');

    fireEvent.click(screen.getByRole('button', { name: /switch ar/i }));
    expect(screen.getByTestId('locale').textContent).toBe('ar');
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
    expect(screen.getByTestId('price').textContent).toMatch(/\$|USD/);
    expect(localStorage.getItem('locale')).toBeNull();
  });
});
