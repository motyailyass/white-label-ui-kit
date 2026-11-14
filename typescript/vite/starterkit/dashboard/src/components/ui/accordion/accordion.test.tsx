import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  type AccordionSize,
  type AccordionVariant,
} from './index';

describe('Accordion Primitive', () => {
  it('renders compound structure with default open item', () => {
    render(
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Question 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Answer 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Question 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Answer 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole('button', { name: 'Question 1' });
    const trigger2 = screen.getByRole('button', { name: 'Question 2' });

    expect(trigger1.getAttribute('type')).toBe('button');
    expect(trigger1.getAttribute('aria-expanded')).toBe('true');
    expect(trigger2.getAttribute('aria-expanded')).toBe('false');

    expect(screen.getByText('Answer 1')).toBeDefined();
    const region2 = screen.getByText('Answer 2').closest('[role="region"]');
    expect(region2?.getAttribute('data-state')).toBe('closed');
    expect(region2?.hasAttribute('hidden')).toBe(true);
  });

  it('switches expanded item in single mode on click', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Item 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger2 = screen.getByRole('button', { name: 'Item 2' });
    await user.click(trigger2);

    expect(trigger2.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Content 2')).toBeDefined();
    const region1 = screen.getByText('Content 1').closest('[role="region"]');
    expect(region1?.getAttribute('data-state')).toBe('closed');
    expect(region1?.hasAttribute('hidden')).toBe(true);
  });

  it('collapses an open item when clicked again if collapsible is true', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" defaultValue="item-1" collapsible>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    expect(trigger1.getAttribute('aria-expanded')).toBe('true');

    await user.click(trigger1);
    expect(trigger1.getAttribute('aria-expanded')).toBe('false');
    const region1 = screen.getByText('Content 1').closest('[role="region"]');
    expect(region1?.getAttribute('data-state')).toBe('closed');
    expect(region1?.hasAttribute('hidden')).toBe(true);
  });

  it('keeps item open when clicked again if collapsible is false', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" defaultValue="item-1" collapsible={false}>
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Item 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole('button', { name: 'Item 1' });
    expect(trigger1.getAttribute('aria-expanded')).toBe('true');

    await user.click(trigger1);
    expect(trigger1.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Content 1')).toBeDefined();
  });

  it('supports uncontrolled and controlled multiple mode allowing concurrent open items', async () => {
    const user = userEvent.setup();
    function ControlledMultiple() {
      const [values, setValues] = useState<string[]>(['one']);
      return (
        <Accordion type="multiple" value={values} onValueChange={setValues}>
          <AccordionItem value="one">
            <AccordionHeader>
              <AccordionTrigger>One</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Content One</AccordionContent>
          </AccordionItem>
          <AccordionItem value="two">
            <AccordionHeader>
              <AccordionTrigger>Two</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Content Two</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    render(<ControlledMultiple />);

    const trigger1 = screen.getByRole('button', { name: 'One' });
    const trigger2 = screen.getByRole('button', { name: 'Two' });

    expect(trigger1.getAttribute('aria-expanded')).toBe('true');
    expect(trigger2.getAttribute('aria-expanded')).toBe('false');

    await user.click(trigger2);

    expect(trigger1.getAttribute('aria-expanded')).toBe('true');
    expect(trigger2.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Content One')).toBeDefined();
    expect(screen.getByText('Content Two')).toBeDefined();
  });

  it('supports controlled single mode', async () => {
    const user = userEvent.setup();
    function ControlledSingle() {
      const [val, setVal] = useState('a');
      return (
        <Accordion type="single" value={val} onValueChange={setVal}>
          <AccordionItem value="a">
            <AccordionHeader>
              <AccordionTrigger>A</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Text A</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionHeader>
              <AccordionTrigger>B</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Text B</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    render(<ControlledSingle />);
    expect(screen.getByText('Text A')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByText('Text B')).toBeDefined();
    const regionA = screen.getByText('Text A').closest('[role="region"]');
    expect(regionA?.getAttribute('data-state')).toBe('closed');
    expect(regionA?.hasAttribute('hidden')).toBe(true);
  });

  it('unmounts content from DOM when forceMount is explicitly set to false', () => {
    render(
      <Accordion type="single" defaultValue="open-item">
        <AccordionItem value="open-item">
          <AccordionHeader>
            <AccordionTrigger>Open</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent forceMount={false}>Open Content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="closed-item">
          <AccordionHeader>
            <AccordionTrigger>Closed</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent forceMount={false}>Closed Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText('Open Content')).toBeDefined();
    expect(screen.queryByText('Closed Content')).toBeNull();
  });

  it('correctly sets WAI-ARIA pairing attributes and configurable heading tag', () => {
    render(
      <Accordion type="single" defaultValue="faq">
        <AccordionItem value="faq">
          <AccordionHeader as="h2">
            <AccordionTrigger>Security Question</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Security Answer</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const heading = screen.getByRole('heading', { level: 2, name: 'Security Question' });
    const trigger = screen.getByRole('button', { name: 'Security Question' });
    const region = screen.getByRole('region');

    expect(heading).toBeDefined();
    const triggerId = trigger.getAttribute('id');
    const contentId = region.getAttribute('id');

    expect(trigger.getAttribute('aria-controls')).toBe(contentId);
    expect(region.getAttribute('aria-labelledby')).toBe(triggerId);
  });

  it('navigates triggers via ArrowDown, ArrowUp, Home, and End keys', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionHeader>
            <AccordionTrigger>Trigger 3</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const t1 = screen.getByRole('button', { name: 'Trigger 1' });
    const t2 = screen.getByRole('button', { name: 'Trigger 2' });
    const t3 = screen.getByRole('button', { name: 'Trigger 3' });

    t1.focus();

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(t2);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(t3);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(t1);

    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(t3);

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(t1);

    await user.keyboard('{End}');
    expect(document.activeElement).toBe(t3);
  });

  it('isolates keyboard navigation between nested accordions', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" defaultValue="outer-1">
        <AccordionItem value="outer-1">
          <AccordionHeader>
            <AccordionTrigger>Outer 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <Accordion type="single">
              <AccordionItem value="inner-1">
                <AccordionHeader as="h4">
                  <AccordionTrigger>Inner 1</AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>Inner Content 1</AccordionContent>
              </AccordionItem>
              <AccordionItem value="inner-2">
                <AccordionHeader as="h4">
                  <AccordionTrigger>Inner 2</AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>Inner Content 2</AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="outer-2">
          <AccordionHeader>
            <AccordionTrigger>Outer 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Outer Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const outer1 = screen.getByRole('button', { name: 'Outer 1' });
    const outer2 = screen.getByRole('button', { name: 'Outer 2' });
    const inner1 = screen.getByRole('button', { name: 'Inner 1' });
    const inner2 = screen.getByRole('button', { name: 'Inner 2' });

    outer1.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(outer2);

    inner1.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(inner2);

    // Wraps within inner accordion instead of leaking to outer accordion
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(inner1);
  });

  it('skips disabled accordion items in keyboard roving navigation and ignores clicks', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionHeader>
            <AccordionTrigger>Trigger 1</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" disabled>
          <AccordionHeader>
            <AccordionTrigger>Trigger 2</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionHeader>
            <AccordionTrigger>Trigger 3</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const t1 = screen.getByRole('button', { name: 'Trigger 1' });
    const t2 = screen.getByRole('button', { name: 'Trigger 2' });
    const t3 = screen.getByRole('button', { name: 'Trigger 3' });

    expect(t2.getAttribute('disabled')).toBe('');
    expect(t2.getAttribute('aria-disabled')).toBe('true');

    await user.click(t2);
    expect(t2.getAttribute('aria-expanded')).toBe('false');

    t1.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(t3);
  });

  it('marks startIcon and chevrons as aria-hidden for decorative clarity', () => {
    render(
      <Accordion chevronPosition="start">
        <AccordionItem value="icon-item">
          <AccordionHeader>
            <AccordionTrigger startIcon={<svg data-testid="lead-svg" />}>
              Lead Label
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Lead Label' });
    const leadWrap = screen.getByTestId('lead-svg').parentElement;
    expect(leadWrap?.getAttribute('aria-hidden')).toBe('true');
    const chevrons = trigger.querySelectorAll('span[aria-hidden="true"]');
    expect(chevrons.length).toBeGreaterThanOrEqual(2);
  });

  it('applies variant, size, and touchTarget data attributes cleanly', () => {
    const variants: AccordionVariant[] = ['default', 'enclosed', 'flush'];
    const sizes: AccordionSize[] = ['sm', 'md', 'lg'];

    variants.forEach((variant) => {
      const { container, unmount } = render(
        <Accordion variant={variant}>
          <AccordionItem value="1">
            <AccordionHeader>
              <AccordionTrigger>Item</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const root = container.querySelector('[data-variant]');
      expect(root?.getAttribute('data-variant')).toBe(variant);
      expect(root?.getAttribute('data-size')).toBeNull();
      expect(root?.getAttribute('data-touch-target')).toBe('auto');
      unmount();
    });

    sizes.forEach((size) => {
      const { container, unmount } = render(
        <Accordion size={size} touchTarget="comfortable">
          <AccordionItem value="1">
            <AccordionHeader>
              <AccordionTrigger>Item</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const root = container.querySelector('[data-size]');
      expect(root?.getAttribute('data-size')).toBe(size);
      expect(root?.getAttribute('data-touch-target')).toBe('comfortable');
      unmount();
    });
  });

  it('throws clear errors when compound subcomponents render outside parent context', () => {
    expect(() => render(<AccordionTrigger>Orphan Trigger</AccordionTrigger>)).toThrow(
      '<AccordionTrigger> must be used within an <Accordion> container.',
    );
  });

  it('forwards refs correctly to root, trigger, and content', () => {
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();

    render(
      <Accordion ref={rootRef} type="single" defaultValue="test">
        <AccordionItem value="test">
          <AccordionHeader>
            <AccordionTrigger ref={triggerRef}>Test</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent ref={contentRef}>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  });
});
