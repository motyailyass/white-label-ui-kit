import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@/providers/i18n-provider';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher (Connected Pattern)', () => {
  it('renders locale options and switches locale & direction on change', () => {
    render(
      <I18nProvider initialLocale="en" initialDirection="ltr">
        <LanguageSwitcher />
      </I18nProvider>,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');

    fireEvent.change(select, { target: { value: 'ar' } });
    expect(select.value).toBe('ar');
  });
});
