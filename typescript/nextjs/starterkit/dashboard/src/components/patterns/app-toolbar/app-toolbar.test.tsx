import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/providers/app-providers';
import { AppToolbar } from './app-toolbar';

describe('AppToolbar', () => {
  it('renders default switchers within providers', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <AppToolbar />
      </AppProviders>,
    );

    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeDefined();
  });

  it('renders custom children when provided', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <AppToolbar>
          <button type="button">Custom Action</button>
        </AppToolbar>
      </AppProviders>,
    );

    expect(screen.getByRole('button', { name: /custom action/i })).toBeDefined();
  });
});
