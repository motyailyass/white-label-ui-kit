import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentPropsWithRef, createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

function CustomRouterLink({ href, children, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a data-custom-link="true" href={href} {...props}>
      {children}
    </a>
  );
}

describe('Breadcrumb Primitive', () => {
  it('renders a nav landmark with accessible aria-label, ordered list, and leaf page', () => {
    render(
      <Breadcrumb aria-label="Breadcrumb navigation">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb navigation' });
    expect(nav.tagName).toBe('NAV');
    expect(nav.getAttribute('data-size')).toBe('md');
    expect(screen.getByRole('list').tagName).toBe('OL');

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.getAttribute('href')).toBe('/');

    const page = screen.getByText('Dashboard');
    expect(page.getAttribute('aria-current')).toBe('page');
  });

  it('renders directional chevron separator hidden from assistive tech and mirrors under RTL', () => {
    render(
      <div dir="rtl">
        <Breadcrumb aria-label="Nav">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator data-testid="sep" />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>,
    );

    const sep = screen.getByTestId('sep');
    expect(sep.tagName).toBe('LI');
    expect(sep.getAttribute('role')).toBe('presentation');
    expect(sep.getAttribute('aria-hidden')).toBe('true');

    const mirroredIcon = sep.querySelector('[data-mirror-rtl="true"]');
    expect(mirroredIcon).not.toBeNull();
  });

  it('supports custom separator content', () => {
    render(
      <Breadcrumb aria-label="Nav">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="custom-sep">/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByTestId('custom-sep').textContent).toBe('/');
  });

  it('supports polymorphic BreadcrumbLink and enforces safe rel for target="_blank"', () => {
    render(
      <Breadcrumb aria-label="Nav">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as={CustomRouterLink} href="/docs">
              Docs
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="https://example.com" target="_blank" rel="external">
              External
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const customLink = screen.getByRole('link', { name: 'Docs' });
    expect(customLink.getAttribute('data-custom-link')).toBe('true');

    const externalLink = screen.getByRole('link', { name: 'External' });
    const relTokens = (externalLink.getAttribute('rel') ?? '').split(/\s+/);
    expect(relTokens).toContain('external');
    expect(relTokens).toContain('noopener');
    expect(relTokens).toContain('noreferrer');
  });

  it('renders decorative and labeled BreadcrumbEllipsis states', () => {
    render(
      <Breadcrumb aria-label="Nav">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis data-testid="ellipsis-decorative" />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis data-testid="ellipsis-labeled" label="Collapsed levels">
              ...
            </BreadcrumbEllipsis>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const decorative = screen.getByTestId('ellipsis-decorative');
    expect(decorative.getAttribute('aria-hidden')).toBe('true');
    expect(decorative.textContent).toBe('…');

    const labeled = screen.getByTestId('ellipsis-labeled');
    expect(labeled.getAttribute('aria-hidden')).toBeNull();
    expect(screen.getByText('Collapsed levels')).toBeTruthy();
    expect(screen.getByText('...').getAttribute('aria-hidden')).toBe('true');
  });

  it('supports density size scaling and keyboard tab order across links only', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Breadcrumb aria-label="Nav" size="sm">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#section">Section</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Small</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole('navigation').getAttribute('data-size')).toBe('sm');

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Home' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Section' }));
    await user.tab();
    expect(document.activeElement).not.toBe(screen.getByText('Small'));

    rerender(
      <Breadcrumb aria-label="Nav" size="lg">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Large</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole('navigation').getAttribute('data-size')).toBe('lg');
  });

  it('forwards refs across all compound subcomponents', () => {
    const navRef = createRef<HTMLElement>();
    const listRef = createRef<HTMLOListElement>();
    const itemRef = createRef<HTMLLIElement>();
    const linkRef = createRef<HTMLAnchorElement>();
    const sepRef = createRef<HTMLLIElement>();
    const ellipsisRef = createRef<HTMLSpanElement>();
    const pageRef = createRef<HTMLSpanElement>();

    render(
      <Breadcrumb ref={navRef} aria-label="Nav">
        <BreadcrumbList ref={listRef}>
          <BreadcrumbItem ref={itemRef}>
            <BreadcrumbLink ref={linkRef} href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator ref={sepRef} />
          <BreadcrumbItem>
            <BreadcrumbEllipsis ref={ellipsisRef} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage ref={pageRef}>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(navRef.current).toBeInstanceOf(HTMLElement);
    expect(listRef.current).toBeInstanceOf(HTMLOListElement);
    expect(itemRef.current).toBeInstanceOf(HTMLLIElement);
    expect(linkRef.current).toBeInstanceOf(HTMLAnchorElement);
    expect(sepRef.current).toBeInstanceOf(HTMLLIElement);
    expect(ellipsisRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(pageRef.current).toBeInstanceOf(HTMLSpanElement);
  });
});
