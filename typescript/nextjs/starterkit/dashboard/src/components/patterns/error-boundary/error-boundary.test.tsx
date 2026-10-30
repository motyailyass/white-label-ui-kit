import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/providers/i18n-provider';
import { ErrorBoundary } from './error-boundary';

function ProblemChild(): React.ReactNode {
  throw new Error('Explosion in widget');
}

describe('ErrorBoundary Pattern', () => {
  it('catches render errors in subtrees and displays error state fallback', () => {
    // Suppress expected console.error during React boundary test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <I18nProvider initialLocale="en">
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>
      </I18nProvider>,
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
    spy.mockRestore();
  });
});
