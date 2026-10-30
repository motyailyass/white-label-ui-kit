import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@/providers/i18n-provider';
import { NotFoundState } from './not-found-state';

describe('NotFoundState Pattern', () => {
  it('renders 404 code and not found title', () => {
    render(
      <I18nProvider initialLocale="en">
        <NotFoundState />
      </I18nProvider>,
    );

    expect(screen.getByText('404')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
    expect(screen.getByRole('link', { name: /return to dashboard/i })).toBeDefined();
  });
});
