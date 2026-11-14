import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable-panel';

describe('ResizablePanel Primitive', () => {
  it('renders panels and separator handle with WAI-ARIA slider/separator semantics', () => {
    render(
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel order={0} defaultSize={30}>
          Left Panel
        </ResizablePanel>
        <ResizableHandle handleIndex={0} withHandle data-testid="handle" />
        <ResizablePanel order={1} defaultSize={70}>
          Right Panel
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    const handle = screen.getByRole('separator');
    expect(handle).toBeTruthy();
    expect(handle.getAttribute('aria-orientation')).toBe('horizontal');
    expect(handle.getAttribute('aria-valuenow')).toBe('30');
    expect(handle.getAttribute('tabindex')).toBe('0');

    expect(screen.getByText('Left Panel')).toBeTruthy();
    expect(screen.getByText('Right Panel')).toBeTruthy();
  });

  it('adjusts panel sizes on keyboard arrow navigation', () => {
    const handleLayout = vi.fn();

    render(
      <ResizablePanelGroup orientation="horizontal" onLayout={handleLayout}>
        <ResizablePanel order={0} defaultSize={40}>
          Panel A
        </ResizablePanel>
        <ResizableHandle handleIndex={0} data-testid="handle" />
        <ResizablePanel order={1} defaultSize={60}>
          Panel B
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    const handle = screen.getByRole('separator');

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handleLayout).toHaveBeenCalledWith([42, 58]);

    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handleLayout).toHaveBeenCalledWith([40, 60]);
  });

  it('adjusts panel sizes on vertical arrow keys', () => {
    const handleLayout = vi.fn();

    render(
      <ResizablePanelGroup orientation="vertical" onLayout={handleLayout}>
        <ResizablePanel order={0} defaultSize={40}>
          Top
        </ResizablePanel>
        <ResizableHandle handleIndex={0} />
        <ResizablePanel order={1} defaultSize={60}>
          Bottom
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    const handle = screen.getByRole('separator');

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(handleLayout).toHaveBeenCalledWith([42, 58]);

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(handleLayout).toHaveBeenCalledWith([40, 60]);
  });

  it('inverts horizontal arrow stepping when inside an RTL container', () => {
    const handleLayout = vi.fn();

    render(
      <div dir="rtl">
        <ResizablePanelGroup orientation="horizontal" onLayout={handleLayout}>
          <ResizablePanel order={0} defaultSize={50}>
            Right Panel in RTL
          </ResizablePanel>
          <ResizableHandle handleIndex={0} />
          <ResizablePanel order={1} defaultSize={50}>
            Left Panel in RTL
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>,
    );

    const handle = screen.getByRole('separator');

    // In RTL, pressing ArrowLeft should increase panel 0 (expand towards physical left)
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handleLayout).toHaveBeenCalledWith([52, 48]);

    // Pressing ArrowRight should decrease panel 0 (shrink towards physical right)
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handleLayout).toHaveBeenCalledWith([50, 50]);
  });

  it('jumps to min/max sizes on Home and End keys', () => {
    const handleLayout = vi.fn();

    render(
      <ResizablePanelGroup orientation="horizontal" onLayout={handleLayout}>
        <ResizablePanel order={0} defaultSize={50} minSize={15} maxSize={85}>
          Panel A
        </ResizablePanel>
        <ResizableHandle handleIndex={0} />
        <ResizablePanel order={1} defaultSize={50}>
          Panel B
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    const handle = screen.getByRole('separator');

    fireEvent.keyDown(handle, { key: 'Home' });
    expect(handleLayout).toHaveBeenCalledWith([15, 85]);

    fireEvent.keyDown(handle, { key: 'End' });
    expect(handleLayout).toHaveBeenCalledWith([85, 15]);
  });

  it('supports vertical orientation', () => {
    render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel order={0} defaultSize={40}>
          Top Panel
        </ResizablePanel>
        <ResizableHandle handleIndex={0} />
        <ResizablePanel order={1} defaultSize={60}>
          Bottom Panel
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    const handle = screen.getByRole('separator');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('supports three-panel layout with two handles', () => {
    render(
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel order={0} defaultSize={20}>
          Sidebar
        </ResizablePanel>
        <ResizableHandle handleIndex={0} />
        <ResizablePanel order={1} defaultSize={60}>
          Content
        </ResizablePanel>
        <ResizableHandle handleIndex={1} />
        <ResizablePanel order={2} defaultSize={20}>
          Inspector
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    const handles = screen.getAllByRole('separator');
    expect(handles).toHaveLength(2);
    expect(screen.getByText('Sidebar')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
    expect(screen.getByText('Inspector')).toBeTruthy();
  });
});
