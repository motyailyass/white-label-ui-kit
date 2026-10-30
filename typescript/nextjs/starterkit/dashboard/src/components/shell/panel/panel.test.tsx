import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LayoutProvider } from '../layout-context';
import { Panel, PanelHeader } from './panel';

describe('Panel Component', () => {
  it('renders uncontrolled panel using LayoutProvider state', () => {
    render(
      <LayoutProvider defaultPanelOpen={true}>
        <Panel>
          <PanelHeader title="Inspector" />
          <p>Inspector content</p>
        </Panel>
      </LayoutProvider>,
    );

    const panel = screen.getByLabelText(/contextual panel/i);
    expect(panel.getAttribute('data-open')).toBe('true');

    const closeBtn = screen.getByRole('button', { name: /close panel/i });
    fireEvent.click(closeBtn);

    expect(panel.getAttribute('data-open')).toBe('false');
  });

  it('genuinely supports controlled mode via open and onOpenChange props', () => {
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <LayoutProvider>
        <Panel open={true} onOpenChange={handleOpenChange}>
          <PanelHeader title="Inspector" />
        </Panel>
      </LayoutProvider>,
    );

    const panel = screen.getByLabelText(/contextual panel/i);
    expect(panel.getAttribute('data-open')).toBe('true');

    const closeBtn = screen.getByRole('button', { name: /close panel/i });
    fireEvent.click(closeBtn);

    // Should request false explicitly
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    // Rerender with controlled false
    rerender(
      <LayoutProvider>
        <Panel open={false} onOpenChange={handleOpenChange}>
          <PanelHeader title="Inspector" />
        </Panel>
      </LayoutProvider>,
    );

    expect(panel.getAttribute('data-open')).toBe('false');
  });

  it('calls custom onClose when provided to PanelHeader', () => {
    const handleClose = vi.fn();

    render(
      <LayoutProvider>
        <Panel open={true}>
          <PanelHeader title="Inspector" onClose={handleClose} />
        </Panel>
      </LayoutProvider>,
    );

    const closeBtn = screen.getByRole('button', { name: /close panel/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
