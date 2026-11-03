import {
  type ComponentPropsWithRef,
  forwardRef,
  type ReactNode,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './dialog.module.css';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type DialogCloseReason =
  | 'escape'
  | 'backdrop'
  | 'close-button'
  | 'cancel-button'
  | 'native-close';

export interface DialogOpenChangeDetails {
  reason: DialogCloseReason;
}

export interface DialogProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
  /**
   * Controlled open state. Single source of truth.
   */
  open: boolean;

  /**
   * Callback fired when open state changes (via Escape, backdrop, close button, or native close).
   */
  onOpenChange: (open: boolean, details: DialogOpenChangeDetails) => void;

  /**
   * Maximum inline size of the dialog panel.
   * @default 'md'
   */
  size?: DialogSize;

  /**
   * Whether clicking the backdrop scrim requests closing the dialog.
   * Defaults to false to prevent accidental form data loss.
   * @default false
   */
  closeOnBackdropClick?: boolean;

  /**
   * Prevents dismissal when the Escape key is pressed.
   * Useful when an asynchronous operation (e.g. saving) is in flight.
   * @default false
   */
  preventEscapeClose?: boolean;

  /**
   * Optional ref to the element that should receive focus when the dialog opens.
   * If omitted, browser native focus or first interactive control receives focus.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Optional ref to the element that should receive focus when the dialog closes.
   * If omitted, focus automatically returns to the element that was active before opening.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Whether to display an optional top-corner icon close button.
   * @default false
   */
  showCloseButton?: boolean;

  /**
   * Accessible label for the optional top-corner close button.
   * Required when showCloseButton is true.
   */
  closeLabel?: string;

  /**
   * Dialog children (typically DialogHeader, DialogBody, DialogFooter).
   */
  children?: ReactNode;
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  {
    open,
    onOpenChange,
    size = 'md',
    closeOnBackdropClick = false,
    preventEscapeClose = false,
    initialFocusRef,
    returnFocusRef,
    showCloseButton = false,
    closeLabel,
    className,
    children,
    onClick,
    onKeyDown,
    onCancel,
    onClose,
    ...props
  },
  forwardedRef,
) {
  const internalRef = useRef<HTMLDialogElement>(null);
  useImperativeHandle(forwardedRef, () => internalRef.current as HTMLDialogElement);

  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const openRef = useRef(open);

  useLayoutEffect(() => {
    openRef.current = open;
  });

  // Synchronize native <dialog> with React controlled `open` prop
  useLayoutEffect(() => {
    const dialog = internalRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        // Capture active element BEFORE calling showModal() so focus restoration
        // does not target an element inside the dialog.
        if (!returnFocusRef) {
          previousActiveElementRef.current = document.activeElement as HTMLElement | null;
        }

        dialog.showModal();

        // Move initial focus if explicit initialFocusRef was supplied
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        }
      }
    } else {
      if (dialog.open) {
        dialog.close();

        // Restore focus to returnFocusRef or the previously active element
        const target = returnFocusRef?.current ?? previousActiveElementRef.current;
        if (
          target &&
          document.body.contains(target) &&
          !('disabled' in target && (target as HTMLButtonElement).disabled)
        ) {
          target.focus();
        }
      }
    }
  }, [open, initialFocusRef, returnFocusRef]);

  // Clean unmount safety
  useEffect(() => {
    return () => {
      const dialog = internalRef.current;
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    // Always prevent default native cancel to ensure React controlled `open` prop
    // remains the single source of truth and prevents state desynchronization.
    e.preventDefault();

    onCancel?.(e);

    if (preventEscapeClose) {
      return;
    }

    onOpenChange(false, { reason: 'escape' });
  };

  const handleClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    onClose?.(e);

    // If a native close occurred (e.g. via dialogRef.current.close() or <form method="dialog">)
    // while open is still true in React controlled state:
    if (open) {
      onOpenChange(false, { reason: 'native-close' });

      // Controlled state reconciliation guarantee:
      // If the caller rejects/ignores the close request and maintains open={true},
      // restore the native modal so DOM state remains strictly identical to the prop.
      queueMicrotask(() => {
        const dialog = internalRef.current;
        if (dialog && openRef.current && !dialog.open) {
          dialog.showModal();
        }
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    if (!closeOnBackdropClick) return;

    const dialog = internalRef.current;
    if (!dialog || e.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInside) {
      onOpenChange(false, { reason: 'backdrop' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    // WAI-ARIA modal Tab loop guarantee across all browser engines
    if (e.key === 'Tab') {
      const dialog = internalRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]',
        ),
      ).filter((el) => {
        if (el.getAttribute('tabindex') === '-1') return false;
        if ('disabled' in el && (el as HTMLButtonElement).disabled) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;

        // Check layout visibility in real browsers, with computed style fallback in jsdom
        const isVisible =
          el.offsetParent !== null ||
          el.offsetWidth > 0 ||
          el.offsetHeight > 0 ||
          (typeof window !== 'undefined' &&
            window.getComputedStyle(el).display !== 'none' &&
            window.getComputedStyle(el).visibility !== 'hidden');

        return isVisible;
      });

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === dialog) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  return (
    <dialog
      {...props}
      ref={internalRef}
      data-size={size}
      className={cn(styles.dialog, className)}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {showCloseButton && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => onOpenChange(false, { reason: 'close-button' })}
          aria-label={closeLabel}
          data-testid="dialog-close-button"
        >
          <Icon name="close" />
        </button>
      )}
      {children}
    </dialog>
  );
});

Dialog.displayName = 'Dialog';

export interface DialogHeaderProps extends ComponentPropsWithRef<'div'> {}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(function DialogHeader(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.header, className)} {...props}>
      {children}
    </div>
  );
});

DialogHeader.displayName = 'DialogHeader';

export interface DialogTitleProps extends ComponentPropsWithRef<'h2'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { as: Component = 'h2', className, children, ...props },
  ref,
) {
  return (
    <Component ref={ref} className={cn(styles.title, className)} {...props}>
      {children}
    </Component>
  );
});

DialogTitle.displayName = 'DialogTitle';

export interface DialogDescriptionProps extends ComponentPropsWithRef<'p'> {}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, children, ...props }, ref) {
    return (
      <p ref={ref} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

DialogDescription.displayName = 'DialogDescription';

export interface DialogBodyProps extends ComponentPropsWithRef<'div'> {}

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(function DialogBody(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.body, className)} {...props}>
      {children}
    </div>
  );
});

DialogBody.displayName = 'DialogBody';

export interface DialogFooterProps extends ComponentPropsWithRef<'div'> {}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(styles.footer, className)} {...props}>
      {children}
    </div>
  );
});

DialogFooter.displayName = 'DialogFooter';
