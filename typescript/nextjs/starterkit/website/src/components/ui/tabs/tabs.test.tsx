import { fireEvent, render, screen } from '@testing-library/react';
import React, { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Tab,
  Tabs,
  TabsContent,
  TabsList,
  TabsPanel,
  TabsTrigger,
  type TabsOrientation,
  type TabsSize,
  type TabsVariant,
} from './index';

describe('Tabs Primitive', () => {
  it('renders compound structure with active default content', () => {
    render(
      <Tabs defaultValue="account">
        <TabsList aria-label="Settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings panel</TabsContent>
        <TabsContent value="password">Password reset panel</TabsContent>
      </Tabs>,
    );

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    const passwordTab = screen.getByRole('tab', { name: 'Password' });

    expect(accountTab).toBeDefined();
    expect(accountTab.getAttribute('aria-selected')).toBe('true');
    expect(accountTab.getAttribute('tabindex')).toBe('0');

    expect(passwordTab).toBeDefined();
    expect(passwordTab.getAttribute('aria-selected')).toBe('false');
    expect(passwordTab.getAttribute('tabindex')).toBe('-1');

    expect(screen.getByText('Account settings panel')).toBeDefined();
    expect(screen.queryByText('Password reset panel')).toBeNull();
  });

  it('switches content on click in uncontrolled mode', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">First</TabsTrigger>
          <TabsTrigger value="tab2">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
        <TabsContent value="tab2">Panel 2</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Panel 1')).toBeDefined();
    expect(screen.queryByText('Panel 2')).toBeNull();

    const secondTab = screen.getByRole('tab', { name: 'Second' });
    fireEvent.click(secondTab);

    expect(secondTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.queryByText('Panel 1')).toBeNull();
    expect(screen.getByText('Panel 2')).toBeDefined();
  });

  it('supports controlled mode via value and onValueChange', () => {
    function ControlledTest() {
      const [active, setActive] = useState('one');
      return (
        <Tabs value={active} onValueChange={setActive}>
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
          <TabsContent value="one">First view</TabsContent>
          <TabsContent value="two">Second view</TabsContent>
        </Tabs>
      );
    }

    render(<ControlledTest />);

    expect(screen.getByText('First view')).toBeDefined();

    fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByText('Second view')).toBeDefined();
    expect(screen.queryByText('First view')).toBeNull();
  });

  it('correctly sets WAI-ARIA pairing attributes between tab and panel', () => {
    render(
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">Preview Panel</TabsContent>
      </Tabs>,
    );

    const tab = screen.getByRole('tab', { name: 'Preview' });
    const panel = screen.getByRole('tabpanel');

    const tabId = tab.getAttribute('id');
    const panelId = panel.getAttribute('id');

    expect(tab.getAttribute('aria-controls')).toBe(panelId);
    expect(panel.getAttribute('aria-labelledby')).toBe(tabId);
  });

  it('supports semantic aliases Tab and TabsPanel', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabsList>
        <TabsPanel value="a">Panel A</TabsPanel>
        <TabsPanel value="b">Panel B</TabsPanel>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'A' })).toBeDefined();
    expect(screen.getByText('Panel A')).toBeDefined();
  });

  it('navigates horizontal tabs via arrow keys with wrap-around in LTR', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>,
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
    const list = screen.getByRole('tablist');

    tab1.focus();

    // ArrowRight -> Tab 2
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab2);
    expect(tab2.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Content 2')).toBeDefined();

    // ArrowRight -> Tab 3
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab3);
    expect(tab3.getAttribute('aria-selected')).toBe('true');

    // ArrowRight -> wraps to Tab 1
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab1);
    expect(tab1.getAttribute('aria-selected')).toBe('true');

    // ArrowLeft -> wraps to Tab 3
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tab3);

    // Home -> Tab 1
    fireEvent.keyDown(list, { key: 'Home' });
    expect(document.activeElement).toBe(tab1);

    // End -> Tab 3
    fireEvent.keyDown(list, { key: 'End' });
    expect(document.activeElement).toBe(tab3);
  });

  it('inverts horizontal arrow keys in RTL mode', () => {
    render(
      <div dir="rtl">
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      </div>,
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    const list = screen.getByRole('tablist');

    tab1.focus();

    // In RTL, ArrowLeft moves forward to visually following tab (Tab 2)
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tab2);
    expect(tab2.getAttribute('aria-selected')).toBe('true');

    // In RTL, ArrowRight moves backward to visually preceding tab (Tab 1)
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab1);
    expect(tab1.getAttribute('aria-selected')).toBe('true');
  });

  it('respects nested dir="ltr" inside an RTL container for arrow keys', () => {
    render(
      <div dir="rtl">
        <div dir="ltr">
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content 1</TabsContent>
            <TabsContent value="tab2">Content 2</TabsContent>
          </Tabs>
        </div>
      </div>,
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    const list = screen.getByRole('tablist');

    tab1.focus();
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab2);
    expect(tab2.getAttribute('aria-selected')).toBe('true');
  });

  it('marks decorative startIcon/endIcon wrappers with aria-hidden', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList fullWidth>
          <TabsTrigger
            value="a"
            startIcon={<svg data-testid="start-svg" />}
            endIcon={<svg data-testid="end-svg" />}
          >
            Item
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel</TabsContent>
      </Tabs>,
    );

    expect(screen.getByTestId('start-svg').parentElement?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('end-svg').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });

  it('navigates vertical tabs via ArrowDown and ArrowUp', () => {
    render(
      <Tabs defaultValue="v1" orientation="vertical">
        <TabsList>
          <TabsTrigger value="v1">Vertical 1</TabsTrigger>
          <TabsTrigger value="v2">Vertical 2</TabsTrigger>
        </TabsList>
        <TabsContent value="v1">V Content 1</TabsContent>
        <TabsContent value="v2">V Content 2</TabsContent>
      </Tabs>,
    );

    const v1 = screen.getByRole('tab', { name: 'Vertical 1' });
    const v2 = screen.getByRole('tab', { name: 'Vertical 2' });
    const list = screen.getByRole('tablist');

    expect(list.getAttribute('aria-orientation')).toBe('vertical');

    v1.focus();

    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(v2);
    expect(v2.getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(list, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(v1);
    expect(v1.getAttribute('aria-selected')).toBe('true');
  });

  it('supports manual activation mode with Enter and Space', () => {
    render(
      <Tabs defaultValue="t1" activationMode="manual">
        <TabsList>
          <TabsTrigger value="t1">Tab 1</TabsTrigger>
          <TabsTrigger value="t2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="t1">Content 1</TabsContent>
        <TabsContent value="t2">Content 2</TabsContent>
      </Tabs>,
    );

    const t1 = screen.getByRole('tab', { name: 'Tab 1' });
    const t2 = screen.getByRole('tab', { name: 'Tab 2' });
    const list = screen.getByRole('tablist');

    t1.focus();

    // ArrowRight moves focus to t2, but does NOT activate it in manual mode
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(t2);
    expect(t1.getAttribute('aria-selected')).toBe('true');
    expect(t2.getAttribute('aria-selected')).toBe('false');
    expect(screen.getByText('Content 1')).toBeDefined();

    // Press Enter to activate focused t2
    fireEvent.keyDown(t2, { key: 'Enter' });
    expect(t2.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Content 2')).toBeDefined();
  });

  it('skips disabled tabs in keyboard navigation and ignores clicks', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>
            B
          </TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
        <TabsContent value="c">Content C</TabsContent>
      </Tabs>,
    );

    const tabA = screen.getByRole('tab', { name: 'A' });
    const tabB = screen.getByRole('tab', { name: 'B' });
    const tabC = screen.getByRole('tab', { name: 'C' });
    const list = screen.getByRole('tablist');

    expect(tabB.getAttribute('disabled')).toBe('');
    expect(tabB.getAttribute('aria-disabled')).toBe('true');

    // Clicking disabled tab does nothing
    fireEvent.click(tabB);
    expect(tabA.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Content A')).toBeDefined();

    // Arrow navigation skips B directly to C
    tabA.focus();
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabC);
    expect(tabC.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Content C')).toBeDefined();
  });

  it('keeps inactive content mounted in DOM when forceMount is true', () => {
    render(
      <Tabs defaultValue="first">
        <TabsList>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="second">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="first">Mounted First</TabsContent>
        <TabsContent value="second" forceMount data-testid="second-panel">
          Mounted Second
        </TabsContent>
      </Tabs>,
    );

    const secondPanel = screen.getByTestId('second-panel');
    expect(secondPanel).toBeDefined();
    expect(secondPanel.getAttribute('hidden')).toBe('');
    expect(secondPanel.getAttribute('data-state')).toBe('inactive');
  });

  it('applies variant, orientation, and size data attributes', () => {
    const variants: TabsVariant[] = ['line', 'segment', 'enclosed'];
    const orientations: TabsOrientation[] = ['horizontal', 'vertical'];
    const sizes: TabsSize[] = ['sm', 'md', 'lg'];

    variants.forEach((variant) => {
      const { container, unmount } = render(
        <Tabs defaultValue="1" variant={variant}>
          <TabsList>
            <TabsTrigger value="1">1</TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      expect(container.firstChild).toHaveProperty('dataset');
      const root = container.querySelector('[data-variant]');
      expect(root?.getAttribute('data-variant')).toBe(variant);
      unmount();
    });

    orientations.forEach((orientation) => {
      const { container, unmount } = render(
        <Tabs defaultValue="1" orientation={orientation}>
          <TabsList>
            <TabsTrigger value="1">1</TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      const root = container.querySelector('[data-orientation]');
      expect(root?.getAttribute('data-orientation')).toBe(orientation);
      unmount();
    });

    sizes.forEach((size) => {
      const { container, unmount } = render(
        <Tabs defaultValue="1" size={size}>
          <TabsList>
            <TabsTrigger value="1">1</TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      const root = container.querySelector('[data-size]');
      expect(root?.getAttribute('data-size')).toBe(size);
      unmount();
    });
  });

  it('forwards refs correctly to root and trigger elements', () => {
    const rootRef = createRef<HTMLDivElement>();
    const listRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();

    render(
      <Tabs ref={rootRef} defaultValue="one">
        <TabsList ref={listRef}>
          <TabsTrigger ref={triggerRef} value="one">
            One
          </TabsTrigger>
        </TabsList>
        <TabsContent ref={contentRef} value="one">
          One Content
        </TabsContent>
      </Tabs>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(listRef.current).toBeInstanceOf(HTMLDivElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  });
});
