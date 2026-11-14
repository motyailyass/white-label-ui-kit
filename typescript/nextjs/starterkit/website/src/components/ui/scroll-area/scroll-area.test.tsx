import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea, ScrollAreaViewport, ScrollBar } from './scroll-area';

describe('ScrollArea Primitive', () => {
  it('renders scrollable region with accessible label and tabIndex={0}', () => {
    render(
      <ScrollArea maxHeight={200} aria-label="Recent activity list">
        <div>Item 1</div>
        <div>Item 2</div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>,
    );

    const region = screen.getByRole('region', { name: /recent activity list/i });
    expect(region).toBeTruthy();
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.getAttribute('data-orientation')).toBe('vertical');
    expect(screen.getByText('Item 1')).toBeTruthy();
  });

  it('supports horizontal orientation', () => {
    render(
      <ScrollArea orientation="horizontal" maxWidth={400} aria-label="Tags list">
        <div>Tag A</div>
        <div>Tag B</div>
      </ScrollArea>,
    );

    const region = screen.getByRole('region', { name: /tags list/i });
    expect(region.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('supports both (bidirectional) orientation', () => {
    render(
      <ScrollArea orientation="both" maxHeight={300} maxWidth={500} aria-label="Data grid">
        <div>Wide and tall content</div>
      </ScrollArea>,
    );

    const region = screen.getByRole('region', { name: /data grid/i });
    expect(region.getAttribute('data-orientation')).toBe('both');
  });

  it('applies maxHeight and maxWidth to root element styles', () => {
    const { container } = render(
      <ScrollArea
        maxHeight={250}
        maxWidth="600px"
        aria-label="Styled scroll area"
        data-testid="styled-scroll-area"
      >
        <div>Content</div>
      </ScrollArea>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.maxBlockSize).toBe('250px');
    expect(root.style.maxInlineSize).toBe('600px');
  });

  it('forwards ref to root div and viewportRef to viewport div', () => {
    const rootRef = createRef<HTMLDivElement>();
    const viewportRef = createRef<HTMLDivElement>();

    render(
      <ScrollArea ref={rootRef} viewportRef={viewportRef} aria-label="Ref test">
        <div>Ref item</div>
      </ScrollArea>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(viewportRef.current).toBeInstanceOf(HTMLDivElement);
    expect(viewportRef.current?.getAttribute('role')).toBe('region');
  });

  it('applies custom viewportClassName and className', () => {
    render(
      <ScrollArea
        aria-label="Custom classes"
        className="custom-root"
        viewportClassName="custom-viewport"
        data-testid="classes-scroll-area"
      >
        <div>Content</div>
      </ScrollArea>,
    );

    const root = screen.getByTestId('classes-scroll-area');
    expect(root.classList.contains('custom-root')).toBe(true);

    const viewport = root.firstElementChild as HTMLElement;
    expect(viewport.classList.contains('custom-viewport')).toBe(true);
  });

  it('allows overriding viewportRole and viewportTabIndex for nested listboxes', () => {
    render(
      <ScrollArea viewportRole="presentation" viewportTabIndex={-1} data-testid="palette-scroll">
        <ul role="listbox">
          <li role="option" aria-selected="false">
            Action
          </li>
        </ul>
      </ScrollArea>,
    );

    expect(screen.queryByRole('region')).toBeNull();
    const root = screen.getByTestId('palette-scroll');
    const viewport = root.firstElementChild as HTMLElement;
    expect(viewport.getAttribute('role')).toBe('presentation');
    expect(viewport.getAttribute('tabindex')).toBe('-1');
    expect(viewport.hasAttribute('aria-label')).toBe(false);
  });

  it('renders ScrollAreaViewport and ScrollBar standalone components correctly', () => {
    const vpRef = createRef<HTMLDivElement>();
    const barRef = createRef<HTMLDivElement>();

    render(
      <div>
        <ScrollAreaViewport ref={vpRef} className="my-viewport">
          <div>Viewport content</div>
        </ScrollAreaViewport>
        <ScrollBar ref={barRef} orientation="horizontal" className="my-bar" />
      </div>,
    );

    expect(vpRef.current).toBeInstanceOf(HTMLDivElement);
    expect(vpRef.current?.classList.contains('my-viewport')).toBe(true);
    expect(barRef.current).toBeInstanceOf(HTMLDivElement);
    expect(barRef.current?.getAttribute('aria-hidden')).toBe('true');
    expect(barRef.current?.getAttribute('data-orientation')).toBe('horizontal');
    expect(barRef.current?.classList.contains('my-bar')).toBe(true);
  });

  it('names the viewport from aria-labelledby and never injects a default name', () => {
    render(
      <>
        <h2 id="scroll-heading">Audit trail</h2>
        <ScrollArea aria-labelledby="scroll-heading">
          <div>Content</div>
        </ScrollArea>
      </>,
    );

    const region = screen.getByRole('region', { name: 'Audit trail' });
    expect(region.hasAttribute('aria-label')).toBe(false);
    expect(screen.queryByRole('region', { name: /scrollable content/i })).toBeNull();
  });
});
