'use client';

import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './resizable-panel.module.css';

export type PanelOrientation = 'horizontal' | 'vertical';

interface PanelConfig {
  defaultSize: number;
  minSize: number;
  maxSize: number;
}

const DEFAULT_PANEL_CONFIG: PanelConfig = {
  defaultSize: 50,
  minSize: 10,
  maxSize: 90,
};

function isElementRTL(el: HTMLElement | null): boolean {
  if (!el) return typeof document !== 'undefined' && document.dir === 'rtl';
  return (
    Boolean(el.closest('[dir="rtl"]')) ||
    getComputedStyle(el).direction === 'rtl' ||
    (typeof document !== 'undefined' && document.dir === 'rtl')
  );
}

interface ResizableContextValue {
  orientation: PanelOrientation;
  sizes: number[];
  getPanelConfig: (index: number) => PanelConfig;
  setPanelSize: (handleIndex: number, newSize: number) => void;
  adjustSize: (handleIndex: number, deltaPercent: number) => void;
  registerPanel: (index: number, config: PanelConfig) => void;
  groupRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const ResizableContext = createContext<ResizableContextValue | null>(null);

function useResizableContext() {
  const ctx = useContext(ResizableContext);
  if (!ctx) {
    throw new Error('Resizable compound components must be rendered inside <ResizablePanelGroup>');
  }
  return ctx;
}

export interface ResizablePanelGroupProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: PanelOrientation;
  children: ReactNode;
  className?: string;
  onLayout?: (sizes: number[]) => void;
  'data-testid'?: string;
}

export const ResizablePanelGroup = forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  function ResizablePanelGroup(
    { orientation = 'horizontal', children, className, onLayout, 'data-testid': testId, ...rest },
    forwardedRef,
  ) {
    const groupRef = useRef<HTMLDivElement | null>(null);
    const [sizes, setSizes] = useState<number[]>([]);
    const sizesRef = useRef<number[]>([]);
    const panelConfigsRef = useRef<Map<number, PanelConfig>>(new Map());
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const getPanelConfig = useCallback((index: number): PanelConfig => {
      return panelConfigsRef.current.get(index) ?? DEFAULT_PANEL_CONFIG;
    }, []);

    const registerPanel = useCallback((index: number, config: PanelConfig) => {
      panelConfigsRef.current.set(index, config);
      if (sizesRef.current[index] === undefined) {
        const next = [...sizesRef.current];
        next[index] = config.defaultSize;
        sizesRef.current = next;
        setSizes(next);
      }
    }, []);

    const setPanelSize = useCallback(
      (handleIndex: number, newSize: number) => {
        const prev = sizesRef.current;
        if (prev.length < 2) return;
        const leftConfig = panelConfigsRef.current.get(handleIndex) ?? DEFAULT_PANEL_CONFIG;
        const rightConfig = panelConfigsRef.current.get(handleIndex + 1) ?? DEFAULT_PANEL_CONFIG;

        const combinedSize = (prev[handleIndex] ?? 50) + (prev[handleIndex + 1] ?? 50);
        const clampedSize = Math.max(
          leftConfig.minSize,
          Math.min(leftConfig.maxSize, Math.min(newSize, combinedSize - rightConfig.minSize)),
        );
        const rightSize = combinedSize - clampedSize;

        const next = [...prev];
        next[handleIndex] = clampedSize;
        next[handleIndex + 1] = rightSize;

        sizesRef.current = next;
        setSizes(next);
        onLayout?.(next);
      },
      [onLayout],
    );

    const adjustSize = useCallback(
      (handleIndex: number, deltaPercent: number) => {
        const current = sizesRef.current[handleIndex] ?? 50;
        setPanelSize(handleIndex, current + deltaPercent);
      },
      [setPanelSize],
    );

    return (
      <ResizableContext.Provider
        value={{
          orientation,
          sizes,
          getPanelConfig,
          setPanelSize,
          adjustSize,
          registerPanel,
          groupRef,
          isDragging,
          setIsDragging,
        }}
      >
        <div
          ref={(node) => {
            groupRef.current = node;
            if (typeof forwardedRef === 'function') {
              forwardedRef(node);
            } else if (forwardedRef) {
              forwardedRef.current = node;
            }
          }}
          data-orientation={orientation}
          data-dragging={isDragging ? 'true' : undefined}
          className={cn(styles.group, styles[`group_${orientation}`], className)}
          data-testid={testId}
          {...rest}
        >
          {children}
        </div>
      </ResizableContext.Provider>
    );
  },
);

