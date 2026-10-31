let activeLockCount = 0;
let savedBodyOverflow = '';

/**
 * Acquires a reference-counted scroll lock on `document.body`.
 * Safe for concurrent or nested modal drawers/dialogs: body overflow is only
 * restored when the last active lock is released.
 */
export function acquireBodyScrollLock(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  if (activeLockCount === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  activeLockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLockCount = Math.max(0, activeLockCount - 1);
    if (activeLockCount === 0 && typeof document !== 'undefined') {
      document.body.style.overflow = savedBodyOverflow;
    }
  };
}
