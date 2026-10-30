import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { BidiText, isolateLtrString, isolateRtlString, LRM, RLM } from './bidi';

describe('BidiText and isolation helpers', () => {
  it('renders a bdi element by default with isolate unicodeBidi', () => {
    const { container } = render(<BidiText>+966 50 123 4567</BidiText>);
    const bdi = container.querySelector('bdi');
    expect(bdi).toBeTruthy();
    expect(bdi?.getAttribute('data-bidi')).toBe('isolate');
    expect(bdi?.textContent).toBe('+966 50 123 4567');
  });

  it('supports custom tag and dir attributes', () => {
    const { container } = render(
      <BidiText as="span" dir="ltr">
        user@domain.com
      </BidiText>,
    );
    const span = container.querySelector('span');
    expect(span).toBeTruthy();
    expect(span?.getAttribute('dir')).toBe('ltr');
  });

  it('wraps strings with LRM and RLM markers', () => {
    const ltrWrapped = isolateLtrString('test');
    expect(ltrWrapped).toBe(`${LRM}test${LRM}`);

    const rtlWrapped = isolateRtlString('اختبار');
    expect(rtlWrapped).toBe(`${RLM}اختبار${RLM}`);
  });
});
