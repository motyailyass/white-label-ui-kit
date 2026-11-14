'use client';

import { useCallback, useMemo, useState } from 'react';
import type { IconName } from '@/components/icons';
import { TreeNode, TreeView } from '@/components/ui';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './tree-view-gallery.module.css';

export type TreeScenarioPreset = 'project' | 'security' | 'outline';

export interface TreeViewGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface TreeItemSpec {
  id: string;
  labelEn: string;
  labelAr?: string;
  icon?: IconName;
  metaEn?: string;
  metaAr?: string;
  disabled?: boolean;
  children?: TreeItemSpec[];
}

interface ScenarioConfig {
  titleEn: string;
  titleAr: string;
  defaultSelectedId: string;
  defaultExpandedIds: string[];
  allBranchIds: string[];
  nodes: TreeItemSpec[];
}

const SCENARIOS: Record<TreeScenarioPreset, ScenarioConfig> = {
  project: {
    titleEn: 'Project Explorer',
    titleAr: 'مستكشف ملفات المشروع',
    defaultSelectedId: 'app',
    defaultExpandedIds: ['src', 'components'],
    allBranchIds: ['src', 'app', 'components', 'ui', 'public'],
    nodes: [
      {
        id: 'src',
        labelEn: 'src',
        labelAr: 'src (المصدر)',
        icon: 'folder',
        metaEn: '2 dirs',
        metaAr: 'مجلدان',
        children: [
          {
            id: 'app',
            labelEn: 'app',
            labelAr: 'app (التطبيق)',
            icon: 'folder',
            metaEn: '2 files',
            metaAr: 'ملفان',
            children: [
              {
                id: 'layout',
                labelEn: 'layout.tsx',
                icon: 'attachment',
                metaEn: '4.2 KB',
              },
              {
                id: 'page',
                labelEn: 'page.tsx',
                icon: 'attachment',
                metaEn: '6.8 KB',
              },
            ],
          },
          {
            id: 'components',
            labelEn: 'components',
            labelAr: 'components (المكونات)',
            icon: 'folder',
            metaEn: '2 dirs',
            metaAr: 'مجلدان',
            children: [
              {
                id: 'ui',
                labelEn: 'ui',
                labelAr: 'ui (الأساسيات)',
                icon: 'folder',
                metaEn: '2 files',
                metaAr: 'ملفان',
                children: [
                  {
                    id: 'button',
                    labelEn: 'button.tsx',
                    icon: 'attachment',
                    metaEn: '3.1 KB',
                  },
                  {
                    id: 'tree-view',
                    labelEn: 'tree-view.tsx',
                    icon: 'attachment',
                    metaEn: '5.4 KB',
                  },
                ],
              },
              {
                id: 'patterns',
                labelEn: 'patterns',
                labelAr: 'patterns (الأنماط)',
                icon: 'folder',
                metaEn: '12 items',
                metaAr: '12 عنصر',
              },
            ],
          },
        ],
      },
      {
        id: 'public',
        labelEn: 'public',
        labelAr: 'public (العام)',
        icon: 'folder',
        metaEn: '1 file',
        metaAr: 'ملف واحد',
        children: [
          {
            id: 'favicon',
            labelEn: 'favicon.ico',
            icon: 'image',
            metaEn: '1.2 KB',
          },
        ],
      },
      {
        id: 'package',
        labelEn: 'package.json',
        icon: 'attachment',
        metaEn: '2.1 KB',
      },
      {
        id: 'archive',
        labelEn: 'archived-files (locked)',
        labelAr: 'ملفات مؤرشفة (مقفل)',
        icon: 'folder',
        disabled: true,
      },
    ],
  },
  security: {
    titleEn: 'Security & Access Hierarchy',
    titleAr: 'هرمية الأمان والصلاحيات',
    defaultSelectedId: '2fa',
    defaultExpandedIds: ['security'],
    allBranchIds: ['security', 'roles'],
    nodes: [
      {
        id: 'account',
        labelEn: 'Account Details',
        labelAr: 'تفاصيل الحساب',
        icon: 'user',
        metaEn: 'Verified',
        metaAr: 'موثق',
      },
      {
        id: 'security',
        labelEn: 'Security & Access',
        labelAr: 'الأمان والتحكم بالوصول',
        icon: 'settings',
        metaEn: '2 policies',
        metaAr: 'سياستان',
        children: [
          {
            id: '2fa',
            labelEn: 'Two-Factor Authentication',
            labelAr: 'المصادقة الثنائية (2FA)',
            icon: 'check-circle',
            metaEn: 'Enabled',
            metaAr: 'مفعل',
          },
          {
            id: 'keys',
            labelEn: 'API Keys & Tokens',
            labelAr: 'مفاتيح ورموز API',
            icon: 'api',
            metaEn: '3 active',
            metaAr: '3 نشطة',
          },
        ],
      },
      {
        id: 'roles',
        labelEn: 'Organization Roles',
        labelAr: 'أدوار المؤسسة',
        icon: 'user-group-03',
        metaEn: '2 groups',
        metaAr: 'مجموعتان',
        children: [
          {
            id: 'admins',
            labelEn: 'Workspace Admins',
            labelAr: 'مديرو مساحة العمل',
            icon: 'building',
            metaEn: '4 members',
            metaAr: '4 أعضاء',
          },
          {
            id: 'auditors',
            labelEn: 'Compliance Auditors',
            labelAr: 'مدققو الامتثال',
            icon: 'task',
            metaEn: 'Read-only',
            metaAr: 'قراءة فقط',
          },
        ],
      },
      {
        id: 'notifications',
        labelEn: 'Alert Subscriptions',
        labelAr: 'اشتراكات التنبيهات',
        icon: 'bell',
      },
    ],
  },
  outline: {
    titleEn: 'Architecture Specification Outline',
    titleAr: 'مخطط مواصفات البنية المعمارية',
    defaultSelectedId: 'intro-scope',
    defaultExpandedIds: ['intro', 'arch'],
    allBranchIds: ['intro', 'arch'],
    nodes: [
      {
        id: 'intro',
        labelEn: '1. Introduction',
        labelAr: '1. المقدمة العامة',
        icon: 'folder',
        metaEn: 'Sec 1',
        metaAr: 'قسم 1',
        children: [
          {
            id: 'intro-bg',
            labelEn: '1.1 Background & Context',
            labelAr: '1.1 الخلفية والسياق',
            icon: 'attachment',
          },
          {
            id: 'intro-scope',
            labelEn: '1.2 System Scope',
            labelAr: '1.2 نطاق النظام',
            icon: 'attachment',
          },
        ],
      },
      {
        id: 'arch',
        labelEn: '2. Architecture Tiers',
        labelAr: '2. طبقات البنية المعمارية',
        icon: 'folder',
        metaEn: 'Sec 2',
        metaAr: 'قسم 2',
        children: [
          {
            id: 'arch-layers',
            labelEn: '2.1 Layer Boundaries',
            labelAr: '2.1 حدود الطبقات',
            icon: 'attachment',
          },
          {
            id: 'arch-tokens',
            labelEn: '2.2 Token Contracts',
            labelAr: '2.2 عقود الرموز التصميمية',
            icon: 'attachment',
          },
        ],
      },
      {
        id: 'disabled-spec',
        labelEn: '3. Draft Appendix (Locked)',
        labelAr: '3. ملحق مسودة (مقفل)',
        icon: 'folder',
        disabled: true,
      },
    ],
  },
};

