import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from './search-input';

describe('SearchInput primitive', () => {
  it('renders input with search role and custom placeholder', () => {
    render(<SearchInput placeholder="Filter records..." />);
    const input = screen.getByPlaceholderText('Filter records...');
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('type')).toBe('search');
  });

  it('triggers onSearch and onChange when text is entered', () => {
    const handleSearch = vi.fn();
    const handleChange = vi.fn();
    render(<SearchInput onSearch={handleSearch} onChange={handleChange} placeholder="Search" />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'Leads' } });

    expect(handleSearch).toHaveBeenCalledWith('Leads');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders shortcut badge and focuses input on keydown', () => {
    render(<SearchInput shortcut="/" placeholder="Search" />);
    const input = screen.getByPlaceholderText('Search');
    expect(screen.getByText('/')).toBeTruthy();
    // The badge is a decorative hint; it must not inject English into a localized page.
    expect(screen.getByText('/').closest('kbd')?.getAttribute('aria-hidden')).toBe('true');

    // Trigger keydown
    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(input);
  });

  it('supports explicit size tokens', () => {
    const { container } = render(<SearchInput size="lg" placeholder="Search" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('data-size')).toBe('lg');
  });

  it('supports custom suffix slot', () => {
    render(<SearchInput suffix={<span data-testid="custom-suffix">Clear</span>} />);
    expect(screen.getByTestId('custom-suffix')).toBeTruthy();
  });

  it('supports flush variant and text input type override', () => {
    const { container } = render(
      <SearchInput variant="flush" type="text" placeholder="Type command..." />,
    );
    const wrapper = container.firstChild as HTMLElement;
    const input = screen.getByPlaceholderText('Type command...');
    expect(wrapper.getAttribute('data-variant')).toBe('flush');
    expect(input.getAttribute('type')).toBe('text');
  });
});
