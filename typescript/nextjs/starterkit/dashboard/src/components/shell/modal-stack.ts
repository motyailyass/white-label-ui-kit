/**
 * Modal Stack Manager
 *
 * Ensures single active modal owner and LIFO (last-in, first-out) dismissal.
 * Prevents multiple concurrent overlay dialogs or drawers from simultaneously
 * processing Escape or conflicting over focus management.
 */

type ModalDismiss = () => void;

interface ActiveModal {
  id: string;
  dismiss: ModalDismiss;
}

const stack: ActiveModal[] = [];

export function pushModal(id: string, dismiss: ModalDismiss): () => void {
  const existingIndex = stack.findIndex((item) => item.id === id);
  if (existingIndex !== -1) {
    stack.splice(existingIndex, 1);
  }
  stack.push({ id, dismiss });

  return () => {
    const idx = stack.findIndex((item) => item.id === id);
    if (idx !== -1) {
      stack.splice(idx, 1);
    }
  };
}

export function isTopmostModal(id: string): boolean {
  if (stack.length === 0) return false;
  return stack[stack.length - 1].id === id;
}

export function dismissTopmostModal(): boolean {
  const topmost = stack.pop();
  if (topmost) {
    topmost.dismiss();
    return true;
  }
  return false;
}
