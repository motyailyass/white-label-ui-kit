'use client';

import {
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import { Button, Select, Switch } from '@/components/ui';
import { BidiText } from '@/i18n';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import { useGalleryLinkComponent } from './gallery-link-context';
import styles from './gallery-studio.module.css';

export type StudioRouteId =
  | 'hub'
  | 'accordion'
  | 'alert'
  | 'alert-dialog'
  | 'button'
  | 'input'
  | 'combobox'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'dialog'
  | 'popover'
  | 'dropdown'
  | 'tooltip'
  | 'badge'
  | 'avatar'
  | 'card'
  | 'tabs'
  | 'label'
  | 'separator'
  | 'spinner'
  | 'skeleton'
  | 'breadcrumb'
  | 'stat-card'
  | 'sheet'
  | 'toast'
  | 'pagination'
  | 'data-table'
  | 'progress'
  | 'command-palette'
  | 'empty-state'
  | 'date-picker'
  | 'kbd'
  | 'status-dot'
  | 'aspect-ratio'
  | 'input-otp'
  | 'slider'
  | 'toggle'
  | 'collapsible'
  | 'stepper'
  | 'timeline'
  | 'hover-card'
  | 'context-menu'
  | 'scroll-area'
  | 'resizable-panel'
  | 'file-upload'
  | 'filter-bar'
  | 'tree-view'
  | 'navigation-menu'
  | 'chart';

export interface StudioNavLinkProps {
  href: string;
  className?: string;
  'aria-current'?: 'page' | undefined;
  children: ReactNode;
}

export type StudioLinkComponent = ComponentType<StudioNavLinkProps>;

function DefaultStudioAnchor({ href, className, children, ...rest }: StudioNavLinkProps) {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

export type StudioRadiusPreset =
  | 'preset'
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'full';

export interface GalleryStudioLayoutProps {
  activeRoute: StudioRouteId;
  title: string;
  subtitle: string;
  testId: string;
  radiusPreset?: StudioRadiusPreset;
  previewDir?: 'ltr' | 'rtl';
  onReset: () => void;
  linkComponent?: StudioLinkComponent;
  stageFooter?: ReactNode;
  controls: ReactNode;
  inspector: ReactNode;
  children: ReactNode;
}

export function GalleryStudioLayout({
  activeRoute,
  title,
  subtitle,
  testId,
  radiusPreset = 'preset',
  previewDir = 'ltr',
  onReset,
  linkComponent,
  stageFooter,
  controls,
  inspector,
  children,
}: GalleryStudioLayoutProps) {
  const { t } = useI18n();
  const ContextLink = useGalleryLinkComponent();
  const LinkSlot = linkComponent ?? ContextLink ?? DefaultStudioAnchor;

  const stageHeadingId = useId();
  const controlsHeadingId = useId();

  return (
    <main className={styles.studioMain} data-testid={testId}>
      <header className={styles.studioHeader}>
        <div className={styles.headerTopRow}>
          <div className={styles.titleGroup}>
            <p className={styles.eyebrow} data-role="eyebrow">
              {t('common.studio.eyebrow')}
            </p>
            <h1 className={styles.pageTitle}>{title}</h1>
            <p className={styles.pageSubtitle}>{subtitle}</p>
          </div>
          <div className={styles.headerActions}>
            <LanguageSwitcher size="sm" />
            <ThemeSwitcher size="sm" />
            <Button size="sm" variant="secondary" onClick={onReset} data-testid="studio-reset-btn">
              {t('common.studio.resetDefaults')}
            </Button>
          </div>
        </div>

        <nav className={styles.studioNav} aria-label={t('common.studio.navAriaLabel')}>
          <ul className={styles.navList}>
            <li>
              <LinkSlot
                href="/gallery"
                className={styles.navLink}
                aria-current={activeRoute === 'hub' ? 'page' : undefined}
              >
                <span>{t('common.studio.navOverview')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/button"
                className={styles.navLink}
                aria-current={activeRoute === 'button' ? 'page' : undefined}
              >
                <span>{t('common.studio.navButton')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/input"
                className={styles.navLink}
                aria-current={activeRoute === 'input' ? 'page' : undefined}
              >
                <span>{t('common.studio.compInput')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/combobox"
                className={styles.navLink}
                aria-current={activeRoute === 'combobox' ? 'page' : undefined}
              >
                <span>{t('common.studio.compCombobox')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/textarea"
                className={styles.navLink}
                aria-current={activeRoute === 'textarea' ? 'page' : undefined}
              >
                <span>{t('common.studio.compTextarea')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/select"
                className={styles.navLink}
                aria-current={activeRoute === 'select' ? 'page' : undefined}
              >
                <span>{t('common.studio.compSelect')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/checkbox"
                className={styles.navLink}
                aria-current={activeRoute === 'checkbox' ? 'page' : undefined}
              >
                <span>{t('common.studio.compCheckbox')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/radio"
                className={styles.navLink}
                aria-current={activeRoute === 'radio' ? 'page' : undefined}
              >
                <span>{t('common.studio.compRadio')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/switch"
                className={styles.navLink}
                aria-current={activeRoute === 'switch' ? 'page' : undefined}
              >
                <span>{t('common.studio.compSwitch')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/dialog"
                className={styles.navLink}
                aria-current={activeRoute === 'dialog' ? 'page' : undefined}
              >
                <span>{t('common.studio.navDialog')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/popover"
                className={styles.navLink}
                aria-current={activeRoute === 'popover' ? 'page' : undefined}
              >
                <span>{t('common.studio.compPopover')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/dropdown"
                className={styles.navLink}
                aria-current={activeRoute === 'dropdown' ? 'page' : undefined}
              >
                <span>{t('common.studio.compDropdown')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/tooltip"
                className={styles.navLink}
                aria-current={activeRoute === 'tooltip' ? 'page' : undefined}
              >
                <span>{t('common.studio.compTooltip')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/badge"
                className={styles.navLink}
                aria-current={activeRoute === 'badge' ? 'page' : undefined}
              >
                <span>{t('common.studio.compBadge')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/avatar"
                className={styles.navLink}
                aria-current={activeRoute === 'avatar' ? 'page' : undefined}
              >
                <span>{t('common.studio.compAvatar')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/card"
                className={styles.navLink}
                aria-current={activeRoute === 'card' ? 'page' : undefined}
              >
                <span>{t('common.studio.compCard')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/tabs"
                className={styles.navLink}
                aria-current={activeRoute === 'tabs' ? 'page' : undefined}
              >
                <span>{t('common.studio.compTabs')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/accordion"
                className={styles.navLink}
                aria-current={activeRoute === 'accordion' ? 'page' : undefined}
              >
                <span>{t('common.studio.compAccordion')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/alert"
                className={styles.navLink}
                aria-current={activeRoute === 'alert' ? 'page' : undefined}
              >
                <span>{t('common.studio.compAlert')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/alert-dialog"
                className={styles.navLink}
                aria-current={activeRoute === 'alert-dialog' ? 'page' : undefined}
              >
                <span>{t('common.studio.compAlertDialog')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/label"
                className={styles.navLink}
                aria-current={activeRoute === 'label' ? 'page' : undefined}
              >
                <span>{t('common.studio.compLabel')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/separator"
                className={styles.navLink}
                aria-current={activeRoute === 'separator' ? 'page' : undefined}
              >
                <span>{t('common.studio.compSeparator')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/spinner"
                className={styles.navLink}
                aria-current={activeRoute === 'spinner' ? 'page' : undefined}
              >
                <span>{t('common.studio.compSpinner')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/skeleton"
                className={styles.navLink}
                aria-current={activeRoute === 'skeleton' ? 'page' : undefined}
              >
                <span>{t('common.studio.compSkeleton')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/breadcrumb"
                className={styles.navLink}
                aria-current={activeRoute === 'breadcrumb' ? 'page' : undefined}
              >
                <span>{t('common.studio.compBreadcrumb')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/stat-card"
                className={styles.navLink}
                aria-current={activeRoute === 'stat-card' ? 'page' : undefined}
              >
                <span>{t('common.studio.compStatCard')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/sheet"
                className={styles.navLink}
                aria-current={activeRoute === 'sheet' ? 'page' : undefined}
              >
                <span>{t('common.studio.compSheet')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/toast"
                className={styles.navLink}
                aria-current={activeRoute === 'toast' ? 'page' : undefined}
              >
                <span>{t('common.studio.compToast')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/pagination"
                className={styles.navLink}
                aria-current={activeRoute === 'pagination' ? 'page' : undefined}
              >
                <span>{t('common.studio.compPagination')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/data-table"
                className={styles.navLink}
                aria-current={activeRoute === 'data-table' ? 'page' : undefined}
              >
                <span>{t('common.studio.compDataTable')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/progress"
                className={styles.navLink}
                aria-current={activeRoute === 'progress' ? 'page' : undefined}
              >
                <span>{t('common.studio.compProgress')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/command-palette"
                className={styles.navLink}
                aria-current={activeRoute === 'command-palette' ? 'page' : undefined}
              >
                <span>{t('common.studio.compCommandPalette')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/empty-state"
                className={styles.navLink}
                aria-current={activeRoute === 'empty-state' ? 'page' : undefined}
              >
                <span>{t('common.studio.compEmptyState')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/date-picker"
                className={styles.navLink}
                aria-current={activeRoute === 'date-picker' ? 'page' : undefined}
              >
                <span>{t('common.studio.compDatePicker')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/kbd"
                className={styles.navLink}
                aria-current={activeRoute === 'kbd' ? 'page' : undefined}
              >
                <span>{t('common.studio.compKbd')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/status-dot"
                className={styles.navLink}
                aria-current={activeRoute === 'status-dot' ? 'page' : undefined}
              >
                <span>{t('common.studio.compStatusDot')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/aspect-ratio"
                className={styles.navLink}
                aria-current={activeRoute === 'aspect-ratio' ? 'page' : undefined}
              >
                <span>{t('common.studio.compAspectRatio')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/input-otp"
                className={styles.navLink}
                aria-current={activeRoute === 'input-otp' ? 'page' : undefined}
              >
                <span>{t('common.studio.compInputOtp')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/slider"
                className={styles.navLink}
                aria-current={activeRoute === 'slider' ? 'page' : undefined}
              >
                <span>{t('common.studio.compSlider')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/toggle"
                className={styles.navLink}
                aria-current={activeRoute === 'toggle' ? 'page' : undefined}
              >
                <span>{t('common.studio.compToggle')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/collapsible"
                className={styles.navLink}
                aria-current={activeRoute === 'collapsible' ? 'page' : undefined}
              >
                <span>{t('common.studio.compCollapsible')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/stepper"
                className={styles.navLink}
                aria-current={activeRoute === 'stepper' ? 'page' : undefined}
              >
                <span>{t('common.studio.compStepper')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/timeline"
                className={styles.navLink}
                aria-current={activeRoute === 'timeline' ? 'page' : undefined}
              >
                <span>{t('common.studio.compTimeline')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/hover-card"
                className={styles.navLink}
                aria-current={activeRoute === 'hover-card' ? 'page' : undefined}
              >
                <span>{t('common.studio.compHoverCard')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/context-menu"
                className={styles.navLink}
                aria-current={activeRoute === 'context-menu' ? 'page' : undefined}
              >
                <span>{t('common.studio.compContextMenu')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/scroll-area"
                className={styles.navLink}
                aria-current={activeRoute === 'scroll-area' ? 'page' : undefined}
              >
                <span>{t('common.studio.compScrollArea')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/resizable-panel"
                className={styles.navLink}
                aria-current={activeRoute === 'resizable-panel' ? 'page' : undefined}
              >
                <span>{t('common.studio.compResizablePanel')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/file-upload"
                className={styles.navLink}
                aria-current={activeRoute === 'file-upload' ? 'page' : undefined}
              >
                <span>{t('common.studio.compFileUpload')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/filter-bar"
                className={styles.navLink}
                aria-current={activeRoute === 'filter-bar' ? 'page' : undefined}
              >
                <span>{t('common.studio.compFilterBar')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/tree-view"
                className={styles.navLink}
                aria-current={activeRoute === 'tree-view' ? 'page' : undefined}
              >
                <span>{t('common.studio.compTreeView')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/navigation-menu"
                className={styles.navLink}
                aria-current={activeRoute === 'navigation-menu' ? 'page' : undefined}
              >
                <span>{t('common.studio.compNavigationMenu')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/chart"
                className={styles.navLink}
                aria-current={activeRoute === 'chart' ? 'page' : undefined}
              >
                <span>{t('common.studio.compChart')}</span>
              </LinkSlot>
            </li>
          </ul>
        </nav>
      </header>

      <div className={styles.workbench}>
        <section className={styles.stageCard} aria-labelledby={stageHeadingId}>
          <div className={styles.cardHeader}>
            <h2 id={stageHeadingId} className={styles.cardTitle}>
              {t('common.studio.stageTitle')}
            </h2>
          </div>

          <div className={styles.stageBody}>
            <div
              className={styles.previewCanvas}
              dir={previewDir}
              data-radius-preset={radiusPreset === 'preset' ? undefined : radiusPreset}
              data-testid="studio-preview-canvas"
            >
              {children}
            </div>
            {stageFooter}
          </div>
        </section>

        <aside className={styles.controlsCard} aria-labelledby={controlsHeadingId}>
          <div className={styles.cardHeader}>
            <h2 id={controlsHeadingId} className={styles.cardTitle}>
              {t('common.studio.controlsTitle')}
            </h2>
          </div>

          <div className={styles.controlsBody}>{controls}</div>
        </aside>
      </div>

      {inspector}
    </main>
  );
}

export interface StudioSegmentedOption<T extends string> {
  value: T;
  label: string;
  testId?: string;
}

export interface StudioSegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly StudioSegmentedOption<T>[];
  onChange: (next: T) => void;
  columns?: 2 | 3;
}

export function StudioSegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  columns,
}: StudioSegmentedControlProps<T>) {
  const labelId = useId();
  return (
    <div className={styles.controlGroup}>
      <span id={labelId} className={styles.controlLabel}>
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className={styles.segmentedGroup}
        data-columns={columns}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            className={styles.segmentBtn}
            onClick={() => onChange(opt.value)}
            data-testid={opt.testId}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface StudioSelectOption<T extends string> {
  value: T;
  label: string;
}

export interface StudioSelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly StudioSelectOption<T>[];
  onChange: (next: T) => void;
  testId?: string;
}

export function StudioSelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  testId,
}: StudioSelectFieldProps<T>) {
  const selectId = useId();
  return (
    <div className={styles.controlGroup}>
      <label htmlFor={selectId} className={styles.controlLabel}>
        {label}
      </label>
      <Select
        id={selectId}
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        data-testid={testId}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export interface StudioToggleRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  testId?: string;
}

export function StudioToggleRow({ label, checked, onCheckedChange, testId }: StudioToggleRowProps) {
  const switchId = useId();
  return (
    <div className={styles.toggleRow}>
      <label htmlFor={switchId} className={styles.toggleLabelText}>
        {label}
      </label>
      <Switch
        id={switchId}
        size="sm"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        data-testid={testId}
      />
    </div>
  );
}

export interface StudioSpecGroup {
  title: string;
  items: readonly { label: string; value: string }[];
}

export interface GalleryCodeInspectorProps {
  aiPrompt: string;
  jsxCode: string;
  cssCode: string | null;
  cssFileName: string;
  jsxFileName: string;
  specGroups: readonly StudioSpecGroup[];
}

type InspectorTabId = 'prompt' | 'code' | 'specs';

const TAB_ORDER: readonly InspectorTabId[] = ['prompt', 'code', 'specs'];

export function GalleryCodeInspector({
  aiPrompt,
  jsxCode,
  cssCode,
  cssFileName,
  jsxFileName,
  specGroups,
}: GalleryCodeInspectorProps) {
  const { t, direction } = useI18n();
  const [activeTab, setActiveTab] = useState<InspectorTabId>('prompt');
  const [copiedTarget, setCopiedTarget] = useState<'prompt' | 'jsx' | 'css' | null>(null);
  const [copyErrorTarget, setCopyErrorTarget] = useState<'prompt' | 'jsx' | 'css' | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabRefs = useRef<Record<InspectorTabId, HTMLButtonElement | null>>({
    prompt: null,
    code: null,
    specs: null,
  });

  const headingId = useId();
  const baseTabId = useId();

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async (text: string, target: 'prompt' | 'jsx' | 'css') => {
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    setCopyErrorTarget(null);

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedTarget(target);
        copyTimerRef.current = setTimeout(() => {
          setCopiedTarget(null);
        }, 2000);
        return;
      } catch {
        // Clipboard write was rejected or permission denied
      }
    }

    // Fallback: clipboard write failed or API unavailable
    setCopiedTarget(null);
    setCopyErrorTarget(target);
    copyTimerRef.current = setTimeout(() => {
      setCopyErrorTarget(null);
    }, 3500);
  }, []);

  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, current: InspectorTabId) => {
      const idx = TAB_ORDER.indexOf(current);
      const isRtl = direction === 'rtl';
      let nextIdx: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIdx = isRtl
          ? (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length
          : (idx + 1) % TAB_ORDER.length;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = isRtl
          ? (idx + 1) % TAB_ORDER.length
          : (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      } else if (e.key === 'Home') {
        nextIdx = 0;
      } else if (e.key === 'End') {
        nextIdx = TAB_ORDER.length - 1;
      }

      if (nextIdx !== null) {
        e.preventDefault();
        const nextTab = TAB_ORDER[nextIdx];
        setActiveTab(nextTab);
        tabRefs.current[nextTab]?.focus();
      }
    },
    [direction],
  );

  const getTabLabel = (id: InspectorTabId): string => {
    if (id === 'prompt') return t('common.studio.tabAiPrompt');
    if (id === 'code') return t('common.studio.tabJsxCss');
    return t('common.studio.tabSpecs');
  };

  return (
    <section
      className={styles.inspectorCard}
      aria-labelledby={headingId}
      data-testid="studio-code-inspector"
    >
      <div className={styles.cardHeader}>
        <div className={styles.inspectorHeader}>
          <h2 id={headingId} className={styles.cardTitle}>
            {t('common.studio.inspectorTitle')}
          </h2>
          <p className={styles.inspectorSubtitle}>{t('common.studio.inspectorSubtitle')}</p>
        </div>
        {copiedTarget && (
          <div role="status" aria-live="polite" className={styles.copyFeedback}>
            {t('common.studio.copied')}
          </div>
        )}
        {copyErrorTarget && (
          <div
            role="alert"
            aria-live="polite"
            className={cn(styles.copyFeedback, styles.copyFeedbackError)}
          >
            {t('common.studio.copyFailed')}
          </div>
        )}
      </div>

      <div className={styles.tabBar}>
        <div role="tablist" aria-labelledby={headingId} className={styles.tabList}>
          {TAB_ORDER.map((tabId) => {
            const isSelected = activeTab === tabId;
            return (
              <button
                key={tabId}
                ref={(el) => {
                  tabRefs.current[tabId] = el;
                }}
                id={`${baseTabId}-tab-${tabId}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`${baseTabId}-panel-${tabId}`}
                tabIndex={isSelected ? 0 : -1}
                className={styles.tabButton}
                onClick={() => setActiveTab(tabId)}
                onKeyDown={(e) => handleTabKeyDown(e, tabId)}
                data-testid={`inspector-tab-${tabId}`}
              >
                {getTabLabel(tabId)}
              </button>
            );
          })}
        </div>

        <div className={styles.copyActions}>
          {activeTab === 'prompt' && (
            <Button
              size="sm"
              variant="primary"
              startIcon={<Icon name="check" />}
              onClick={() => handleCopy(aiPrompt, 'prompt')}
              data-testid="copy-ai-prompt-btn"
            >
              {t('common.studio.copyPrompt')}
            </Button>
          )}
          {activeTab === 'code' && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleCopy(jsxCode, 'jsx')}
                data-testid="copy-jsx-btn"
              >
                {t('common.studio.copyJsx')}
              </Button>
              {cssCode && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopy(cssCode, 'css')}
                  data-testid="copy-css-btn"
                >
                  {t('common.studio.copyCss')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div
        id={`${baseTabId}-panel-prompt`}
        role="tabpanel"
        aria-labelledby={`${baseTabId}-tab-prompt`}
        hidden={activeTab !== 'prompt'}
        className={cn(activeTab === 'prompt' && styles.tabPanel)}
      >
        {activeTab === 'prompt' && (
          <pre
            lang="en"
            dir="ltr"
            className={styles.codeBlock}
            data-testid="inspector-ai-prompt-code"
          >
            <code>{aiPrompt}</code>
          </pre>
        )}
      </div>

      <div
        id={`${baseTabId}-panel-code`}
        role="tabpanel"
        aria-labelledby={`${baseTabId}-tab-code`}
        hidden={activeTab !== 'code'}
        className={cn(activeTab === 'code' && styles.tabPanel)}
      >
        {activeTab === 'code' && (
          <>
            <div className={styles.codeSection}>
              <div className={styles.codeSectionHeader}>
                <span className={styles.codeFileLabel}>
                  <BidiText dir="ltr">{jsxFileName}</BidiText>
                </span>
              </div>
              <pre
                lang="en"
                dir="ltr"
                className={styles.codeBlock}
                data-testid="inspector-jsx-code"
              >
                <code>{jsxCode}</code>
              </pre>
            </div>

            <div className={styles.codeSection}>
              <div className={styles.codeSectionHeader}>
                <span className={styles.codeFileLabel}>
                  <BidiText dir="ltr">{cssFileName}</BidiText>
                </span>
              </div>
              <pre
                lang="en"
                dir="ltr"
                className={styles.codeBlock}
                data-testid="inspector-css-code"
              >
                <code>{cssCode ?? t('common.studio.noCustomCssNeeded')}</code>
              </pre>
            </div>
          </>
        )}
      </div>

      <div
        id={`${baseTabId}-panel-specs`}
        role="tabpanel"
        aria-labelledby={`${baseTabId}-tab-specs`}
        hidden={activeTab !== 'specs'}
        className={cn(activeTab === 'specs' && styles.tabPanel)}
      >
        {activeTab === 'specs' && (
          <div className={styles.specsGrid} data-testid="inspector-specs-grid">
            {specGroups.map((group) => (
              <div key={group.title} className={styles.specGroupCard}>
                <h3 className={styles.specGroupTitle}>{group.title}</h3>
                <dl className={styles.specList}>
                  {group.items.map((item) => (
                    <div key={item.label} className={styles.specRow}>
                      <dt className={styles.specTerm}>{item.label}</dt>
                      <dd className={styles.specValue}>
                        <BidiText dir="ltr">{item.value}</BidiText>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export interface GalleryHubProps {
  linkComponent?: StudioLinkComponent;
}

export function GalleryHub({ linkComponent }: GalleryHubProps) {
  const { t } = useI18n();
  const ContextLink = useGalleryLinkComponent();
  const LinkSlot = linkComponent ?? ContextLink ?? DefaultStudioAnchor;
  const featuredId = useId();

  const studioCards = [
    {
      title: t('common.studio.btnTitle'),
      desc: t('common.studio.buttonCardDesc'),
      href: '/gallery/button',
      icon: 'sliders' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.inputTitle'),
      desc: t('common.studio.inputCardDesc'),
      href: '/gallery/input',
      icon: 'search' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.comboboxTitle'),
      desc: t('common.studio.comboboxCardDesc'),
      href: '/gallery/combobox',
      icon: 'sliders' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.dlgTitle'),
      desc: t('common.studio.dialogCardDesc'),
      href: '/gallery/dialog',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.textareaTitle'),
      desc: t('common.studio.textareaCardDesc'),
      href: '/gallery/textarea',
      icon: 'align-left' as const,
      isStudio: false,
    },
    {
      title: t('common.studio.selectTitle'),
      desc: t('common.studio.selectCardDesc'),
      href: '/gallery/select',
      icon: 'chevron-down' as const,
      isStudio: false,
    },
    {
      title: t('common.studio.checkboxTitle'),
      desc: t('common.studio.checkboxCardDesc'),
      href: '/gallery/checkbox',
      icon: 'check' as const,
      isStudio: false,
    },
    {
      title: t('common.studio.radioTitle'),
      desc: t('common.studio.radioCardDesc'),
      href: '/gallery/radio',
      icon: 'bookmark' as const,
      isStudio: false,
    },
    {
      title: t('common.studio.switchTitle'),
      desc: t('common.studio.switchCardDesc'),
      href: '/gallery/switch',
      icon: 'sliders' as const,
      isStudio: false,
    },
    {
      title: t('common.studio.popoverTitle'),
      desc: t('common.studio.popoverCardDesc'),
      href: '/gallery/popover',
      icon: 'inbox' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.dropdownTitle'),
      desc: t('common.studio.dropdownCardDesc'),
      href: '/gallery/dropdown',
      icon: 'menu' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.tooltipTitle'),
      desc: t('common.studio.tooltipCardDesc'),
      href: '/gallery/tooltip',
      icon: 'bookmark' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.badgeTitle'),
      desc: t('common.studio.badgeCardDesc'),
      href: '/gallery/badge',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.avatarTitle'),
      desc: t('common.studio.avatarCardDesc'),
      href: '/gallery/avatar',
      icon: 'anonymous' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.cardTitle'),
      desc: t('common.studio.cardCardDesc'),
      href: '/gallery/card',
      icon: 'folder' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.tabsTitle'),
      desc: t('common.studio.tabsCardDesc'),
      href: '/gallery/tabs',
      icon: 'bookmark' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.accordionTitle'),
      desc: t('common.studio.accordionCardDesc'),
      href: '/gallery/accordion',
      icon: 'chevron-down' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.alertTitle'),
      desc: t('common.studio.alertCardDesc'),
      href: '/gallery/alert',
      icon: 'warning' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.alertDialogTitle'),
      desc: t('common.studio.alertDialogCardDesc'),
      href: '/gallery/alert-dialog',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.labelTitle'),
      desc: t('common.studio.labelCardDesc'),
      href: '/gallery/label',
      icon: 'sliders' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.separatorTitle'),
      desc: t('common.studio.separatorCardDesc'),
      href: '/gallery/separator',
      icon: 'sliders' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.spinnerTitle'),
      desc: t('common.studio.spinnerCardDesc'),
      href: '/gallery/spinner',
      icon: 'refresh' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.skeletonTitle'),
      desc: t('common.studio.skeletonCardDesc'),
      href: '/gallery/skeleton',
      icon: 'folder' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.breadcrumbTitle'),
      desc: t('common.studio.breadcrumbCardDesc'),
      href: '/gallery/breadcrumb',
      icon: 'chevron-down' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.statCardTitle'),
      desc: t('common.studio.statCardCardDesc'),
      href: '/gallery/stat-card',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.sheetTitle'),
      desc: t('common.studio.sheetCardDesc'),
      href: '/gallery/sheet',
      icon: 'sidebar' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.toastTitle'),
      desc: t('common.studio.toastCardDesc'),
      href: '/gallery/toast',
      icon: 'bell' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.paginationTitle'),
      desc: t('common.studio.paginationCardDesc'),
      href: '/gallery/pagination',
      icon: 'arrow-right' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.dataTableTitle'),
      desc: t('common.studio.dataTableCardDesc'),
      href: '/gallery/data-table',
      icon: 'sliders' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.progressTitle'),
      desc: t('common.studio.progressCardDesc'),
      href: '/gallery/progress',
      icon: 'task' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.commandPaletteTitle'),
      desc: t('common.studio.commandPaletteCardDesc'),
      href: '/gallery/command-palette',
      icon: 'search' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.emptyStateTitle'),
      desc: t('common.studio.emptyStateCardDesc'),
      href: '/gallery/empty-state',
      icon: 'folder' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.datePickerTitle'),
      desc: t('common.studio.datePickerCardDesc'),
      href: '/gallery/date-picker',
      icon: 'calendar' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.kbdTitle'),
      desc: t('common.studio.kbdCardDesc'),
      href: '/gallery/kbd',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.statusDotTitle'),
      desc: t('common.studio.statusDotCardDesc'),
      href: '/gallery/status-dot',
      icon: 'task' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.aspectRatioTitle'),
      desc: t('common.studio.aspectRatioCardDesc'),
      href: '/gallery/aspect-ratio',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.inputOtpTitle'),
      desc: t('common.studio.inputOtpCardDesc'),
      href: '/gallery/input-otp',
      icon: 'task' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.sliderTitle'),
      desc: t('common.studio.sliderCardDesc'),
      href: '/gallery/slider',
      icon: 'sliders' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.toggleTitle'),
      desc: t('common.studio.toggleCardDesc'),
      href: '/gallery/toggle',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.collapsibleTitle'),
      desc: t('common.studio.collapsibleCardDesc'),
      href: '/gallery/collapsible',
      icon: 'layers' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.stepperTitle'),
      desc: t('common.studio.stepperCardDesc'),
      href: '/gallery/stepper',
      icon: 'workflow' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.timelineTitle'),
      desc: t('common.studio.timelineCardDesc'),
      href: '/gallery/timeline',
      icon: 'clock' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.hoverCardTitle'),
      desc: t('common.studio.hoverCardCardDesc'),
      href: '/gallery/hover-card',
      icon: 'feature' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.contextMenuTitle'),
      desc: t('common.studio.contextMenuCardDesc'),
      href: '/gallery/context-menu',
      icon: 'menu' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.scrollAreaTitle'),
      desc: t('common.studio.scrollAreaCardDesc'),
      href: '/gallery/scroll-area',
      icon: 'sliders' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.resizablePanelTitle'),
      desc: t('common.studio.resizablePanelCardDesc'),
      href: '/gallery/resizable-panel',
      icon: 'layout-align-left' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.fileUploadTitle'),
      desc: t('common.studio.fileUploadCardDesc'),
      href: '/gallery/file-upload',
      icon: 'upload' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.filterBarTitle'),
      desc: t('common.studio.filterBarCardDesc'),
      href: '/gallery/filter-bar',
      icon: 'search' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.treeViewTitle'),
      desc: t('common.studio.treeViewCardDesc'),
      href: '/gallery/tree-view',
      icon: 'folder' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.navigationMenuTitle'),
      desc: t('common.studio.navigationMenuCardDesc'),
      href: '/gallery/navigation-menu',
      icon: 'menu' as const,
      isStudio: true,
    },
    {
      title: t('common.studio.chartTitle'),
      desc: t('common.studio.chartCardDesc'),
      href: '/gallery/chart',
      icon: 'dashboard' as const,
      isStudio: true,
    },
  ];

  return (
    <main className={styles.studioMain} data-testid="gallery-hub">
      <header className={styles.studioHeader}>
        <div className={styles.headerTopRow}>
          <div className={styles.titleGroup}>
            <p className={styles.eyebrow} data-role="eyebrow">
              {t('common.studio.eyebrow')}
            </p>
            <h1 className={styles.pageTitle}>{t('common.studio.hubTitle')}</h1>
            <p className={styles.pageSubtitle}>{t('common.studio.hubSubtitle')}</p>
          </div>
          <div className={styles.headerActions}>
            <LanguageSwitcher size="sm" />
            <ThemeSwitcher size="sm" />
          </div>
        </div>
      </header>

      <section aria-labelledby={featuredId} className={styles.hubGrid}>
        <h2 id={featuredId} className="sr-only">
          {t('common.studio.badgeInteractiveStudio')}
        </h2>

        {studioCards.map((card) => (
          <div key={card.href} className={styles.hubCard}>
            <div className={styles.hubCardTop}>
              <div className={styles.hubCardTitleRow}>
                <h3 className={styles.hubCardTitle}>{card.title}</h3>
                <span className={cn(styles.studioPill, !card.isStudio && styles.galleryPill)}>
                  {card.isStudio
                    ? t('common.studio.badgeInteractiveStudio')
                    : t('common.studio.badgePrimitiveGallery')}
                </span>
              </div>
              <p className={styles.hubCardDesc}>{card.desc}</p>
            </div>
            <LinkSlot href={card.href} className={styles.hubLinkBtn}>
              <span>
                {card.isStudio ? t('common.studio.openStudio') : t('common.studio.openGallery')}
              </span>
              <Icon name="arrow-right" />
            </LinkSlot>
          </div>
        ))}
      </section>
    </main>
  );
}
