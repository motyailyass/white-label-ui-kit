'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './navigation-menu.module.css';

function isElementRTL(el: HTMLElement): boolean {
  const dirAncestor = el.closest('[dir]');
  if (dirAncestor) {
    return dirAncestor.getAttribute('dir') === 'rtl';
  }
  return typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
}

interface NavigationMenuContextValue {
  openItem: string | null;
  setOpenItem: (id: string | null) => void;
  orientation: 'horizontal' | 'vertical';
  disabled: boolean;
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);

function useNavigationMenuContext() {
  const ctx = useContext(NavigationMenuContext);
  if (!ctx) {
    throw new Error('NavigationMenu compound components must be rendered inside <NavigationMenu>');
  }
  return ctx;
}

interface NavigationMenuItemContextValue {
  itemId: string;
  triggerId: string;
  contentId: string;
  isOpen: boolean;
}

const NavigationMenuItemContext = createContext<NavigationMenuItemContextValue | null>(null);

function useNavigationMenuItemContext() {
  const ctx = useContext(NavigationMenuItemContext);
  if (!ctx) {
    throw new Error(
      'NavigationMenuTrigger and NavigationMenuContent must be rendered inside <NavigationMenuItem>',
    );
  }
  return ctx;
}

const NavigationMenuContentContext = createContext<boolean>(false);

/* -------------------------------------------------------------------------- */
/* NavigationMenu (Root)                                                      */
/* -------------------------------------------------------------------------- */

export interface NavigationMenuProps
  extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange' | 'defaultValue'> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  'data-testid'?: string;
}

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  {
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    orientation = 'horizontal',
    disabled = false,
    children,
    className,
    onKeyDown,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const containerRef = useRef<HTMLElement | null>(null);

  const setOpenItem = useCallback(
    (id: string | null) => {
      if (disabled && id !== null) return;
      if (!isControlled) {
        setUncontrolledValue(id);
      }
      onValueChange?.(id);
    },
    [disabled, isControlled, onValueChange],
  );

  // Close on outside click
  useEffect(() => {
    if (!activeValue) return;

    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenItem(null);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [activeValue, setOpenItem]);

  // Handle Escape key and restore focus to the trigger if focus was inside the open flyout
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    if (e.key === 'Escape' && activeValue) {
      e.preventDefault();
      const navEl = containerRef.current;
      const targetNode = e.target as HTMLElement | null;
      const openMenuEl = targetNode?.closest<HTMLElement>('[role="menu"]');
      const triggerId = openMenuEl?.getAttribute('aria-labelledby');

      setOpenItem(null);

      if (navEl && triggerId) {
        const triggers = Array.from(
          navEl.querySelectorAll<HTMLElement>('[data-nav-top-item="true"]'),
        );
        const triggerBtn = triggers.find((el) => el.id === triggerId);
        triggerBtn?.focus();
      }
    }
  };

  const contextValue = useMemo<NavigationMenuContextValue>(
    () => ({
      openItem: disabled ? null : (activeValue ?? null),
      setOpenItem,
      orientation,
      disabled,
    }),
    [activeValue, disabled, orientation, setOpenItem],
  );

  return (
    <NavigationMenuContext.Provider value={contextValue}>
      <nav
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-orientation={orientation}
        className={cn(styles.nav, className)}
        onKeyDown={handleKeyDown}
        data-testid={testId}
        {...rest}
      >
        {children}
      </nav>
    </NavigationMenuContext.Provider>
  );
});

NavigationMenu.displayName = 'NavigationMenu';

/* -------------------------------------------------------------------------- */
/* NavigationMenuList                                                         */
/* -------------------------------------------------------------------------- */

export interface NavigationMenuListProps extends ComponentPropsWithoutRef<'ul'> {
  'data-testid'?: string;
}

