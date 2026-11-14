import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  getSharedPrimaryNavigation,
  getSharedSupportNavigation,
  getSharedUser,
  getSharedWorkspaces,
  getSharedWorkspacesNavigation,
} from '@/fixtures/navigation';
import { AppProviders, useI18n } from '@/providers';
import { Layout01 } from './layout-01';

function Layout01TestHarness() {
  const { t } = useI18n();
  const workspaces = getSharedWorkspaces(t);
  const primaryItems = getSharedPrimaryNavigation(t);
  const workspaceItems = getSharedWorkspacesNavigation(t);
  const supportItems = getSharedSupportNavigation(t);
  const user = getSharedUser(t);

  return (
    <Layout01
      sidebarSlot={
        <Layout01.Sidebar aria-label={t('dashboard.shell.sidebarLabel')}>
          <Layout01.Sidebar.WorkspaceSwitcher workspaces={workspaces} />
          <Layout01.Sidebar.Search
            placeholder={t('common.search')}
            aria-label={t('common.search')}
          />
          <Layout01.Sidebar.Nav aria-label={t('dashboard.shell.primaryNavLabel')}>
            {primaryItems.map((item) => (
              <Layout01.Sidebar.Item
                key={item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                isActive={item.isActive}
              />
            ))}
            <Layout01.Sidebar.WorkspacesMenu
              label={t('dashboard.nav.workspaces')}
              items={workspaceItems}
            />
            <Layout01.Sidebar.SupportMenu label={t('dashboard.nav.support')} items={supportItems} />
          </Layout01.Sidebar.Nav>
          <Layout01.Sidebar.Footer>
            <Layout01.Sidebar.AvatarPopover user={user} />
          </Layout01.Sidebar.Footer>
        </Layout01.Sidebar>
      }
      headerSlot={
        <Layout01.Header>
          <Layout01.Header.Heading title={t('dashboard.nav.leads')} />
        </Layout01.Header>
      }
    >
      <Layout01.Content>
        <Layout01.Content.Body layout="full">
          <div data-testid="layout-01-body">Body Content</div>
        </Layout01.Content.Body>
      </Layout01.Content>
    </Layout01>
  );
}

describe('Layout01', () => {
  it('renders semantic shell landmarks, fixed sidebar navigation, search input, and header', () => {
    render(
      <AppProviders initialLocale="en">
        <Layout01TestHarness />
      </AppProviders>,
    );

    expect(screen.getByRole('complementary', { name: /sidebar navigation/i })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Leads' })).toBeTruthy();
    expect(screen.getByRole('searchbox', { name: /search/i })).toBeTruthy();
    expect(screen.getByTestId('layout-01-body')).toBeTruthy();
  });

  it('defers sidebar width to the layout token unless a caller overrides it', () => {
    const { rerender } = render(
      <AppProviders initialLocale="en">
        <Layout01 data-testid="layout-01-shell" />
      </AppProviders>,
    );

    const shell = screen.getByTestId('layout-01-shell');
    expect(shell.style.getPropertyValue('--sidebar-width')).toBe('');

    rerender(
      <AppProviders initialLocale="en">
        <Layout01 data-testid="layout-01-shell" sidebarWidth={300} />
      </AppProviders>,
    );

    expect(screen.getByTestId('layout-01-shell').style.getPropertyValue('--sidebar-width')).toBe(
      '300px',
    );
  });
});
