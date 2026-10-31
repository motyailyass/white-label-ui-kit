import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/providers';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher (Connected Pattern)', () => {
  it('renders locale options with explicit lang/dir attributes and switches locale on change', () => {
    const handleLocaleChange = vi.fn();
    render(
      <I18nProvider initialLocale="en" onLocaleChange={handleLocaleChange}>
        <LanguageSwitcher />
      </I18nProvider>,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');

    const options = Array.from(select.querySelectorAll('option'));
    expect(options.map((o) => o.getAttribute('lang'))).toEqual(['en', 'fr', 'ar']);
    expect(options.find((o) => o.value === 'ar')?.getAttribute('dir')).toBe('rtl');

    fireEvent.change(select, { target: { value: 'ar' } });
    expect(select.value).toBe('ar');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(handleLocaleChange).toHaveBeenCalledWith('ar');
  });

  it('generates unique DOM IDs when rendered multiple times on the same page', () => {
    render(
      <I18nProvider initialLocale="en">
        <LanguageSwitcher />
        <LanguageSwitcher />
      </I18nProvider>,
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(selects[0].id).toBeTruthy();
    expect(selects[1].id).toBeTruthy();
    expect(selects[0].id).not.toBe(selects[1].id);
  });
});
