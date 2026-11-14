import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

describe('Pagination Primitive', () => {
  it('renders nav landmark and list hierarchy with accessible label and active page', () => {
    render(
      <Pagination aria-label="Table Navigation" size="lg">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#prev" label="Previous" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#next" label="Next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const nav = screen.getByRole('navigation', { name: 'Table Navigation' });
    expect(nav.getAttribute('data-size')).toBe('lg');
    expect(nav.getAttribute('role')).toBeNull();

    expect(screen.getByRole('list')).toBeTruthy();

    const activeLink = screen.getByRole('link', { name: '1' });
    expect(activeLink.getAttribute('aria-current')).toBe('page');
    expect(activeLink.getAttribute('data-size')).toBe('lg');
    expect(activeLink.getAttribute('data-active')).toBe('true');

    const nextLink = screen.getByRole('link', { name: 'Next' });
    expect(nextLink.getAttribute('data-size')).toBe('lg');
    expect(nextLink.getAttribute('data-shape')).toBe('rounded');
  });

  it('propagates pill shape across pagination controls and allows item override', () => {
    render(
      <Pagination aria-label="Pill pagination" shape="pill">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#2" shape="rounded">
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(
      screen.getByRole('navigation', { name: 'Pill pagination' }).getAttribute('data-shape'),
    ).toBe('pill');
    expect(screen.getByRole('link', { name: '1' }).getAttribute('data-shape')).toBe('pill');
    expect(screen.getByRole('link', { name: '2' }).getAttribute('data-shape')).toBe('rounded');
  });

  it('blocks clicks on disabled links and native buttons', () => {
    const onLinkClick = vi.fn();
    const onBtnClick = vi.fn();

    render(
      <Pagination aria-label="Disabled pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#prev" label="Previous" disabled onClick={onLinkClick} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext as="button" type="button" label="Next" disabled onClick={onBtnClick} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const prevLink = screen.getByRole('link', { name: 'Previous' });
    expect(prevLink.getAttribute('aria-disabled')).toBe('true');
    expect(prevLink.getAttribute('tabindex')).toBe('-1');
    expect(prevLink.getAttribute('href')).toBeNull();
    fireEvent.click(prevLink);
    expect(onLinkClick).not.toHaveBeenCalled();

    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(nextBtn);
    expect(onBtnClick).not.toHaveBeenCalled();
  });

  it('hardens target="_blank" links with noopener noreferrer and supports polymorphic button slot', () => {
    render(
      <Pagination aria-label="Security pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="https://example.com/page/2" target="_blank">
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink as="button" type="button" size="sm" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink as="button" href="#ignored" target="_blank" rel="author">
              Safe
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const extLink = screen.getByRole('link', { name: '2' });
    expect(extLink.getAttribute('rel')).toContain('noopener');
    expect(extLink.getAttribute('rel')).toContain('noreferrer');

    const btn = screen.getByRole('button', { name: '1' });
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.getAttribute('aria-current')).toBe('page');
    expect(btn.getAttribute('data-size')).toBe('sm');

    const safeButton = screen.getByRole('button', { name: 'Safe' });
    expect(safeButton.getAttribute('type')).toBe('button');
    expect(safeButton.getAttribute('href')).toBeNull();
    expect(safeButton.getAttribute('target')).toBeNull();
    expect(safeButton.getAttribute('rel')).toBeNull();
  });

  it('renders ellipsis glyph as aria-hidden while keeping screen reader label exposed', () => {
    const { container } = render(
      <Pagination aria-label="Ellipsis pagination" size="sm">
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis label="More pages" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const srOnlyText = screen.getByText('More pages');
    expect(srOnlyText).toBeTruthy();
    expect(srOnlyText.getAttribute('aria-hidden')).toBeNull();
    expect(srOnlyText.parentElement?.getAttribute('aria-hidden')).toBeNull();
    expect(srOnlyText.parentElement?.getAttribute('data-size')).toBe('sm');

    const hiddenGlyph = container.querySelector('[aria-hidden="true"]');
    expect(hiddenGlyph?.textContent).toBe('…');
  });

  it('forwards ref directly to underlying DOM elements', () => {
    const navRef = createRef<HTMLElement>();
    const contentRef = createRef<HTMLUListElement>();
    const itemRef = createRef<HTMLLIElement>();
    const linkRef = createRef<HTMLAnchorElement>();

    render(
      <Pagination ref={navRef} aria-label="Ref pagination">
        <PaginationContent ref={contentRef}>
          <PaginationItem ref={itemRef}>
            <PaginationLink ref={linkRef} href="#test">
              Test
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(navRef.current instanceof HTMLElement).toBe(true);
    expect(contentRef.current instanceof HTMLUListElement).toBe(true);
    expect(itemRef.current instanceof HTMLLIElement).toBe(true);
    expect(linkRef.current instanceof HTMLAnchorElement).toBe(true);
  });
});
