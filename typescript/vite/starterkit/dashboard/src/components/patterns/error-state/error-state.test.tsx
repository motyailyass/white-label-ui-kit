import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/providers';
import { ErrorState } from './error-state';

describe('ErrorState Pattern', () => {
  it('renders default h1 heading with alert semantics and triggers retry on button click', () => {
    const handleRetry = vi.fn();
    render(
      <I18nProvider initialLocale="en">
        <ErrorState onRetry={handleRetry} />
      </I18nProvider>,
    );

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Something went wrong');
    const retryBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('supports configurable headingAs="h2" when nested under an existing page h1', () => {
    render(
      <I18nProvider initialLocale="en">
        <ErrorState headingAs="h2" />
      </I18nProvider>,
    );

    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Something went wrong');
  });
});
