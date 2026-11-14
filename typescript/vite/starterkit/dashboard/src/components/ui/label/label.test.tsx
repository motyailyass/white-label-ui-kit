import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Label } from './label';

describe('Label Primitive', () => {
  it('renders a native label element linked via htmlFor and omits data-size by default to preserve product typography defaults', () => {
    render(
      <>
        <Label htmlFor="test-input">Email address</Label>
        <input id="test-input" type="email" />
      </>,
    );

    const label = screen.getByText('Email address');
    expect(label.tagName.toLowerCase()).toBe('label');
    expect(label.getAttribute('for')).toBe('test-input');
    expect(label.hasAttribute('data-size')).toBe(false);
    expect(screen.getByLabelText('Email address').id).toBe('test-input');
  });

  it('transfers focus to paired form control when clicked via userEvent', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="focus-target">API Key</Label>
        <input id="focus-target" type="text" />
      </>,
    );

    const label = screen.getByText('API Key');
    const input = screen.getByLabelText('API Key');

    expect(document.activeElement).not.toBe(input);
    await user.click(label);
    expect(document.activeElement).toBe(input);
  });

  it('renders aria-hidden required indicator without polluting the paired input accessible name', () => {
    render(
      <>
        <Label htmlFor="req-field" required>
          Username
        </Label>
        <input id="req-field" type="text" required />
      </>,
    );

    const star = screen.getByText('*');
    expect(star).toBeTruthy();
    expect(star.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('textbox', { name: 'Username' }).id).toBe('req-field');
  });

  it('renders custom required indicator cleanly', () => {
    render(
      <Label htmlFor="custom-req" required requiredIndicator="(required)">
        Username
      </Label>,
    );
    const indicator = screen.getByText('(required)');
    expect(indicator).toBeTruthy();
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
  });

  it('sets data-disabled attribute without emitting an invalid HTML disabled attribute', () => {
    render(
      <Label htmlFor="disabled-input" disabled>
        Disabled Field
      </Label>,
    );
    const label = screen.getByText('Disabled Field');
    expect(label.getAttribute('data-disabled')).toBe('true');
    expect(label.hasAttribute('disabled')).toBe(false);
  });

  it('sets explicit data-size attributes according to size prop', () => {
    const { rerender } = render(<Label size="sm">Density Target</Label>);
    expect(screen.getByText('Density Target').getAttribute('data-size')).toBe('sm');

    rerender(<Label size="md">Density Target</Label>);
    expect(screen.getByText('Density Target').getAttribute('data-size')).toBe('md');

    rerender(<Label size="lg">Density Target</Label>);
    expect(screen.getByText('Density Target').getAttribute('data-size')).toBe('lg');
  });

  it('renders polymorphic non-label elements cleanly and strips invalid for attribute', () => {
    render(
      <Label as="span" htmlFor="ignored-target">
        Span Label
      </Label>,
    );
    const el = screen.getByText('Span Label');
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.hasAttribute('for')).toBe(false);
  });

  it('supports RTL dir="rtl" and Arabic lang="ar" with nested LTR spans', () => {
    render(
      <Label htmlFor="rtl-field" dir="rtl" lang="ar" required>
        البريد الإلكتروني{' '}
        <span lang="en" dir="ltr">
          SSO
        </span>
      </Label>,
    );
    const label = screen.getByText(/البريد الإلكتروني/);
    expect(label.getAttribute('dir')).toBe('rtl');
    expect(label.getAttribute('lang')).toBe('ar');
    expect(screen.getByText('SSO').getAttribute('lang')).toBe('en');
  });

  it('forwards DOM ref correctly', () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Ref Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });
});
