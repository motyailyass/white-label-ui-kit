'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  FileUpload,
  FileUploadDropzone,
  type FileUploadDropzoneVariant,
  type FileUploadItemMeta,
  FileUploadList,
} from '@/components/ui';
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
import styles from './file-upload-gallery.module.css';

export type UploadQueuePreset = 'mixed' | 'uploading' | 'completed' | 'error';

export interface FileUploadGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface QueuePresetBundle {
  files: File[];
  meta: Record<string, FileUploadItemMeta>;
}

function buildQueuePreset(
  preset: UploadQueuePreset,
  isRtl: boolean,
  multiple: boolean,
): QueuePresetBundle {
  const diagramName = isRtl ? 'مخطط_البنية_التحتية.png' : 'infrastructure_diagram.png';
  const reportName = isRtl ? 'تقرير_التدقيق_الأمني.pdf' : 'security_audit_report.pdf';
  const snapshotName = isRtl ? 'نسخة_قاعدة_البيانات.sql' : 'database_snapshot_raw.sql';

  const diagramFile = new File(['PNG binary image buffer'], diagramName, {
    type: 'image/png',
  });
  const reportFile = new File(['%PDF-1.7 audit report binary stream'], reportName, {
    type: 'application/pdf',
  });
  const snapshotFile = new File(['SQL dump stream'], snapshotName, {
    type: 'application/sql',
  });

  const completedLabel = isRtl ? 'تم الرفع بنجاح!' : 'Upload Successful!';
  const failedError = isRtl
    ? 'فشل الرفع! يرجى المحاولة مرة أخرى.'
    : 'Upload failed! Please try again.';

  let files: File[];
  let meta: Record<string, FileUploadItemMeta>;

  if (preset === 'uploading') {
    files = [diagramFile, reportFile];
    meta = {
      [diagramName]: {
        status: 'uploading',
        progress: 52,
        displaySize: 1_887_436,
      },
      [reportName]: {
        status: 'uploading',
        progress: 78,
        displaySize: 2_516_582,
      },
    };
  } else if (preset === 'completed') {
    files = [reportFile, diagramFile];
    meta = {
      [reportName]: {
        status: 'completed',
        progress: 100,
        displaySize: 2_516_582,
        statusLabel: completedLabel,
      },
      [diagramName]: {
        status: 'completed',
        progress: 100,
        displaySize: 1_887_436,
        statusLabel: completedLabel,
      },
    };
  } else if (preset === 'error') {
    files = [snapshotFile, diagramFile];
    meta = {
      [snapshotName]: {
        status: 'error',
        progress: 56,
        displaySize: 14_889_779,
        error: failedError,
      },
      [diagramName]: {
        status: 'error',
        progress: 35,
        displaySize: 1_887_436,
        error: failedError,
      },
    };
  } else {
    files = [diagramFile, reportFile, snapshotFile];
    meta = {
      [diagramName]: {
        status: 'uploading',
        progress: 52,
        displaySize: 1_887_436,
      },
      [reportName]: {
        status: 'completed',
        progress: 100,
        displaySize: 2_516_582,
        statusLabel: completedLabel,
      },
      [snapshotName]: {
        status: 'error',
        progress: 56,
        displaySize: 14_889_779,
        error: failedError,
      },
    };
  }

  const slicedFiles = multiple ? files : files.slice(0, 1);
  return { files: slicedFiles, meta };
}

