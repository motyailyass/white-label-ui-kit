'use client';

import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Icon, type IconName } from '@/components/icons';
import type { AccessibleNameProps } from '@/lib/accessible-name';
import { cn } from '@/lib/cn';
import styles from './tree-view.module.css';

type TreeNodeCSSProperties = CSSProperties & {
  '--tree-level'?: number;
};

function isElementRTL(el: HTMLElement): boolean {
  const dirAncestor = el.closest('[dir]');
  if (dirAncestor) {
    return dirAncestor.getAttribute('dir') === 'rtl';
  }
  return typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
}

function getVisibleTreeButtons(currentBtn: HTMLButtonElement): HTMLButtonElement[] {
  const treeRoot = currentBtn.closest('[role="tree"]');
  if (!treeRoot) return [];
  const allButtons = Array.from(
    treeRoot.querySelectorAll<HTMLButtonElement>('button[data-tree-node-id]:not(:disabled)'),
  );
  return allButtons.filter((btn) => !btn.closest('[hidden]'));
}

interface TreeViewContextValue {
  selectedId: string | null;
  focusedId: string | null;
  setFocusedId: (id: string) => void;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  selectNode: (id: string) => void;
  disabled: boolean;
}

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

function useTreeViewContext() {
  const ctx = useContext(TreeViewContext);
  if (!ctx) {
    throw new Error('TreeNode must be rendered inside <TreeView>');
  }
  return ctx;
}

const TreeLevelContext = createContext<number>(0);

interface TreeViewBaseProps
  extends Omit<ComponentPropsWithoutRef<'ul'>, 'onSelect' | 'aria-label' | 'aria-labelledby'> {
  selectedId?: string;
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  disabled?: boolean;
  'data-testid'?: string;
}

export type TreeViewProps = TreeViewBaseProps & AccessibleNameProps;

export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  {
    selectedId: controlledSelected,
    defaultSelectedId,
    onSelect,
    expandedIds: controlledExpanded,
    defaultExpandedIds = [],
    onExpandedChange,
    disabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const isSelectedControlled = controlledSelected !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] = useState<string | null>(
    defaultSelectedId ?? null,
  );
  const selectedId = isSelectedControlled ? controlledSelected : uncontrolledSelected;
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const isExpandedControlled = controlledExpanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  );

  const expandedIds = useMemo(() => {
    if (isExpandedControlled) {
      return new Set(controlledExpanded);
    }
    return uncontrolledExpanded;
  }, [isExpandedControlled, controlledExpanded, uncontrolledExpanded]);

  const selectNode = useCallback(
    (id: string) => {
      if (disabled) return;
      if (!isSelectedControlled) {
        setUncontrolledSelected(id);
      }
      onSelect?.(id);
    },
    [disabled, isSelectedControlled, onSelect],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      if (disabled) return;
      const next = new Set(expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (!isExpandedControlled) {
        setUncontrolledExpanded(next);
      }
      onExpandedChange?.(Array.from(next));
    },
    [disabled, expandedIds, isExpandedControlled, onExpandedChange],
  );

  const contextValue = useMemo<TreeViewContextValue>(
    () => ({
      selectedId: selectedId ?? null,
      focusedId,
      setFocusedId,
      expandedIds,
      toggleExpanded,
      selectNode,
      disabled,
    }),
    [selectedId, focusedId, expandedIds, toggleExpanded, selectNode, disabled],
  );

  return (
    <TreeViewContext.Provider value={contextValue}>
      <TreeLevelContext.Provider value={0}>
        <ul
          ref={ref}
          role="tree"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-disabled={disabled ? 'true' : undefined}
          className={cn(styles.tree, className)}
          data-testid={testId}
          {...rest}
        >
          {children}
        </ul>
      </TreeLevelContext.Provider>
    </TreeViewContext.Provider>
  );
});

TreeView.displayName = 'TreeView';

export interface TreeNodeProps extends ComponentPropsWithoutRef<'li'> {
  id: string;
  label: ReactNode;
  icon?: IconName | Exclude<ReactNode, string>;
  meta?: ReactNode;
  disabled?: boolean;
  'data-testid'?: string;
}