ResizablePanelGroup.displayName = 'ResizablePanelGroup';

export interface ResizablePanelProps extends ComponentPropsWithoutRef<'div'> {
  order?: number;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel(
    {
      order = 0,
      defaultSize = 50,
      minSize = 10,
      maxSize = 90,
      children,
      className,
      style,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const { registerPanel, sizes } = useResizableContext();

    useEffect(() => {
      registerPanel(order, { defaultSize, minSize, maxSize });
    }, [order, defaultSize, minSize, maxSize, registerPanel]);

    const activeSize = sizes[order] ?? defaultSize;

    return (
      <div
        ref={ref}
        data-panel-order={order}
        className={cn(styles.panel, className)}
        style={{
          flex: `${activeSize} 1 0px`,
          ...style,
        }}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

ResizablePanel.displayName = 'ResizablePanel';

export interface ResizableHandleProps extends ComponentPropsWithoutRef<'div'> {
  handleIndex?: number;
  withHandle?: boolean;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle(
    {
      handleIndex = 0,
      withHandle = false,
      disabled = false,
      className,
      onKeyDown,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const {
      orientation,
      sizes,
      getPanelConfig,
      adjustSize,
      setPanelSize,
      groupRef,
      isDragging,
      setIsDragging,
    } = useResizableContext();

    const [active, setActive] = useState<boolean>(false);
    const cleanupDragRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      return () => {
        cleanupDragRef.current?.();
      };
    }, []);

    const panelConfig = getPanelConfig(handleIndex);
    const currentSize = Math.round(sizes[handleIndex] ?? panelConfig.defaultSize);

    const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      cleanupDragRef.current?.();
      setActive(true);
      setIsDragging(true);

      const clientPos = orientation === 'horizontal' ? e.clientX : e.clientY;
      const initialLeftSize = sizes[handleIndex] ?? panelConfig.defaultSize;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!groupRef.current) return;

        const groupRect = groupRef.current.getBoundingClientRect();
        const currentPos = orientation === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
        const isRTL = orientation === 'horizontal' && isElementRTL(groupRef.current);

        const totalDimension = orientation === 'horizontal' ? groupRect.width : groupRect.height;
        if (totalDimension <= 0) return;

        const deltaPixels = currentPos - clientPos;
        const effectiveDelta = isRTL ? -deltaPixels : deltaPixels;
        const deltaPercent = (effectiveDelta / totalDimension) * 100;

        setPanelSize(handleIndex, initialLeftSize + deltaPercent);
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        cleanupDragRef.current = null;
        setActive(false);
        setIsDragging(false);
      };

      cleanupDragRef.current = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      const step = 2;
      if (orientation === 'horizontal') {
        const isRTL = isElementRTL(groupRef.current);
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          adjustSize(handleIndex, isRTL ? step : -step);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          adjustSize(handleIndex, isRTL ? -step : step);
        }
      } else {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          adjustSize(handleIndex, -step);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          adjustSize(handleIndex, step);
        }
      }

      if (e.key === 'Home') {
        e.preventDefault();
        setPanelSize(handleIndex, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setPanelSize(handleIndex, 100);
      }

      onKeyDown?.(e);
    };

    return (
      <div
        ref={ref}
        role="separator"
        tabIndex={disabled ? -1 : 0}
        aria-orientation={orientation}
        aria-valuenow={currentSize}
        aria-valuemin={panelConfig.minSize}
        aria-valuemax={panelConfig.maxSize}
        data-active={active || isDragging ? 'true' : undefined}
        data-orientation={orientation}
        className={cn(styles.handle, styles[`handle_${orientation}`], className)}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        data-testid={testId}
        {...rest}
      >
        <div className={styles.handleLine} />
        {withHandle && <div className={styles.handleGrip} aria-hidden="true" />}
      </div>
    );
  },
);

ResizableHandle.displayName = 'ResizableHandle';
