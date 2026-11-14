import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header, HeaderBreadcrumbs, HeaderHeading, HeaderToolbar } from './header';

describe('Header Shell Component', () => {
  it('renders semantic header landmark with compound subcomponents', () => {
    render(
      <Header>
        <Header.Heading title="Dashboard" description="Overview of platform performance" />
        <Header.Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />
        <Header.Toolbar>
          <button type="button">Action</button>
        </Header.Toolbar>
      </Header>,
    );

    const header = screen.getByRole('banner');
    expect(header).toBeTruthy();
    expect(header.getAttribute('data-sticky')).toBe('true');
    expect(header.getAttribute('data-density')).toBe('comfortable');

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Dashboard');
    expect(screen.getByText('Overview of platform performance')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: /breadcrumbs/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /action/i })).toBeTruthy();
  });

  it('supports compact density mode', () => {
    render(
      <Header density="compact" sticky={false}>
        <Header.Heading title="Compact Header" />
      </Header>,
    );

    const header = screen.getByRole('banner');
    expect(header.getAttribute('data-density')).toBe('compact');
    expect(header.getAttribute('data-sticky')).toBe('false');
  });

  it('exposes direct function exports alongside compound object', () => {
    expect(Header.Heading).toBe(HeaderHeading);
    expect(Header.Breadcrumbs).toBe(HeaderBreadcrumbs);
    expect(Header.Toolbar).toBe(HeaderToolbar);
  });
});
