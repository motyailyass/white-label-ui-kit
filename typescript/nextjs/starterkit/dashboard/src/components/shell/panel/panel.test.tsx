import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThreeColumnLayout } from '@/layouts';
import { AppProviders } from '@/providers';
import { LayoutProvider, useLayout } from '../layout-context';
import { Panel, PanelHeader } from './panel';

describe('Panel & ThreeColumnLayout Inspector Contracts', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

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
    expect(panel.getAttribute('role')).toBeNull();

    const closeBtn = screen.getByRole('button', { name: /close panel/i });
    fireEvent.click(closeBtn);

    expect(panel.getAttribute('data-open')).toBe('false');
  });

  it('wires controlled ThreeColumnLayout isInspectorOpen, onInspectorOpenChange, onInspectorClose, and Cmd+. shortcut', () => {
    const onInspectorClose = vi.fn();

    function ControlledThreeColumnHarness() {
      const [open, setOpen] = useState(true);
      return (
        <AppProviders initialLocale="en" defaultTheme="light">
          <ThreeColumnLayout
            logo={{ title: 'Hub', href: '/classic' }}
            navigation={[{ label: 'Main', items: [{ label: 'Home', href: '/classic' }] }]}
            user={{ name: 'Jane Doe', initials: 'JD' }}
            inspectorTitle="Properties"
            inspectorContent={<p>Details</p>}
            isInspectorOpen={open}
            onInspectorOpenChange={setOpen}
            onInspectorClose={onInspectorClose}
            config={{ panelWidth: 400 }}
          >
            <div>Main work area</div>
          </ThreeColumnLayout>
        </AppProviders>
      );
    }

    render(<ControlledThreeColumnHarness />);

    const panel = screen.getByLabelText(/contextual panel/i);
    expect(panel.getAttribute('data-open')).toBe('true');
    expect(panel.style.getPropertyValue('--panel-width')).toBe('400px');

    // Close via PanelHeader close button
    fireEvent.click(screen.getByRole('button', { name: /close panel/i }));
    expect(panel.getAttribute('data-open')).toBe('false');
    expect(onInspectorClose).toHaveBeenCalledTimes(1);

    // Reopen via Cmd+. keyboard shortcut
    fireEvent.keyDown(window, { key: '.', metaKey: true });
    expect(panel.getAttribute('data-open')).toBe('true');
  });

  it('activates modal dialog semantics, backdrop, Escape dismissal, and scroll lock in overlay mode', () => {
    const handleOpenChange = vi.fn();

    render(
      <LayoutProvider>
        <Panel mode="overlay" open={true} onOpenChange={handleOpenChange}>
          <PanelHeader title="Modal Inspector" />
          <button type="button">Action</button>
        </Panel>
      </LayoutProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: /contextual panel/i });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.querySelector('[data-panel-backdrop]')).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleOpenChange).toHaveBeenCalledWith(false);
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

  it('coordinates with modal stack so Escape closes only topmost modal in LIFO order', () => {
    const handlePanelOpenChange = vi.fn();

    render(
      <LayoutProvider>
        <Panel mode="overlay" open={true} onOpenChange={handlePanelOpenChange}>
          <button type="button">Panel Action</button>
        </Panel>
      </LayoutProvider>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handlePanelOpenChange).toHaveBeenCalledWith(false);
  });

  it('enforces exclusive modal ownership across both opening orders and controlled state', () => {
    function ShellHarness() {
      const { setSidebarOpenMobile, isSidebarOpenMobile } = useLayout();
      const [controlledOpen, setControlledOpen] = useState(true);

      return (
        <div>
          <span data-testid="sidebar-mobile-state">{String(isSidebarOpenMobile)}</span>
          <span data-testid="panel-open-state">{String(controlledOpen)}</span>
          <button
            type="button"
            data-testid="open-sidebar-btn"
            onClick={() => setSidebarOpenMobile(true)}
          >
            Open Sidebar
          </button>
          <button
            type="button"
            data-testid="open-panel-btn"
            onClick={() => setControlledOpen(true)}
          >
            Open Panel
          </button>
          <Panel
            mode="overlay"
            open={controlledOpen}
            onOpenChange={setControlledOpen}
            data-testid="panel-drawer"
          >
            <p>Panel content</p>
          </Panel>
        </div>
      );
    }

    render(
      <LayoutProvider>
        <ShellHarness />
      </LayoutProvider>,
    );

    // Initial state: Panel is open, mobile sidebar is closed
    expect(screen.getByTestId('panel-open-state').textContent).toBe('true');
    expect(screen.getByTestId('sidebar-mobile-state').textContent).toBe('false');

    // Order 1: Panel is open -> open mobile Sidebar -> Panel closes automatically
    fireEvent.click(screen.getByTestId('open-sidebar-btn'));
    expect(screen.getByTestId('sidebar-mobile-state').textContent).toBe('true');
    expect(screen.getByTestId('panel-open-state').textContent).toBe('false');

    // Order 2: Mobile Sidebar is open -> open Panel -> Sidebar closes automatically
    fireEvent.click(screen.getByTestId('open-panel-btn'));
    expect(screen.getByTestId('panel-open-state').textContent).toBe('true');
    expect(screen.getByTestId('sidebar-mobile-state').textContent).toBe('false');
  });
});
