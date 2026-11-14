import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

describe('ToggleGroup Primitive', () => {
  it('renders role="group" with items', () => {
    render(
      <ToggleGroup defaultValue="left" data-testid="group">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeTruthy();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('handles single selection mode correctly', () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup type="single" onValueChange={handleChange}>
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
      </ToggleGroup>,
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(handleChange).toHaveBeenCalledWith('list');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('handles multiple selection mode correctly', () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup type="multiple" defaultValue={['bold']} onValueChange={handleChange}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(handleChange).toHaveBeenCalledWith(['bold', 'italic']);
  });

  it('forwards ref to container HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ToggleGroup ref={ref}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