export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  function NavigationMenuList(
    { children, className, onKeyDown, 'data-testid': testId, ...rest },
    ref,
  ) {
    const { orientation } = useNavigationMenuContext();

    const handleListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      if (!target || target.getAttribute('data-nav-top-item') !== 'true') {
        return;
      }

      const listEl = e.currentTarget;
      const items = Array.from(
        listEl.querySelectorAll<HTMLElement>(
          '[data-nav-top-item="true"]:not(:disabled):not([aria-disabled="true"])',
        ),
      );
      if (items.length === 0) return;

      const currentIndex = items.indexOf(target);
      if (currentIndex === -1) return;

      if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
        return;
      }

      if (orientation === 'horizontal' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const isRtl = isElementRTL(listEl);
        const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
        const delta = e.key === nextKey ? 1 : -1;
        const nextIndex = (currentIndex + delta + items.length) % items.length;
        e.preventDefault();
        items[nextIndex]?.focus();
      } else if (orientation === 'vertical' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (currentIndex + delta + items.length) % items.length;
        e.preventDefault();
        items[nextIndex]?.focus();
      }
    };

    return (
      <ul
        ref={ref}
        role="menubar"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={cn(styles.list, className)}
        onKeyDown={handleListKeyDown}
        data-testid={testId}
        {...rest}
      >
        {children}
      </ul>
    );
  },
);

NavigationMenuList.displayName = 'NavigationMenuList';

/* -------------------------------------------------------------------------- */
/* NavigationMenuItem                                                         */
/* -------------------------------------------------------------------------- */

export interface NavigationMenuItemProps extends ComponentPropsWithoutRef<'li'> {
  value?: string;
  'data-testid'?: string;
}

export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem(
    { value: explicitValue, children, className, 'data-testid': testId, ...rest },
    ref,
  ) {
    const generatedId = useId();
    const itemId = explicitValue || generatedId;
    const triggerId = `${generatedId}-trigger`;
    const contentId = `${generatedId}-content`;

    const { openItem, orientation } = useNavigationMenuContext();
    const isOpen = openItem === itemId;

    const itemContext = useMemo<NavigationMenuItemContextValue>(
      () => ({ itemId, triggerId, contentId, isOpen }),
      [itemId, triggerId, contentId, isOpen],
    );

    return (
      <NavigationMenuItemContext.Provider value={itemContext}>
        <li
          ref={ref}
          role="none"
          data-orientation={orientation}
          className={cn(styles.item, className)}
          data-testid={testId}
          {...rest}
        >
          {children}
        </li>
      </NavigationMenuItemContext.Provider>
    );
  },
);

NavigationMenuItem.displayName = 'NavigationMenuItem';

/* -------------------------------------------------------------------------- */
/* NavigationMenuTrigger                                                      */
/* -------------------------------------------------------------------------- */

export interface NavigationMenuTriggerProps extends ComponentPropsWithoutRef<'button'> {
  'data-testid'?: string;
}

export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  function NavigationMenuTrigger(
    {
      children,
      className,
      disabled: triggerDisabled,
      onClick,
      onKeyDown,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const { itemId, triggerId, contentId, isOpen } = useNavigationMenuItemContext();
    const { setOpenItem, orientation, disabled: menuDisabled } = useNavigationMenuContext();
    const isDisabled = Boolean(menuDisabled || triggerDisabled);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      setOpenItem(isOpen ? null : itemId);
    };

    const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || isDisabled) return;

      const shouldOpenWithArrow =
        (orientation === 'horizontal' && e.key === 'ArrowDown') ||
        (orientation === 'vertical' &&
          e.key === (isElementRTL(e.currentTarget) ? 'ArrowLeft' : 'ArrowRight'));

      if (shouldOpenWithArrow) {
        e.preventDefault();
        const liEl = e.currentTarget.closest('li');
        if (!isOpen) {
          setOpenItem(itemId);
        }
        requestAnimationFrame(() => {
          const firstItem = liEl?.querySelector<HTMLElement>(
            '[role="menu"] [role="menuitem"]:not([aria-disabled="true"])',
          );
          firstItem?.focus();
        });
      }
    };

    return (
      <button
        ref={ref}
        id={triggerId}
        type="button"
        role="menuitem"
        disabled={isDisabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={contentId}
        data-nav-top-item="true"
        data-expanded={isOpen ? 'true' : undefined}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        onKeyDown={handleTriggerKeyDown}
        data-testid={testId}
        {...rest}
      >
        <span>{children}</span>
        <span className={styles.chevron} aria-hidden="true">
          <Icon name="chevron-down" size={14} />
        </span>
      </button>
    );
  },
);

