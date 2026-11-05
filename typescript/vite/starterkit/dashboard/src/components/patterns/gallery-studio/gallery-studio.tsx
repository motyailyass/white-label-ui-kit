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
import styles from './gallery-studio.module.css';

export type StudioRouteId =
  | 'hub'
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
  | 'tooltip';

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

export type StudioRadiusPreset = 'preset' | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

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
  linkComponent: LinkSlot = DefaultStudioAnchor,
  stageFooter,
  controls,
  inspector,
  children,
}: GalleryStudioLayoutProps) {
  const { t } = useI18n();

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
            <Button
              size="sm"
              variant="secondary"
              onClick={onReset}
              data-testid="studio-reset-btn"
            >
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
                <Icon name="home" />
                <span>{t('common.studio.navOverview')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/button"
                className={styles.navLink}
                aria-current={activeRoute === 'button' ? 'page' : undefined}
              >
                <Icon name="sliders" />
                <span>{t('common.studio.navButton')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/input"
                className={styles.navLink}
                aria-current={activeRoute === 'input' ? 'page' : undefined}
              >
                <Icon name="search" />
                <span>{t('common.studio.compInput')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/combobox"
                className={styles.navLink}
                aria-current={activeRoute === 'combobox' ? 'page' : undefined}
              >
                <Icon name="sliders" />
                <span>{t('common.studio.compCombobox')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/textarea"
                className={styles.navLink}
                aria-current={activeRoute === 'textarea' ? 'page' : undefined}
              >
                <Icon name="align-left" />
                <span>{t('common.studio.compTextarea')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/select"
                className={styles.navLink}
                aria-current={activeRoute === 'select' ? 'page' : undefined}
              >
                <Icon name="chevron-down" />
                <span>{t('common.studio.compSelect')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/checkbox"
                className={styles.navLink}
                aria-current={activeRoute === 'checkbox' ? 'page' : undefined}
              >
                <Icon name="check" />
                <span>{t('common.studio.compCheckbox')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/radio"
                className={styles.navLink}
                aria-current={activeRoute === 'radio' ? 'page' : undefined}
              >
                <Icon name="bookmark" />
                <span>{t('common.studio.compRadio')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/switch"
                className={styles.navLink}
                aria-current={activeRoute === 'switch' ? 'page' : undefined}
              >
                <Icon name="sliders" />
                <span>{t('common.studio.compSwitch')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/dialog"
                className={styles.navLink}
                aria-current={activeRoute === 'dialog' ? 'page' : undefined}
              >
                <Icon name="feature" />
                <span>{t('common.studio.navDialog')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/popover"
                className={styles.navLink}
                aria-current={activeRoute === 'popover' ? 'page' : undefined}
              >
                <Icon name="inbox" />
                <span>{t('common.studio.compPopover')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/dropdown"
                className={styles.navLink}
                aria-current={activeRoute === 'dropdown' ? 'page' : undefined}
              >
                <Icon name="menu" />
                <span>{t('common.studio.compDropdown')}</span>
              </LinkSlot>
            </li>
            <li>
              <LinkSlot
                href="/gallery/tooltip"
                className={styles.navLink}
                aria-current={activeRoute === 'tooltip' ? 'page' : undefined}
              >
                <Icon name="bookmark" />
                <span>{t('common.studio.compTooltip')}</span>
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

          <div className={styles.controlsBody}>
            {controls}
          </div>
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
}

export function StudioSegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: StudioSegmentedControlProps<T>) {
  const labelId = useId();
  return (
    <div className={styles.controlGroup}>
      <span id={labelId} className={styles.controlLabel}>
        {label}
      </span>
      <div role="group" aria-labelledby={labelId} className={styles.segmentedGroup}>
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

export function StudioToggleRow({
  label,
  checked,
  onCheckedChange,
  testId,
}: StudioToggleRowProps) {
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

export function GalleryHub({ linkComponent: LinkSlot = DefaultStudioAnchor }: GalleryHubProps) {
  const { t } = useI18n();
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
      isStudio: false,
    },
    {
      title: t('common.studio.dropdownTitle'),
      desc: t('common.studio.dropdownCardDesc'),
      href: '/gallery/dropdown',
      icon: 'menu' as const,
      isStudio: false,
    },
    {
      title: t('common.studio.tooltipTitle'),
      desc: t('common.studio.tooltipCardDesc'),
      href: '/gallery/tooltip',
      icon: 'bookmark' as const,
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
                <span
                  className={cn(
                    styles.studioPill,
                    !card.isStudio && styles.galleryPill,
                  )}
                >
                  {card.isStudio
                    ? t('common.studio.badgeInteractiveStudio')
                    : t('common.studio.badgePrimitiveGallery')}
                </span>
              </div>
              <p className={styles.hubCardDesc}>{card.desc}</p>
            </div>
            <LinkSlot href={card.href} className={styles.hubLinkBtn}>
              <span>
                {card.isStudio
                  ? t('common.studio.openStudio')
                  : t('common.studio.openGallery')}
              </span>
              <Icon name="arrow-right" />
            </LinkSlot>
          </div>
        ))}
      </section>
    </main>
  );
}