export const TreeNode = forwardRef<HTMLLIElement, TreeNodeProps>(function TreeNode(
  {
    id,
    label,
    icon,
    meta,
    disabled: nodeDisabled = false,
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const {
    selectedId,
    focusedId,
    setFocusedId,
    expandedIds,
    toggleExpanded,
    selectNode,
    disabled: treeDisabled,
  } = useTreeViewContext();
  const level = useContext(TreeLevelContext);

  const disabled = treeDisabled || nodeDisabled;
  const isBranch = Boolean(children);
  const isExpanded = expandedIds.has(id);
  const isSelected = selectedId === id;

  const activeTabId = focusedId ?? selectedId;
  const tabIndex = disabled ? -1 : activeTabId ? (activeTabId === id ? 0 : -1) : 0;

  const handleRowClick = () => {
    if (disabled) return;
    selectNode(id);
    if (isBranch) {
      toggleExpanded(id);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick();
      return;
    }

    const currentBtn = e.currentTarget;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      const visible = getVisibleTreeButtons(currentBtn);
      if (visible.length === 0) return;
      const currentIndex = visible.indexOf(currentBtn);
      let targetBtn: HTMLButtonElement | undefined;

      if (e.key === 'ArrowDown') {
        targetBtn = visible[currentIndex + 1];
      } else if (e.key === 'ArrowUp') {
        targetBtn = visible[currentIndex - 1];
      } else if (e.key === 'Home') {
        targetBtn = visible[0];
      } else if (e.key === 'End') {
        targetBtn = visible[visible.length - 1];
      }

      if (targetBtn) {
        e.preventDefault();
        targetBtn.focus();
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const isRtl = isElementRTL(currentBtn);
      const expandKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
      const collapseKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

      if (e.key === expandKey && isBranch) {
        e.preventDefault();
        if (!isExpanded) {
          toggleExpanded(id);
        } else {
          const visible = getVisibleTreeButtons(currentBtn);
          const currentIndex = visible.indexOf(currentBtn);
          visible[currentIndex + 1]?.focus();
        }
        return;
      }

      if (e.key === collapseKey) {
        if (isBranch && isExpanded) {
          e.preventDefault();
          toggleExpanded(id);
        } else {
          const parentGroup = currentBtn.closest('ul[role="group"]');
          const parentLi = parentGroup?.closest('li[role="treeitem"]');
          const parentBtn = parentLi?.querySelector<HTMLButtonElement>(
            ':scope > button[data-tree-node-id]:not(:disabled)',
          );
          if (parentBtn) {
            e.preventDefault();
            parentBtn.focus();
          }
        }
      }
    }
  };

  const renderedIcon = useMemo(() => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Icon name={icon as IconName} size={16} />;
    }
    return icon;
  }, [icon]);

  const rowStyle: TreeNodeCSSProperties = {
    '--tree-level': level,
  };

  return (
    <li
      ref={ref}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={isBranch ? isExpanded : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      className={cn(styles.item, className)}
      data-testid={testId}
      {...rest}
    >
      <button
        type="button"
        tabIndex={tabIndex}
        disabled={disabled}
        data-tree-node-id={id}
        data-selected={isSelected ? 'true' : undefined}
        data-expanded={isBranch ? (isExpanded ? 'true' : 'false') : undefined}
        className={styles.nodeRow}
        style={rowStyle}
        onFocus={() => setFocusedId(id)}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
      >
        {isBranch ? (
          <span
            className={styles.chevron}
            data-expanded={isExpanded ? 'true' : undefined}
            aria-hidden="true"
          >
            <Icon name="chevron-right" size={14} />
          </span>
        ) : (
          <span className={styles.chevronPlaceholder} aria-hidden="true" />
        )}

        {renderedIcon ? <span className={styles.icon}>{renderedIcon}</span> : null}
        <span className={styles.label}>{label}</span>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </button>

      {isBranch ? (
        <TreeLevelContext.Provider value={level + 1}>
          <ul role="group" className={styles.group} hidden={!isExpanded}>
            {children}
          </ul>
        </TreeLevelContext.Provider>
      ) : null}
    </li>
  );
});

TreeNode.displayName = 'TreeNode';
