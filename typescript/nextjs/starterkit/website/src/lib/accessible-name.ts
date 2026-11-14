/**
 * Compile-time contract for primitives whose accessible name must come from the
 * connected caller (never from a hardcoded English fallback).
 *
 * Provide a localized `aria-label`, or point `aria-labelledby` at visible text.
 */
export type AccessibleNameProps =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-labelledby': string; 'aria-label'?: string };
