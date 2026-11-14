'use client';

import {
  type ComponentPropsWithRef,
  createContext,
  forwardRef,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { trapTabKey } from '@/lib/focus-trap';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
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

export interface DialogBaseProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
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
   * Dialog children (typically DialogHeader, DialogBody, DialogFooter).
   */
  children?: ReactNode;
}

export type DialogCloseButtonProps =
  | {
      /**
       * Whether to display an optional top-corner icon close button.
       * When true, `closeLabel` is strictly required to guarantee an accessible name.
       */
      showCloseButton: true;
      /**
       * Caller-supplied accessible label for the optional top-corner close button.
       * Required when showCloseButton is true.
       */
      closeLabel: string;
    }
  | {
      showCloseButton?: false;
      closeLabel?: string;
    };

export type DialogProps = DialogBaseProps & DialogCloseButtonProps;

/* =============================================================================
   Context (title / description auto-wiring for the accessible name)
   ============================================================================= */

interface DialogContextValue {
  defaultTitleId: string;
  defaultDescriptionId: string;
  registerTitle: (id: string) => () => void;
  registerDescription: (id: string) => () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function removeFirst(list: string[], id: string): string[] {
  const index = list.indexOf(id);
  if (index === -1) return list;
  return [...list.slice(0, index), ...list.slice(index + 1)];
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
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledByProp,
    'aria-describedby': ariaDescribedByProp,
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

  const baseId = useId();
  const defaultTitleId = `dialog-title-${baseId}`;
  const defaultDescriptionId = `dialog-desc-${baseId}`;

  const [registeredTitles, setRegisteredTitles] = useState<string[]>([]);
  const [registeredDescriptions, setRegisteredDescriptions] = useState<string[]>([]);

  const registerTitle = useCallback((id: string) => {
    setRegisteredTitles((prev) => [...prev, id]);
    return () => setRegisteredTitles((prev) => removeFirst(prev, id));
  }, []);

  const registerDescription = useCallback((id: string) => {
    setRegisteredDescriptions((prev) => [...prev, id]);
    return () => setRegisteredDescriptions((prev) => removeFirst(prev, id));
  }, []);

  const contextValue = useMemo<DialogContextValue>(
    () => ({ defaultTitleId, defaultDescriptionId, registerTitle, registerDescription }),
    [defaultTitleId, defaultDescriptionId, registerTitle, registerDescription],
  );

  // An explicit aria-label wins over the auto-wired title; an explicit aria-labelledby wins over both.
  const computedLabelledBy = ariaLabelledByProp ?? (ariaLabel ? undefined : registeredTitles[0]);
  const computedDescribedBy = ariaDescribedByProp ?? registeredDescriptions[0];

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

  // Lock background body scroll while dialog is open
  useEffect(() => {
    if (!open) return;
    const releaseScrollLock = acquireBodyScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [open]);

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
      if (dialog) trapTabKey(e, dialog);
    }
  };

  const hasAccessibleCloseButton =
    showCloseButton && Boolean(closeLabel && closeLabel.trim().length > 0);

  return (
    <dialog
      {...props}
      ref={internalRef}
      aria-label={ariaLabel}
      aria-labelledby={computedLabelledBy}
      aria-describedby={computedDescribedBy}
      data-size={size}
      className={cn(styles.dialog, className)}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {hasAccessibleCloseButton && (
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
      <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>
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
  { as: Component = 'h2', id: explicitId, className, children, ...props },
  ref,
) {
  const context = useContext(DialogContext);
  const fallbackId = useId();
  const id = explicitId ?? context?.defaultTitleId ?? `dialog-title-${fallbackId}`;
  const registerTitle = context?.registerTitle;

  useLayoutEffect(() => registerTitle?.(id), [registerTitle, id]);

  return (
    <Component ref={ref} id={id} className={cn(styles.title, className)} {...props}>
      {children}
    </Component>
  );
});

DialogTitle.displayName = 'DialogTitle';

export interface DialogDescriptionProps extends ComponentPropsWithRef<'p'> {}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ id: explicitId, className, children, ...props }, ref) {
    const context = useContext(DialogContext);
    const fallbackId = useId();
    const id = explicitId ?? context?.defaultDescriptionId ?? `dialog-desc-${fallbackId}`;
    const registerDescription = context?.registerDescription;

    useLayoutEffect(() => registerDescription?.(id), [registerDescription, id]);

    return (
      <p ref={ref} id={id} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

DialogDescription.displayName = 'DialogDescription';

export interface DialogBodyProps extends ComponentPropsWithRef<'div'> {
  /**
   * Whether the body content acts as an internal scroll container when content exceeds height.
   * Set to false for short forms with dropdowns or popovers to prevent scroll-clipping.
   * @default true
   */
  scrollable?: boolean;
}

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(function DialogBody(
  { scrollable = true, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.body, !scrollable && styles.bodyUncontained, className)}
      {...props}
    >
      {children}
    </div>
  );
});

DialogBody.displayName = 'DialogBody';

export type DialogFooterBackground = 'seamless' | 'docked';

export interface DialogFooterProps extends ComponentPropsWithRef<'div'> {
  /**
   * Footer background treatment.
   * 'seamless': inherits dialog surface (default).
   * 'docked': distinct surface step for pinned trays in long forms.
   * @default 'seamless'
   */
  background?: DialogFooterBackground;
}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter(
  { background = 'seamless', className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        styles.footer,
        background === 'docked' ? styles.footerDocked : styles.footerSeamless,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DialogFooter.displayName = 'DialogFooter';