function renderTreeNodes(nodes: TreeItemSpec[], isRtl: boolean) {
  return nodes.map((node) => (
    <TreeNode
      key={node.id}
      id={node.id}
      label={isRtl ? (node.labelAr ?? node.labelEn) : node.labelEn}
      icon={node.icon}
      meta={isRtl ? (node.metaAr ?? node.metaEn) : node.metaEn}
      disabled={node.disabled}
      data-testid={`tree-node-${node.id}`}
    >
      {node.children ? renderTreeNodes(node.children, isRtl) : undefined}
    </TreeNode>
  ));
}

export function TreeViewGallery({ linkComponent }: TreeViewGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [scenario, setScenario] = useState<TreeScenarioPreset>('project');
  const [selectedId, setSelectedId] = useState<string>('app');
  const [expandedIds, setExpandedIds] = useState<string[]>(['src', 'components']);
  const [disabled, setDisabled] = useState<boolean>(false);

  const isRtl = specimenDir === 'rtl';
  const activeScenario = SCENARIOS[scenario];
  const isAllExpanded = activeScenario.allBranchIds.every((id) => expandedIds.includes(id));

  const handleScenarioChange = useCallback((nextScenario: TreeScenarioPreset) => {
    const cfg = SCENARIOS[nextScenario];
    setScenario(nextScenario);
    setSelectedId(cfg.defaultSelectedId);
    setExpandedIds(cfg.defaultExpandedIds);
  }, []);

  const handleExpandAllChange = useCallback(
    (expandAll: boolean) => {
      setExpandedIds(expandAll ? activeScenario.allBranchIds : []);
    },
    [activeScenario.allBranchIds],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setScenario('project');
    setSelectedId(SCENARIOS.project.defaultSelectedId);
    setExpandedIds(SCENARIOS.project.defaultExpandedIds);
    setDisabled(false);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const scenarioOptions: StudioSegmentedOption<TreeScenarioPreset>[] = [
    { value: 'project', label: 'Project Files' },
    { value: 'security', label: 'Access Tree' },
    { value: 'outline', label: 'Doc Outline' },
  ];

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Scenario', value: scenario },
          { label: 'Selected Node', value: selectedId },
          { label: 'Expanded Branches', value: `${expandedIds.length} open` },
          { label: 'Disabled', value: disabled ? 'true' : 'false' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'WAI-ARIA & Keyboard Navigation',
        items: [
          { label: 'Tree Roles', value: 'role="tree" / role="treeitem" / role="group"' },
          { label: 'Vertical Traversal', value: 'ArrowDown / ArrowUp / Home / End' },
          { label: 'Branch Traversal', value: 'ArrowRight / ArrowLeft (mirrors in RTL)' },
          { label: 'Roving Focus', value: 'Active node tabIndex={0}' },
        ],
      },
    ],
    [scenario, selectedId, expandedIds.length, disabled, specimenDir],
  );

  const jsxSnippet = useMemo(() => {
    return `<TreeView
  selectedId="${selectedId}"
  onSelect={setSelectedId}
  expandedIds={${JSON.stringify(expandedIds)}}
  onExpandedChange={setExpandedIds}${disabled ? '\n  disabled' : ''}
  aria-label="${isRtl ? activeScenario.titleAr : activeScenario.titleEn}"
>
  <TreeNode id="src" label="src" icon="folder" meta="2 dirs">
    <TreeNode id="app" label="app" icon="folder" meta="2 files">
      <TreeNode id="layout" label="layout.tsx" icon="attachment" meta="4.2 KB" />
      <TreeNode id="page" label="page.tsx" icon="attachment" meta="6.8 KB" />
    </TreeNode>
  </TreeNode>
</TreeView>`;
  }, [selectedId, expandedIds, disabled, isRtl, activeScenario]);

  const aiPrompt = useMemo(() => {
    return `Generate an accessible React TreeView component using White-Label UI Kit:
- Scenario: ${activeScenario.titleEn}
- WAI-ARIA tree navigation (role="tree", role="treeitem", role="group", aria-expanded, aria-selected)
- Full keyboard traversal: ArrowDown, ArrowUp, Home, End, and RTL-aware ArrowRight/ArrowLeft
- Support nested branches, leaf items, typed IconName slots, and trailing meta badges
- Direction: ${specimenDir.toUpperCase()}`;
  }, [activeScenario.titleEn, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.treeViewScenario')}
        value={scenario}
        options={scenarioOptions}
        onChange={handleScenarioChange}
      />

      <StudioToggleRow
        label={t('common.studio.treeViewExpandAll')}
        checked={isAllExpanded}
        onCheckedChange={handleExpandAllChange}
        testId="toggle-tree-expand-all"
      />

      <StudioToggleRow
        label={t('common.studio.fileUploadDisabled')}
        checked={disabled}
        onCheckedChange={setDisabled}
        testId="toggle-tree-disabled"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="tree-view"
      title={t('common.studio.treeViewTitle')}
      subtitle={t('common.studio.treeViewSubtitle')}
      testId="gallery-tree-view"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="tree-view.module.css"
          jsxFileName="tree-view.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <div className={styles.specimenHeader}>
            <span className={styles.headerTitle}>
              {isRtl ? activeScenario.titleAr : activeScenario.titleEn}
            </span>
          </div>

          <TreeView
            selectedId={selectedId}
            onSelect={setSelectedId}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            disabled={disabled}
            aria-label={isRtl ? activeScenario.titleAr : activeScenario.titleEn}
            data-testid="interactive-tree-view"
          >
            {renderTreeNodes(activeScenario.nodes, isRtl)}
          </TreeView>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
