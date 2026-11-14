'use client';

import {
  type ComponentPropsWithRef,
  createContext,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { acquireBodyScrollLock } from '@/lib/scroll-lock';
import styles from './sheet.module.css';

export type SheetSide = 'inline-start' | 'inline-end' | 'top' | 'bottom';
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type SheetCloseReason = 'escape' | 'backdrop' | 'close-button' | 'programmatic';

export interface SheetOpenChangeDetails {
  reason: SheetCloseReason;
}

interface SheetContextValue {
  titleId: string;
  descriptionId: string;
  onClose: (reason: SheetCloseReason) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext(componentName: string): SheetContextValue {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within a <Sheet> container.`);
  }
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

function isElementDisabled(el: HTMLElement): boolean {
  if ('disabled' in el && (el as HTMLButtonElement).disabled) return true;
  if (typeof el.matches === 'function' && el.matches(':disabled')) return true;

  const fieldset = el.closest('fieldset[disabled]');
  if (fieldset) {
    const firstLegend = fieldset.querySelector(':scope > legend');
    if (!firstLegend || !firstLegend.contains(el)) {
      return true;
    }
  }
  return false;
}

export interface SheetBaseProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
  /** Controlled open state */
  open: boolean;

  /** Callback fired when the open state changes */
  onOpenChange: (open: boolean, details: SheetOpenChangeDetails) => void;

  /** Edge from which the drawer slides into the viewport. Defaults to 'inline-end' */
  side?: SheetSide;

  /** Density sizing scale. Defaults to 'md' */
  size?: SheetSize;

  /** Whether clicking the backdrop scrim closes the sheet. Defaults to true */
  closeOnBackdropClick?: boolean;

  /** Prevents Escape key dismissal. Useful during pending async operations */
  preventEscapeClose?: boolean;

  /** Optional ref to receive initial focus upon opening */
  initialFocusRef?: RefObject<HTMLElement | null>;

  /** Optional ref to receive restored focus upon closing */
  returnFocusRef?: RefObject<HTMLElement | null>;

  /** Children nodes (SheetHeader, SheetBody, SheetFooter) */
  children?: ReactNode;
}

export type SheetCloseButtonProps =
  | {
      showCloseButton: true;
      closeLabel: string;
    }
  | {
      showCloseButton?: false;
      closeLabel?: string;
    };

export type SheetProps = SheetBaseProps & SheetCloseButtonProps;

export function Sheet({
  open,
  onOpenChange,
  side = 'inline-end',
  size = 'md',
  closeOnBackdropClick = true,
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
  onPointerDown,
  ref,
  ...props
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const pointerDownOutsidePanelRef = useRef(false);

  const initialFocusRefRef = useRef(initialFocusRef);
  const returnFocusRefRef = useRef(returnFocusRef);
  const onOpenChangeRef = useRef(onOpenChange);
  const openRef = useRef(open);

  useLayoutEffect(() => {
    initialFocusRefRef.current = initialFocusRef;
    returnFocusRefRef.current = returnFocusRef;
    onOpenChangeRef.current = onOpenChange;
    openRef.current = open;
  });

  const titleId = useId();
  const descriptionId = useId();

  const mergedDialogRef = useCallback(
    (node: HTMLDialogElement | null) => {
      dialogRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  // Manage open/close via native showModal() / close(), ref-counted body scroll lock,
  // initial focus delegation, and deterministic focus restoration on close/unmount.
  useLayoutEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!returnFocusRefRef.current?.current) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    }

    const releaseScrollLock = acquireBodyScrollLock();

    if (!dialog.open) {
      dialog.showModal();
    }

    const initialTarget = initialFocusRefRef.current?.current;
    if (initialTarget && dialog.contains(initialTarget)) {
      initialTarget.focus();
    } else {
      panelRef.current?.focus();
    }

    return () => {
      releaseScrollLock();
      if (dialog.open) {
        dialog.close();
      }
      const returnTarget = returnFocusRefRef.current?.current ?? previousActiveElementRef.current;
      if (
        returnTarget &&
        document.body.contains(returnTarget) &&
        !isElementDisabled(returnTarget) &&
        typeof returnTarget.focus === 'function'
      ) {
        returnTarget.focus();
      }
    };
  }, [open]);

  const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onCancel?.(e);
    if (e.defaultPrevented && !preventEscapeClose) {
      // e.preventDefault() is always called above to keep React `open` single-source-of-truth
    }
    if (!preventEscapeClose) {
      onOpenChangeRef.current(false, { reason: 'escape' });
    }
  };

  const handleNativeClose = (e: SyntheticEvent<HTMLDialogElement>) => {
    onClose?.(e);
    if (openRef.current) {
      onOpenChangeRef.current(false, { reason: 'programmatic' });
      queueMicrotask(() => {
        const dialog = dialogRef.current;
        if (dialog && openRef.current && !dialog.open) {
          dialog.showModal();
        }
      });
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDialogElement>) => {
    onPointerDown?.(e);
    pointerDownOutsidePanelRef.current = Boolean(
      panelRef.current && !panelRef.current.contains(e.target as Node),
    );
  };

  const handleDialogClick = (e: ReactMouseEvent<HTMLDialogElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !closeOnBackdropClick) {
      pointerDownOutsidePanelRef.current = false;
      return;
    }

    const startedOutside = pointerDownOutsidePanelRef.current;
    pointerDownOutsidePanelRef.current = false;

    const clickedOutside = Boolean(
      panelRef.current && !panelRef.current.contains(e.target as Node),
    );

    if (clickedOutside && (startedOutside || e.detail === 0)) {
      onOpenChangeRef.current(false, { reason: 'backdrop' });
    }
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    if (e.key === 'Tab') {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]',
        ),
      ).filter((el) => {
        if (el === panelRef.current) return false;
        if (el.getAttribute('tabindex') === '-1') return false;
        if (isElementDisabled(el)) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;

        return (
          el.offsetParent !== null ||
          el.offsetWidth > 0 ||
          el.offsetHeight > 0 ||
          (typeof window !== 'undefined' &&
            window.getComputedStyle(el).display !== 'none' &&
            window.getComputedStyle(el).visibility !== 'hidden')
        );
      });

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (
          document.activeElement === first ||
          document.activeElement === dialog ||
          document.activeElement === panelRef.current
        ) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const handleContextClose = useCallback((reason: SheetCloseReason) => {
    onOpenChangeRef.current(false, { reason });
  }, []);

  if (!open) {
    return null;
  }

  const sideClass =
    side === 'inline-start'
      ? styles.side_inline_start
      : side === 'top'
        ? styles.side_top
        : side === 'bottom'
          ? styles.side_bottom
          : styles.side_inline_end;

  const sizeClass = styles[`size_${size}`];
  const hasAccessibleCloseButton =
    showCloseButton && Boolean(closeLabel && closeLabel.trim().length > 0);

  return (
    <SheetContext.Provider
      value={{
        titleId,
        descriptionId,
        onClose: handleContextClose,
      }}
    >
      <dialog
        {...props}
        ref={mergedDialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(styles.dialog, className)}
        onCancel={handleCancel}
        onClose={handleNativeClose}
        onPointerDown={handlePointerDown}
        onClick={handleDialogClick}
        onKeyDown={handleKeyDown}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          role="document"
          data-side={side}
          data-size={size}
          className={cn(styles.panel, sideClass, sizeClass)}
        >
          {hasAccessibleCloseButton && closeLabel && <SheetCloseButton aria-label={closeLabel} />}
          {children}
        </div>
      </dialog>
    </SheetContext.Provider>
  );
}

/* =============================================================================
   SheetHeader
   ============================================================================= */

export interface SheetHeaderProps extends ComponentPropsWithRef<'header'> {
  children?: ReactNode;
  className?: string;
}

export function SheetHeader({ className, children, ref, ...props }: SheetHeaderProps) {
  return (
    <header ref={ref} className={cn(styles.header, className)} {...props}>
      <div className={styles.headerText}>{children}</div>
    </header>
  );
}

/* =============================================================================
   SheetTitle
   ============================================================================= */

export interface SheetTitleProps extends ComponentPropsWithRef<'h2'> {
  children?: ReactNode;
  className?: string;
}

export function SheetTitle({ className, children, ref, ...props }: SheetTitleProps) {
  const { titleId } = useSheetContext('SheetTitle');
  return (
    <h2 id={titleId} ref={ref} className={cn(styles.title, className)} {...props}>
      {children}
    </h2>
  );
}

/* =============================================================================
   SheetDescription
   ============================================================================= */

export interface SheetDescriptionProps extends ComponentPropsWithRef<'p'> {
  children?: ReactNode;
  className?: string;
}

export function SheetDescription({ className, children, ref, ...props }: SheetDescriptionProps) {
  const { descriptionId } = useSheetContext('SheetDescription');
  return (
    <p id={descriptionId} ref={ref} className={cn(styles.description, className)} {...props}>
      {children}
    </p>
  );
}

/* =============================================================================
   SheetCloseButton
   ============================================================================= */

export interface SheetCloseButtonComponentProps extends ComponentPropsWithRef<'button'> {
  'aria-label': string;
  className?: string;
}

export function SheetCloseButton({
  className,
  onClick,
  type = 'button',
  ref,
  ...props
}: SheetCloseButtonComponentProps) {
  const { onClose } = useSheetContext('SheetCloseButton');

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      onClose('close-button');
    }
  };

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      data-testid="sheet-close-button"
      className={cn(styles.closeButton, className)}
      onClick={handleClick}
    >
      <Icon name="close" size={16} />
    </button>
  );
}

/* =============================================================================
   SheetBody
   ============================================================================= */

export interface SheetBodyProps extends ComponentPropsWithRef<'div'> {
  children?: ReactNode;
  className?: string;
}

export function SheetBody({ className, children, ref, ...props }: SheetBodyProps) {
  return (
    <div ref={ref} className={cn(styles.body, className)} {...props}>
      {children}
    </div>
  );
}

/* =============================================================================
   SheetFooter
   ============================================================================= */

export interface SheetFooterProps extends ComponentPropsWithRef<'footer'> {
  children?: ReactNode;
  className?: string;
}

export function SheetFooter({ className, children, ref, ...props }: SheetFooterProps) {
  return (
    <footer ref={ref} className={cn(styles.footer, className)} {...props}>
      {children}
    </footer>
  );
}
