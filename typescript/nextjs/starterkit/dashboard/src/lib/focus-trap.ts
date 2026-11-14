/**
 * Shared keyboard-focus helpers for modal containers (dialog, alert dialog, command palette).
 * One Tab-loop implementation keeps every modal boundary identical.
 */

/**
 * Checks whether an interactive candidate is disabled natively, via aria-disabled,
 * inside an inert subtree, or through a disabled <fieldset> ancestor.
 */
export function isElementDisabled(el: HTMLElement): boolean {
  if ('disabled' in el && (el as HTMLButtonElement).disabled) return true;
  if (typeof el.matches === 'function' && el.matches(':disabled')) return true;
  if (el.getAttribute('aria-disabled') === 'true') return true;
  if (el.closest('[inert]')) return true;

  const fieldset = el.closest('fieldset[disabled]');
  if (fieldset) {
    const firstLegend = fieldset.querySelector(':scope > legend');
    if (!firstLegend || !firstLegend.contains(el)) {
      return true;
    }
  }

  return false;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, details > summary, [tabindex], [contenteditable]:not([contenteditable="false"])',
    ),
  ).filter((el) => {
    if (el.getAttribute('tabindex') === '-1') return false;
    if (isElementDisabled(el)) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;

    const computedStyle = typeof window !== 'undefined' ? window.getComputedStyle(el) : null;
    if (
      computedStyle &&
      (computedStyle.display === 'none' || computedStyle.visibility === 'hidden')
    ) {
      return false;
    }

    return (
      el.offsetParent !== null ||
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      computedStyle !== null
    );
  });
}

/**
 * Keeps Tab / Shift+Tab cycling inside a modal container. No-op for other keys.
 */
export function trapTabKey(
  event: { key: string; shiftKey: boolean; preventDefault: () => void },
  container: HTMLElement,
): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first || document.activeElement === container) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
