# FileUpload Primitive Specification

## 1. Overview
The `FileUpload` primitive provides an accessible drag-and-drop file staging area and queue list with MIME type/extension filtering (`accept`), file size validation (`maxSize`), file count limits (`maxFiles` / `multiple`), two dropzone visual variants (`dropzone` and `compact`), and per-file upload lifecycle tracking (`idle`, `uploading`, `completed`, `error`) with GPU-accelerated progress bars and retry actions.

## 2. Anatomy
```tsx
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
} from '@/components/ui';

export function Example() {
  return (
    <FileUpload
      accept="image/*,application/pdf"
      maxSize={10 * 1024 * 1024}
      maxFiles={5}
      onFilesChange={(files) => console.log(files)}
    >
      <FileUploadDropzone
        variant="dropzone"
        dropzoneTitle="Upload files or drag and drop"
        hint="PDF, PNG, JPG up to 10MB"
      />
      <FileUploadList
        itemMeta={{
          'report.pdf': { status: 'uploading', progress: 68, statusLabel: 'Uploading 68%' },
        }}
        onRetry={(file) => console.log('Retry', file.name)}
        removeAriaLabel={(name) => `Remove ${name}`}
      />
    </FileUpload>
  );
}
```

## 3. Props Reference

### `FileUpload`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `File[]` | `undefined` | Controlled staged files array |
| `defaultValue` | `File[]` | `[]` | Initial uncontrolled staged files |
| `onFilesChange` | `(files: File[]) => void` | `undefined` | Callback fired when staged files change |
| `accept` | `string` | `undefined` | Comma-separated MIME types (`image/*`, `application/pdf`) or extensions (`.csv`, `.json`) enforced on both native dialog and drag-and-drop |
| `multiple` | `boolean` | `true` | Allows selecting/dropping multiple files |
| `maxSize` | `number` | `undefined` | Maximum allowed size per file in bytes |
| `maxFiles` | `number` | `undefined` | Maximum total number of staged files |
| `disabled` | `boolean` | `false` | Disables dropzone interaction, retry, and file removal |

### `FileUploadDropzone`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'dropzone' \| 'compact'` | `'dropzone'` | Visual layout: vertical boxed dropzone (`'dropzone'`) or horizontal inline bar (`'compact'`) |
| `icon` | `ReactNode` | `<Icon name="upload" />` | Custom icon slot rendered inside `.dropzoneIconBadge` |
| `dropzoneTitle` | `ReactNode` | — (required unless `children` is set) | Localized title that names the dropzone button |
| `hint` | `ReactNode` | `undefined` | Optional supporting copy rendered under the title |
| `actionLabel` | `ReactNode` | `undefined` | Optional trailing action pill (compact variant) |
| `children` | `ReactNode` | `undefined` | Custom override for the entire dropzone content; makes `dropzoneTitle` optional |

### `FileUploadList`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `itemMeta` | `Record<string, FileUploadItemMeta>` | `undefined` | Per-file upload lifecycle metadata (`status`, `progress`, `error`, `statusLabel`, `displaySize`) |
| `onRetry` | `(file: File, index: number) => void` | `undefined` | Callback fired when retrying a failed (`status: 'error'`) file |
| `retryLabel` | `string` | — (required with `onRetry`) | Localized text for the retry button |
| `retryAriaLabel` | `(fileName: string) => string` | — (required with `onRetry`) | Localized `aria-label` generator for item retry buttons |
| `removeAriaLabel` | `(fileName: string) => string` | — (required) | Localized `aria-label` generator for item remove buttons |
| `formatSize` | `(bytes: number) => string` | `formatBytes` | Custom byte size formatter |

## 4. Keyboard, Accessibility & Motion Contracts
- Underlying native `<input type="file" tabIndex={-1} aria-hidden="true">` provides standard OS file chooser dialogs.
- `FileUploadDropzone` exposes `role="button"` and `tabIndex={0}` (`-1` when disabled), activating the file chooser on `Enter` or `Space`.
- Uploading file items render an accessible `role="progressbar"` with `aria-valuemin={0}`, `aria-valuemax={100}`, and `aria-valuenow={progress}`.
- Progress fill uses GPU-friendly `transform: translateX(...)` via `--_upload-progress-scale` with `:dir(rtl)` mirroring (never animating layout `width`, compliant with Rule 18).
- Failed file items surface error reasons inside `role="alert"` and expose an accessible retry button.
- Focus indicators on `.dropzone:focus-visible`, `.retryButton:focus-visible`, and `.removeButton:focus-visible` apply `transition: none` (Rule 18).
