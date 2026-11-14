'use client';

import {
  type CSSProperties,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import styles from './file-upload.module.css';

export type FileUploadStatus = 'idle' | 'uploading' | 'completed' | 'error';
export type FileUploadDropzoneVariant = 'dropzone' | 'compact';

export interface FileUploadItemMeta {
  status?: FileUploadStatus;
  progress?: number;
  error?: string;
  statusLabel?: string;
  displaySize?: number;
}

type UploadProgressCSSProperties = CSSProperties & {
  '--_upload-progress-scale'?: string;
};

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const fileName = file.name.toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  return tokens.some((token) => {
    if (token === '*/*') return true;
    if (token.startsWith('.')) {
      return fileName.endsWith(token);
    }
    if (token.endsWith('/*')) {
      const baseType = token.slice(0, -1);
      return fileType.startsWith(baseType);
    }
    return fileType === token;
  });
}

interface FileUploadContextValue {
  files: File[];
  addFiles: (incoming: FileList | File[]) => void;
  removeFile: (index: number) => void;
  openFileDialog: () => void;
  disabled: boolean;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

function useFileUploadContext() {
  const ctx = useContext(FileUploadContext);
  if (!ctx) {
    throw new Error('FileUpload compound components must be rendered inside <FileUpload>');
  }
  return ctx;
}

export interface FileUploadProps extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'> {
  value?: File[];
  defaultValue?: File[];
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  'data-testid'?: string;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    value: controlledFiles,
    defaultValue = [],
    onFilesChange,
    accept,
    multiple = true,
    maxSize,
    maxFiles,
    disabled = false,
    children,
    className,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const isControlled = controlledFiles !== undefined;
  const [uncontrolledFiles, setUncontrolledFiles] = useState<File[]>(defaultValue);
  const files = isControlled ? controlledFiles : uncontrolledFiles;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const updateFiles = useCallback(
    (newFiles: File[]) => {
      if (!isControlled) {
        setUncontrolledFiles(newFiles);
      }
      onFilesChange?.(newFiles);
    },
    [isControlled, onFilesChange],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (disabled) return;
      const fileArray = Array.from(incoming);

      const validFiles = fileArray.filter((file) => {
        if (maxSize && file.size > maxSize) return false;
        if (!matchesAccept(file, accept)) return false;
        return true;
      });

      const merged = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1);
      const capped = maxFiles ? merged.slice(0, maxFiles) : merged;
      updateFiles(capped);
    },
    [accept, disabled, files, maxFiles, maxSize, multiple, updateFiles],
  );

  const removeFile = useCallback(
    (indexToRemove: number) => {
      if (disabled) return;
      const updated = files.filter((_, idx) => idx !== indexToRemove);
      updateFiles(updated);
    },
    [disabled, files, updateFiles],
  );

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const contextValue = useMemo<FileUploadContextValue>(
    () => ({
      files,
      addFiles,
      removeFile,
      openFileDialog,
      disabled,
      isDragging,
      setIsDragging,
    }),
    [files, addFiles, removeFile, openFileDialog, disabled, isDragging],
  );

  return (
    <FileUploadContext.Provider value={contextValue}>
      <div ref={ref} className={cn(styles.root, className)} data-testid={testId} {...rest}>
        <input
          ref={inputRef}
          type="file"
          tabIndex={-1}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className={styles.hiddenInput}
          onChange={handleInputChange}
          aria-hidden="true"
        />
        {children}
      </div>
    </FileUploadContext.Provider>
  );
});

FileUpload.displayName = 'FileUpload';

interface FileUploadDropzoneBaseProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  variant?: FileUploadDropzoneVariant;
  icon?: ReactNode;
  /** Optional supporting copy rendered under the title. Nothing is rendered when omitted. */
  hint?: ReactNode;
  /** Optional trailing action pill (compact variant). Nothing is rendered when omitted. */
  actionLabel?: ReactNode;
  'data-testid'?: string;
}

/**
 * The dropzone is a `role="button"`, so it needs visible content that names it:
 * either a localized `dropzoneTitle` or fully custom `children`.
 */
export type FileUploadDropzoneProps = FileUploadDropzoneBaseProps &
  (
    | { children: ReactNode; dropzoneTitle?: ReactNode }
    | { children?: undefined; dropzoneTitle: ReactNode }
  );

