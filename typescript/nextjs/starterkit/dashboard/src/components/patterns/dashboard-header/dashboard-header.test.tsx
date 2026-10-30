import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/providers/app-providers';
import { LayoutProvider } from '@/components/shell';
import { DashboardHeader } from './dashboard-header';

describe('DashboardHeader', () => {
  it('renders breadcrumbs and triggers correctly', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <LayoutProvider>
          <DashboardHeader
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Analytics', href: '/analytics' },
            ]}
          />
        </LayoutProvider>
      </AppProviders>,
    );

    expect(screen.getByRole('button', { name: /toggle navigation sidebar/i })).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Analytics')).toBeDefined();
  });

  it('renders pageTitle and custom actions', () => {
    render(
      <AppProviders initialLocale="en" defaultTheme="light">
        <LayoutProvider>
          <DashboardHeader
            pageTitle="Dashboard Title"
            pageDescription="Overview of metrics"
            actions={<button type="button">Export</button>}
          />
        </LayoutProvider>
      </AppProviders>,
    );

    expect(screen.getByText('Dashboard Title')).toBeDefined();
    expect(screen.getByText('Overview of metrics')).toBeDefined();
    expect(screen.getByRole('button', { name: /export/i })).toBeDefined();
  });
});
