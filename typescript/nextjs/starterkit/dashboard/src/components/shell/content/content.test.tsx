import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Content, ContentBody } from './index';

describe('Content Shell Landmark', () => {
  it('renders root Content container with children', () => {
    render(
      <Content data-testid="content-root">
        <p>Main page content</p>
      </Content>,
    );

    const root = screen.getByTestId('content-root');
    expect(root).toBeTruthy();
    expect(root.textContent).toContain('Main page content');
  });

  it('renders Content.Body compound with data-layout="boxed"', () => {
    render(
      <Content>
        <Content.Body data-testid="content-body" layout="boxed">
          <p>Boxed Content</p>
        </Content.Body>
      </Content>,
    );

    const body = screen.getByTestId('content-body');
    expect(body).toBeTruthy();
    expect(body.getAttribute('data-layout')).toBe('boxed');
    expect(body.textContent).toContain('Boxed Content');
  });

  it('renders standalone ContentBody with default full layout', () => {
    render(
      <ContentBody data-testid="standalone-body">
        <p>Full layout</p>
      </ContentBody>,
    );

    const body = screen.getByTestId('standalone-body');
    expect(body).toBeTruthy();
    expect(body.getAttribute('data-layout')).toBe('full');
  });
});