NavigationMenuTrigger.displayName = 'NavigationMenuTrigger';

/* -------------------------------------------------------------------------- */
/* NavigationMenuContent                                                      */
/* -------------------------------------------------------------------------- */

export interface NavigationMenuContentProps extends ComponentPropsWithoutRef<'div'> {
  'data-testid'?: string;
}

export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  function NavigationMenuContent(
    { children, className, onKeyDown, 'data-testid': testId, ...rest },
    ref,
  ) {
    const { triggerId, contentId, isOpen } = useNavigationMenuItemContext();
    const { orientation } = useNavigationMenuContext();

    if (!isOpen) {
      return null;
    }

    const handleContentKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') {
        return;
      }

      const menuEl = e.currentTarget;
      const items = Array.from(
        menuEl.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'),
      );
      if (items.length === 0) return;

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[role="menuitem"]');
      const currentIndex = target ? items.indexOf(target) : -1;

      e.preventDefault();
      if (e.key === 'Home') {
        items[0]?.focus();
      } else if (e.key === 'End') {
        items[items.length - 1]?.focus();
      } else if (e.key === 'ArrowDown') {
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      }
    };

    return (
      <NavigationMenuContentContext.Provider value={true}>
        <div
          ref={ref}
          id={contentId}
          role="menu"
          aria-labelledby={triggerId}
          data-orientation={orientation}
          className={cn(styles.content, className)}
          onKeyDown={handleContentKeyDown}
          data-testid={testId}
          {...rest}
        >
          {children}
        </div>
      </NavigationMenuContentContext.Provider>
    );
  },
);

NavigationMenuContent.displayName = 'NavigationMenuContent';

/* -------------------------------------------------------------------------- */
/* NavigationMenuLink                                                         */
/* -------------------------------------------------------------------------- */

export interface NavigationMenuLinkProps extends ComponentPropsWithoutRef<'a'> {
  active?: boolean;
  disabled?: boolean;
  icon?: IconName | Exclude<ReactNode, string>;
  closeOnSelect?: boolean;
  as?: ElementType;
  'data-testid'?: string;
}

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink(
    {
      active = false,
      disabled: linkDisabled = false,
      icon,
      closeOnSelect = true,
      as: Component = 'a',
      children,
      className,
      onClick,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const navCtx = useContext(NavigationMenuContext);
    const isInsideContent = useContext(NavigationMenuContentContext);
    const isDisabled = Boolean(navCtx?.disabled || linkDisabled);

    const renderedIcon = useMemo(() => {
      if (!icon) return null;
      if (typeof icon === 'string') {
        return <Icon name={icon as IconName} size={16} />;
      }
      return icon;
    }, [icon]);

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      if (isInsideContent && closeOnSelect) {
        navCtx?.setOpenItem(null);
      }
    };

    return (
      <Component
        ref={ref}
        role="menuitem"
        tabIndex={isDisabled ? -1 : undefined}
        aria-current={active ? 'page' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        data-active={active ? 'true' : undefined}
        data-disabled={isDisabled ? 'true' : undefined}
        data-nav-top-item={!isInsideContent ? 'true' : undefined}
        className={cn(styles.link, className)}
        onClick={handleClick}
        data-testid={testId}
        {...rest}
      >
        {renderedIcon ? (
          <span className={styles.linkIcon} aria-hidden="true">
            {renderedIcon}
          </span>
        ) : null}
        {children}
      </Component>
    );
  },
);

NavigationMenuLink.displayName = 'NavigationMenuLink';