export function FileUploadGallery({ linkComponent }: FileUploadGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [dropzoneVariant, setDropzoneVariant] = useState<FileUploadDropzoneVariant>('dropzone');
  const [queuePreset, setQueuePreset] = useState<UploadQueuePreset>('mixed');
  const [multiple, setMultiple] = useState<boolean>(true);
  const [disabled, setDisabled] = useState<boolean>(false);

  const initialBundle = useMemo(() => buildQueuePreset('mixed', false, true), []);
  const [stagedFiles, setStagedFiles] = useState<File[]>(initialBundle.files);
  const [itemMeta, setItemMeta] = useState<Record<string, FileUploadItemMeta>>(initialBundle.meta);

  const isRtl = specimenDir === 'rtl';

  const applyPreset = useCallback(
    (nextPreset: UploadQueuePreset, nextIsRtl: boolean, nextMultiple: boolean) => {
      const bundle = buildQueuePreset(nextPreset, nextIsRtl, nextMultiple);
      setStagedFiles(bundle.files);
      setItemMeta(bundle.meta);
    },
    [],
  );

  const handleDirChange = useCallback(
    (nextDir: 'ltr' | 'rtl') => {
      setSpecimenDir(nextDir);
      applyPreset(queuePreset, nextDir === 'rtl', multiple);
    },
    [applyPreset, multiple, queuePreset],
  );

  const handleQueuePresetChange = useCallback(
    (nextPreset: UploadQueuePreset) => {
      setQueuePreset(nextPreset);
      applyPreset(nextPreset, isRtl, multiple);
    },
    [applyPreset, isRtl, multiple],
  );

  const handleMultipleChange = useCallback(
    (nextMultiple: boolean) => {
      setMultiple(nextMultiple);
      applyPreset(queuePreset, isRtl, nextMultiple);
    },
    [applyPreset, isRtl, queuePreset],
  );

  const handleFilesChange = useCallback(
    (nextFiles: File[]) => {
      setStagedFiles(nextFiles);
      setItemMeta((prev) => {
        const updated = { ...prev };
        for (const file of nextFiles) {
          if (!updated[file.name]) {
            updated[file.name] = {
              status: 'completed',
              progress: 100,
              statusLabel: isRtl ? 'تم الرفع بنجاح!' : 'Upload Successful!',
            };
          }
        }
        return updated;
      });
    },
    [isRtl],
  );

  const handleRetryFile = useCallback(
    (file: File) => {
      setItemMeta((prev) => ({
        ...prev,
        [file.name]: {
          ...prev[file.name],
          status: 'completed',
          progress: 100,
          statusLabel: isRtl ? 'تم الرفع بنجاح!' : 'Upload Successful!',
          error: undefined,
        },
      }));
    },
    [isRtl],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setDropzoneVariant('dropzone');
    setQueuePreset('mixed');
    setMultiple(true);
    setDisabled(false);
    applyPreset('mixed', false, true);
  }, [applyPreset]);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const variantOptions: StudioSegmentedOption<FileUploadDropzoneVariant>[] = [
    { value: 'dropzone', label: 'Standard Dropzone' },
    { value: 'compact', label: 'Compact Inline' },
  ];

  const queueOptions: StudioSegmentedOption<UploadQueuePreset>[] = [
    { value: 'mixed', label: 'Mixed Queue' },
    { value: 'uploading', label: 'Uploading' },
    { value: 'completed', label: 'Completed' },
    { value: 'error', label: 'Failed' },
  ];

  const hintText = isRtl
    ? 'ملفات PDF أو صور (PNG، JPG، WebP) أو قواعد بيانات بحد أقصى 10 ميجابايت'
    : 'PDF, images (PNG, JPG, WebP), or SQL dumps up to 10 MB';

  const jsxSnippet = useMemo(() => {
    const variantAttr = dropzoneVariant === 'compact' ? '\n    variant="compact"' : '';
    return `<FileUpload
  accept="image/*,application/pdf,.sql"
  maxSize={10 * 1024 * 1024}${multiple ? '\n  multiple' : '\n  multiple={false}'}${disabled ? '\n  disabled' : ''}
  value={files}
  onFilesChange={setFiles}
>
  <FileUploadDropzone${variantAttr}
    dropzoneTitle={t('upload.title')}
    hint="${hintText}"
    actionLabel={t('upload.browse')}
  />
  <FileUploadList
    itemMeta={itemMeta}
    onRetry={handleRetryFile}
    retryLabel={t('upload.retry')}
    retryAriaLabel={(name) => t('upload.retryFile', { name })}
    removeAriaLabel={(name) => t('upload.removeFile', { name })}
  />
</FileUpload>`;
  }, [dropzoneVariant, multiple, disabled, hintText]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible file upload component with status and progress tracking using White-Label UI Kit:
- Dropzone Variant: ${dropzoneVariant}
- Queue State: ${queuePreset} (uploading with progress bar, completed 100%, error alert with Try Again action)
- Multiple: ${multiple ? 'true' : 'false'}
- Disabled: ${disabled ? 'true' : 'false'}
- Direction: ${specimenDir.toUpperCase()}
- Compound components: FileUpload, FileUploadDropzone, FileUploadList`;
  }, [dropzoneVariant, queuePreset, multiple, disabled, specimenDir]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Dropzone Variant', value: dropzoneVariant },
          { label: 'Queue State', value: queuePreset },
          { label: 'Staged Files', value: `${stagedFiles.length} file(s)` },
          { label: 'Multiple', value: multiple ? 'true' : 'false' },
          { label: 'Disabled', value: disabled ? 'true' : 'false' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & Motion',
        items: [
          { label: 'Dropzone Role', value: 'role="button" tabIndex={0}' },
          { label: 'Progress Track', value: 'role="progressbar" transform: translateX()' },
          { label: 'Error Feedback', value: 'role="alert" + Try Again action' },
        ],
      },
    ];
  }, [dropzoneVariant, queuePreset, stagedFiles.length, multiple, disabled, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={handleDirChange}
      />

      <StudioSegmentedControl
        label={t('common.studio.fileUploadDropzoneVariant')}
        value={dropzoneVariant}
        options={variantOptions}
        onChange={setDropzoneVariant}
      />

      <StudioSegmentedControl
        label={t('common.studio.fileUploadQueueState')}
        value={queuePreset}
        options={queueOptions}
        onChange={handleQueuePresetChange}
      />

      <StudioToggleRow
        label={t('common.studio.fileUploadMultiple')}
        checked={multiple}
        onCheckedChange={handleMultipleChange}
        testId="toggle-file-multiple"
      />

      <StudioToggleRow
        label={t('common.studio.fileUploadDisabled')}
        checked={disabled}
        onCheckedChange={setDisabled}
        testId="toggle-file-disabled"
      />
    </>
  );

  const dropzoneTitleNode = isRtl ? (
    <>
      <span className={styles.triggerLink}>اختر الملفات</span> أو اسحبها وأفلتها هنا
    </>
  ) : (
    <>
      <span className={styles.triggerLink}>Upload files</span> or drag and drop
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="file-upload"
      title={t('common.studio.fileUploadTitle')}
      subtitle={t('common.studio.fileUploadSubtitle')}
      testId="gallery-file-upload"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="file-upload.module.css"
          jsxFileName="file-upload.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <div className={styles.specimenHeader}>
            <span className={styles.headerTitle}>
              {isRtl ? 'الملفات والمستندات المجهزة للرفع' : 'Staged Documents'}
            </span>
            <span className={styles.headerMeta}>
              {isRtl
                ? `تم اختيار ${stagedFiles.length} ملف(ات)`
                : `${stagedFiles.length} item(s) in queue`}
            </span>
          </div>

          <FileUpload
            value={stagedFiles}
            onFilesChange={handleFilesChange}
            multiple={multiple}
            disabled={disabled}
            accept="image/*,application/pdf,.sql"
            maxSize={10 * 1024 * 1024}
            data-testid="interactive-file-upload"
          >
            <FileUploadDropzone
              variant={dropzoneVariant}
              dropzoneTitle={dropzoneTitleNode}
              hint={hintText}
              actionLabel={isRtl ? 'تصفح الملفات' : 'Browse files'}
              data-testid="interactive-file-dropzone"
            />
            <FileUploadList
              itemMeta={itemMeta}
              onRetry={handleRetryFile}
              retryLabel={isRtl ? 'إعادة المحاولة' : 'Try Again'}
              retryAriaLabel={(name) => (isRtl ? `إعادة محاولة رفع ${name}` : `Retry ${name}`)}
              removeAriaLabel={(name) => (isRtl ? `إزالة ${name}` : `Remove ${name}`)}
              data-testid="interactive-file-list"
            />
          </FileUpload>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}
