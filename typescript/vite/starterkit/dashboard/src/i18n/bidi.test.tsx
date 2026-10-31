import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BidiText, isolateLtrString, isolateRtlString, LRM, RLM } from './bidi';

describe('BidiText and Bidirectional helpers', () => {
  it('renders a <bdi> element by default with isolate styles', () => {
    render(<BidiText>+966 50 123 4567</BidiText>);
    const element = screen.getByText('+966 50 123 4567');
    expect(element.tagName.toLowerCase()).toBe('bdi');
    expect(element.getAttribute('data-bidi')).toBe('isolate');
  });

  it('renders custom tags such as span or code', () => {
    render(
      <BidiText as="code" dir="ltr">
        #US-9912-CODE
      </BidiText>,
    );
    const element = screen.getByText('#US-9912-CODE');
    expect(element.tagName.toLowerCase()).toBe('code');
    expect(element.getAttribute('dir')).toBe('ltr');
  });

  it('correctly brackets text with LRM and RLM unicode characters', () => {
    const ltrResult = isolateLtrString('ABC-123');
    expect(ltrResult).toBe(`${LRM}ABC-123${LRM}`);

    const rtlResult = isolateRtlString('تجربة');
    expect(rtlResult).toBe(`${RLM}تجربة${RLM}`);
  });
});
