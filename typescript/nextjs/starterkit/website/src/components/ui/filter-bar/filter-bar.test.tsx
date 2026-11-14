import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Icon } from '@/components/icons';
import {
  FilterBar,
  FilterBarClear,
  FilterBarGroup,
  FilterBarItem,
  FilterBarMain,
  FilterBarSummary,
  FilterBarTag,
  FilterBarTags,
} from './filter-bar';

describe('FilterBar Primitive', () => {
  it('renders toolbar with role="toolbar", accessible label, aria-pressed, and icon slot', () => {
    render(
      <FilterBar aria-label="Invoice filters">
        <FilterBarMain>
          <FilterBarGroup>
            <FilterBarItem active count={2} icon={<Icon name="sliders" size={14} />}>
              Status
            </FilterBarItem>
            <FilterBarItem active={false}>Region</FilterBarItem>
          </FilterBarGroup>
          <FilterBarSummary>Showing 12 records</FilterBarSummary>
        </FilterBarMain>
      </FilterBar>,
    );

    const toolbar = screen.getByRole('toolbar', { name: /invoice filters/i });
    expect(toolbar).toBeTruthy();

    const activeBtn = screen.getByRole('button', { name: /status 2/i });
    expect(activeBtn.getAttribute('data-active')).toBe('true');
    expect(activeBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('2')).toBeTruthy();

    const inactiveBtn = screen.getByRole('button', { name: /region/i });
    expect(inactiveBtn.getAttribute('aria-pressed')).toBe('false');
    expect(inactiveBtn.getAttribute('data-active')).toBeNull();

    const summary = screen.getByRole('status');
    expect(summary.getAttribute('aria-live')).toBe('polite');
    expect(summary.textContent).toContain('Showing 12 records');
  });

  it('renders structured category/value tags, removes tags, and clears all filters', () => {
    const handleRemove = vi.fn();
    const handleClear = vi.fn();

    render(
      <FilterBar>
        <FilterBarTags>
          <FilterBarTag
            category="Status"
            label="Paid"
            onRemove={handleRemove}
            removeAriaLabel="Retirer le filtre Statut : Payé"
          />
          <FilterBarClear onClear={handleClear}>Reset all</FilterBarClear>
        </FilterBarTags>
      </FilterBar>,
    );

    expect(screen.getByText('Status:')).toBeTruthy();
    expect(screen.getByText('Paid')).toBeTruthy();

    const removeBtn = screen.getByRole('button', { name: /retirer le filtre statut : payé/i });
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);

    const clearBtn = screen.getByRole('button', { name: /reset all/i });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state on FilterBarItem, FilterBarTag, and FilterBarClear', () => {
    const handleRemove = vi.fn();
    const handleClear = vi.fn();

    render(
      <FilterBar>
        <FilterBarMain>
          <FilterBarGroup>
            <FilterBarItem disabled>Status</FilterBarItem>
          </FilterBarGroup>
        </FilterBarMain>
        <FilterBarTags>
          <FilterBarTag
            category="Status"
            label="Paid"
            disabled
            onRemove={handleRemove}
            removeAriaLabel="Remove filter Status: Paid"
          />
          <FilterBarClear disabled onClear={handleClear}>
            Reset all
          </FilterBarClear>
        </FilterBarTags>
      </FilterBar>,
    );

    const filterBtn = screen.getByRole('button', { name: 'Status' }) as HTMLButtonElement;
    expect(filterBtn.disabled).toBe(true);

    const removeBtn = screen.getByRole('button', {
      name: /remove filter status: paid/i,
    }) as HTMLButtonElement;
    expect(removeBtn.disabled).toBe(true);
    fireEvent.click(removeBtn);
    expect(handleRemove).not.toHaveBeenCalled();

    const clearBtn = screen.getByRole('button', { name: 'Reset all' }) as HTMLButtonElement;
    expect(clearBtn.disabled).toBe(true);
    fireEvent.click(clearBtn);
    expect(handleClear).not.toHaveBeenCalled();
  });
});
