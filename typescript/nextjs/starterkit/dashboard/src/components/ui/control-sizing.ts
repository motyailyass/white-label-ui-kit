import type React from 'react';

/**
 * Standard Control Sizing Scale
 * Shared vocabulary across Dashboard and Website starters.
 *
 * All pixel equivalents assume a 16px root font size (1rem = 16px):
 * - xs:  28px min-height (1.75rem), 8px inline padding,  14px font, 14px icon, 4px gap
 * - sm:  32px min-height (2.00rem), 12px inline padding, 14px font, 16px icon, 6px gap
 * - md:  36px min-height (2.25rem), 14px inline padding, 14px font, 16px icon, 8px gap (Dashboard default)
 * - lg:  40px min-height (2.50rem), 16px inline padding, 14px font, 18px icon, 8px gap
 * - xl:  48px min-height (3.00rem), 20px inline padding, 16px font, 20px icon, 8px gap (Website default)
 * - 2xl: 56px min-height (3.50rem), 24px inline padding, 16px font, 24px icon, 12px gap
 */
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ControlSizingProps {
  /**
   * Explicit control size from the six-step scale.
   * If omitted, the control consumes the local product default alias:
   * - Dashboard: md (36px minimum height)
   * - Website: xl (48px minimum height)
   */
  size?: ControlSize;

  /**
   * Preferred touch-oriented interaction target policy.
   * - 'auto': scales to 48px min target when a coarse pointer is detected (`@media (any-pointer: coarse)`).
   * - 'comfortable': explicitly enforces minimum 48px interaction target regardless of pointer device.
   */
  touchTarget?: 'auto' | 'comfortable';
}

/**
 * Helper type to safely omit conflicting native HTML attributes like `size` (number in <input>)
 * while attaching the kit's ControlSizingProps.
 */
export type NativeControlProps<T extends React.ElementType> = Omit<
  React.ComponentPropsWithoutRef<T>,
  'size'
> &
  ControlSizingProps;