export const FileUploadDropzone = forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzone(
    {
      variant = 'dropzone',
      children,
      icon,
      dropzoneTitle,
      hint,
      actionLabel,
      className,
      onDragOver,
      onDragLeave,
      onDrop,
      onClick,
      onKeyDown,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const { isDragging, setIsDragging, addFiles, openFileDialog, disabled } =
      useFileUploadContext();

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      onDragOver?.(e);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      onDragLeave?.(e);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
      onDrop?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      openFileDialog();
      onClick?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFileDialog();
      }
      onKeyDown?.(e);
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled ? 'true' : undefined}
        data-variant={variant}
        data-dragging={isDragging ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        className={cn(
          styles.dropzone,
          variant === 'compact' ? styles.dropzone_compact : styles.dropzone_dropzone,
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-testid={testId}
        {...rest}
      >
        {children ??
          (variant === 'compact' ? (
            <>
              <div className={styles.compactStart}>
                <span className={styles.dropzoneIconBadge} aria-hidden="true">
                  {icon ?? <Icon name="upload" size={18} />}
                </span>
                <div className={styles.compactTextGroup}>
                  <span className={styles.triggerText}>{dropzoneTitle}</span>
                  {hint ? <p className={styles.hintText}>{hint}</p> : null}
                </div>
              </div>
              {actionLabel ? <span className={styles.actionPill}>{actionLabel}</span> : null}
            </>
          ) : (
            <>
              <span className={styles.dropzoneIconBadge} aria-hidden="true">
                {icon ?? <Icon name="upload" size={22} />}
              </span>
              <div className={styles.dropzoneTextGroup}>
                <span className={styles.triggerText}>{dropzoneTitle}</span>
                {hint ? <p className={styles.hintText}>{hint}</p> : null}
              </div>
            </>
          ))}
      </div>
    );
  },
);

FileUploadDropzone.displayName = 'FileUploadDropzone';

interface FileUploadListBaseProps extends ComponentPropsWithoutRef<'ul'> {
  itemMeta?: Record<string, FileUploadItemMeta>;
  /** Localized accessible name for each file's remove button. */
  removeAriaLabel: (fileName: string) => string;
  formatSize?: (bytes: number) => string;
  'data-testid'?: string;
}

/** A retry action requires its localized visible and accessible labels. */
export type FileUploadListProps = FileUploadListBaseProps &
  (
    | {
        onRetry: (file: File, index: number) => void;
        retryLabel: string;
        retryAriaLabel: (fileName: string) => string;
      }
    | {
        onRetry?: undefined;
        retryLabel?: string;
        retryAriaLabel?: (fileName: string) => string;
      }
  );

export const FileUploadList = forwardRef<HTMLUListElement, FileUploadListProps>(
  function FileUploadList(
    {
      itemMeta,
      onRetry,
      retryLabel,
      removeAriaLabel,
      retryAriaLabel,
      formatSize,
      className,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) {
    const { files, removeFile, disabled } = useFileUploadContext();

    if (files.length === 0) return null;

    return (
      <ul ref={ref} className={cn(styles.list, className)} data-testid={testId} {...rest}>
        {files.map((file, index) => {
          const meta = itemMeta?.[file.name];
          const status: FileUploadStatus = meta?.status ?? 'idle';
          const defaultProgress =
            status === 'completed'
              ? 100
              : status === 'error'
                ? 56
                : status === 'uploading'
                  ? 52
                  : 100;
          const rawProgress = meta?.progress ?? defaultProgress;
          const clampedProgress = Math.min(100, Math.max(0, rawProgress));
          const effectiveBytes = meta?.displaySize ?? file.size;
          const sizeLabel = formatSize ? formatSize(effectiveBytes) : formatBytes(effectiveBytes);

          const footerText =
            status === 'error'
              ? (meta?.error ?? sizeLabel)
              : status === 'completed'
                ? (meta?.statusLabel ?? sizeLabel)
                : meta?.statusLabel
                  ? `${sizeLabel} • ${meta.statusLabel}`
                  : sizeLabel;

          const progressStyle: UploadProgressCSSProperties = {
            '--_upload-progress-scale': `${clampedProgress / 100}`,
          };

          return (
            <li
              key={`${file.name}-${index}`}
              className={styles.item}
              data-status={status}
              data-testid={testId ? `${testId}-item-${index}` : undefined}
            >
              <span className={styles.itemIconBox} data-status={status} aria-hidden="true">
                <Icon name="file-upload" size={20} />
              </span>

              <div className={styles.itemBody}>
                <div className={styles.itemHeaderRow}>
                  <span className={styles.itemName}>{file.name}</span>

                  <div className={styles.itemHeaderActions}>
                    {status === 'completed' ? (
                      <span className={styles.completedIcon} aria-hidden="true">
                        <Icon name="check-circle" size={18} />
                      </span>
                    ) : null}
                    <button
                      type="button"
                      disabled={disabled}
                      className={styles.removeButton}
                      data-status={status}
                      onClick={() => removeFile(index)}
                      aria-label={removeAriaLabel(file.name)}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>

                <div
                  className={styles.progressTrack}
                  data-status={status}
                  role="progressbar"
                  aria-label={file.name}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(clampedProgress)}
                  style={progressStyle}
                >
                  <div className={styles.progressFill} data-status={status} />
                </div>

                <div className={styles.itemFooterRow}>
                  <span
                    className={styles.itemMetaText}
                    role={status === 'error' && meta?.error ? 'alert' : undefined}
                  >
                    {footerText}
                  </span>

                  {status === 'error' && onRetry && retryLabel && retryAriaLabel ? (
                    <button
                      type="button"
                      disabled={disabled}
                      className={styles.retryButton}
                      onClick={() => onRetry(file, index)}
                      aria-label={retryAriaLabel(file.name)}
                    >
                      <span>{retryLabel}</span>
                      <Icon name="refresh" size={14} />
                    </button>
                  ) : (
                    <span className={styles.progressPercent}>{Math.round(clampedProgress)}%</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  },
);

FileUploadList.displayName = 'FileUploadList';
