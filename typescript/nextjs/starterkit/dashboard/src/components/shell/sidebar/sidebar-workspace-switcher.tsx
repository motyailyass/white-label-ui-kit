'use client';

import type React from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import type { SidebarWorkspaceTone } from './sidebar-workspaces-menu';
import styles from './sidebar-workspace-switcher.module.css';

export interface WorkspaceOption {
  id: string;
  name: string;
  plan?: string;
  icon?: React.ReactNode;
  initials?: string;
  tone?: SidebarWorkspaceTone;
}

export interface SidebarWorkspaceSwitcherProps {
  currentWorkspace?: WorkspaceOption;
  workspaces?: WorkspaceOption[];
  onSelectWorkspace?: (workspace: WorkspaceOption) => void;
  onCreateWorkspace?: () => void;
  onManageWorkspace?: () => void;
  /**
   * Visual padding density scale. Defaults to 'comfortable'.
   * - 'comfortable': Normal 12px inline / 8px block padding (48px target).
   * - 'compact': Tight 8px inline / 4px block padding (36px target).
   */
  density?: 'comfortable' | 'compact';
  className?: string;
}

export function SidebarWorkspaceSwitcher({
  currentWorkspace: controlledWorkspace,
  workspaces,
  onSelectWorkspace,
  onCreateWorkspace,
  onManageWorkspace,
  density = 'comfortable',
  className,
}: SidebarWorkspaceSwitcherProps) {
  const { t } = useI18n();

  const resolvedWorkspaces = useMemo<WorkspaceOption[]>(
    () =>
      workspaces && workspaces.length > 0
        ? workspaces
        : [
            {
              id: 'ws-primary',
              name: t('dashboard.workspace.primaryName'),
              plan: t('dashboard.workspace.primaryPlan'),
              initials: t('dashboard.workspace.primaryName').charAt(0).toUpperCase(),
              tone: 'primary',
            },
            {
              id: 'ws-secondary',
              name: t('dashboard.workspace.secondaryName'),
              plan: t('dashboard.workspace.secondaryPlan'),
              initials: t('dashboard.workspace.secondaryName').charAt(0).toUpperCase(),
              tone: 'info',
            },
            {
              id: 'ws-personal',
              name: t('dashboard.workspace.personalName'),
              plan: t('dashboard.workspace.personalPlan'),
              initials: t('dashboard.workspace.personalName').charAt(0).toUpperCase(),
              tone: 'success',
            },
          ],
    [workspaces, t],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(
    controlledWorkspace?.id ?? resolvedWorkspaces[0]?.id ?? 'ws-primary',
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  const activeWorkspace =
    controlledWorkspace ??
    resolvedWorkspaces.find((ws) => ws.id === selectedId) ??
    resolvedWorkspaces[0];

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // Close on Escape and restore focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSelect = (ws: WorkspaceOption) => {
    setSelectedId(ws.id);
    onSelectWorkspace?.(ws);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleCreate = () => {
    setIsOpen(false);
    onCreateWorkspace?.();
  };

  const handleManage = () => {
    setIsOpen(false);
    onManageWorkspace?.();
  };

  return (
    <div ref={containerRef} className={cn(styles.container, className)}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        data-density={density}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label={`${activeWorkspace.name} - ${t('dashboard.workspace.switchWorkspace')}`}
      >
        <span
          className={styles.logoIcon}
          data-tone={activeWorkspace.tone ?? 'primary'}
          aria-hidden="true"
        >
          {activeWorkspace.icon ??
            (activeWorkspace.initials || activeWorkspace.name.charAt(0).toUpperCase())}
        </span>
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>{activeWorkspace.name}</div>
          {activeWorkspace.plan && (
            <div className={styles.logoSubtitle}>{activeWorkspace.plan}</div>
          )}
        </div>
        <span className={styles.chevron} aria-hidden="true">
          <Icon name="chevron-down" size={16} />
        </span>
      </button>

      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-label={t('dashboard.workspace.workspaces')}
          className={styles.popover}
        >
          <div className={styles.sectionHeader} data-role="eyebrow">
            {t('dashboard.workspace.workspaces')}
          </div>

          {resolvedWorkspaces.map((ws) => {
            const isSelected = ws.id === activeWorkspace.id;
            return (
              <button
                key={ws.id}
                type="button"
                className={styles.workspaceItem}
                data-active={isSelected}
                onClick={() => handleSelect(ws)}
                aria-current={isSelected ? 'true' : undefined}
              >
                <span
                  className={styles.workspaceIcon}
                  data-tone={ws.tone ?? 'primary'}
                  aria-hidden="true"
                >
                  {ws.icon ?? (ws.initials || ws.name.charAt(0).toUpperCase())}
                </span>
                <div className={styles.workspaceInfo}>
                  <span className={styles.workspaceName}>{ws.name}</span>
                  {ws.plan && <span className={styles.workspacePlan}>{ws.plan}</span>}
                </div>
                {isSelected && (
                  <span className={styles.checkIcon} aria-hidden="true">
                    <Icon name="check" size={16} />
                  </span>
                )}
              </button>
            );
          })}

          <Separator decorative={false} className={styles.separator} />

          {/* Action 1: Create Workspace */}
          <button type="button" className={styles.actionItem} onClick={handleCreate}>
            <span className={styles.actionIcon} aria-hidden="true">
              <Icon name="plus" size={16} />
            </span>
            <span>{t('dashboard.workspace.createWorkspace')}</span>
          </button>

          {/* Action 2: Workspace Settings */}
          <button type="button" className={styles.actionItem} onClick={handleManage}>
            <span className={styles.actionIcon} aria-hidden="true">
              <Icon name="settings" size={16} />
            </span>
            <span>{t('dashboard.workspace.workspaceSettings')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
