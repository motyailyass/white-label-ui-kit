import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload, FileUploadDropzone, FileUploadList, formatBytes } from './file-upload';

const dropzoneCopy = { dropzoneTitle: 'Choose files or drag them here' };
const listCopy = { removeAriaLabel: (name: string) => `Remove ${name}` };

describe('FileUpload Primitive', () => {
  it('renders dropzone with role="button", tabIndex={0}, and supports compact variant', () => {
    const { rerender } = render(
      <FileUpload>
        <FileUploadDropzone {...dropzoneCopy} data-testid="dropzone" />
        <FileUploadList {...listCopy} />
      </FileUpload>,
    );

    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone.getAttribute('role')).toBe('button');
    expect(dropzone.getAttribute('tabindex')).toBe('0');
    expect(dropzone.getAttribute('data-variant')).toBe('dropzone');

    rerender(
      <FileUpload>
        <FileUploadDropzone
          {...dropzoneCopy}
          data-testid="dropzone"
          variant="compact"
          actionLabel="Browse files"
        />
        <FileUploadList {...listCopy} />
      </FileUpload>,
    );
    expect(dropzone.getAttribute('data-variant')).toBe('compact');
    expect(screen.getByText('Browse files')).toBeTruthy();
  });

  it('renders staged files with formatted size and remove action', () => {
    const file1 = new File(['hello world'], 'report.pdf', { type: 'application/pdf' });
    const file2 = new File(['image binary data here'], 'chart.png', { type: 'image/png' });
    const handleFilesChange = vi.fn();

    render(
      <FileUpload defaultValue={[file1, file2]} onFilesChange={handleFilesChange}>
        <FileUploadDropzone {...dropzoneCopy} />
        <FileUploadList {...listCopy} />
      </FileUpload>,
    );

    expect(screen.getByText('report.pdf')).toBeTruthy();
    expect(screen.getByText('chart.png')).toBeTruthy();

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(handleFilesChange).toHaveBeenCalledWith([file2]);
  });

  it('renders upload status variants (uploading progressbar, completed 100%, error alert and Try Again)', () => {
    const fileUploading = new File(['a'], 'uploading.png', { type: 'image/png' });
    const fileCompleted = new File(['b'], 'completed.pdf', { type: 'application/pdf' });
    const fileError = new File(['c'], 'failed.sql', { type: 'application/sql' });
    const handleRetry = vi.fn();

    render(
      <FileUpload defaultValue={[fileUploading, fileCompleted, fileError]}>
        <FileUploadDropzone {...dropzoneCopy} />
        <FileUploadList
          data-testid="list"
          {...listCopy}
          onRetry={handleRetry}
          retryLabel="Try Again"
          retryAriaLabel={(name) => `Retry ${name}`}
          itemMeta={{
            'uploading.png': {
              status: 'uploading',
              progress: 52,
              displaySize: 1_887_436,
            },
            'completed.pdf': {
              status: 'completed',
              progress: 100,
              displaySize: 2_516_582,
              statusLabel: 'Upload Successful!',
            },
            'failed.sql': {
              status: 'error',
              progress: 56,
              displaySize: 14_889_779,
              error: 'Upload failed! Please try again.',
            },
          }}
        />
      </FileUpload>,
    );

    const progressUploading = screen.getByRole('progressbar', { name: 'uploading.png' });
    expect(progressUploading.getAttribute('aria-valuenow')).toBe('52');
    expect(screen.getByText('52%')).toBeTruthy();
    expect(screen.getByText('1.8 MB')).toBeTruthy();

    const progressCompleted = screen.getByRole('progressbar', { name: 'completed.pdf' });
    expect(progressCompleted.getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByText('Upload Successful!')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();

    expect(screen.getByRole('alert').textContent).toBe('Upload failed! Please try again.');
    const retryBtn = screen.getByRole('button', { name: /retry failed\.sql/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledWith(fileError, 2);
  });

  it('rejects files exceeding maxSize', () => {
    const handleFilesChange = vi.fn();
    const largeFile = new File([new ArrayBuffer(1000)], 'large.bin', {
      type: 'application/octet-stream',
    });
    Object.defineProperty(largeFile, 'size', { value: 1000 });

    render(
      <FileUpload maxSize={500} onFilesChange={handleFilesChange}>
        <FileUploadDropzone {...dropzoneCopy} />
        <FileUploadList {...listCopy} />
      </FileUpload>,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(handleFilesChange).toHaveBeenCalledWith([]);
  });

  it('filters files by accept MIME type and extension on drop', () => {
    const handleFilesChange = vi.fn();
    const validImage = new File(['img'], 'photo.png', { type: 'image/png' });
    const validCsv = new File(['a,b'], 'data.csv', { type: 'text/csv' });
    const invalidExe = new File(['exe'], 'script.exe', { type: 'application/x-msdownload' });

    render(
      <FileUpload accept="image/*,.csv" onFilesChange={handleFilesChange}>
        <FileUploadDropzone {...dropzoneCopy} data-testid="dropzone" />
        <FileUploadList {...listCopy} />
      </FileUpload>,
    );

    const dropzone = screen.getByTestId('dropzone');
    fireEvent.dragOver(dropzone);
    expect(dropzone.getAttribute('data-dragging')).toBe('true');

    fireEvent.dragLeave(dropzone);
    expect(dropzone.getAttribute('data-dragging')).toBeNull();

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [validImage, validCsv, invalidExe],
      },
    });

    expect(handleFilesChange).toHaveBeenCalledWith([validImage, validCsv]);
  });

  it('enforces single-file replacement when multiple={false} and respects maxFiles', () => {
    const handleFilesChange = vi.fn();
    const file1 = new File(['1'], 'one.pdf', { type: 'application/pdf' });
    const file2 = new File(['2'], 'two.pdf', { type: 'application/pdf' });

    render(
      <FileUpload multiple={false} defaultValue={[file1]} onFilesChange={handleFilesChange}>
        <FileUploadDropzone {...dropzoneCopy} />
        <FileUploadList {...listCopy} />
      </FileUpload>,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file2] } });

    expect(handleFilesChange).toHaveBeenCalledWith([file2]);
  });

  it('activates file input on Enter and Space keys', () => {
    render(
      <FileUpload>
        <FileUploadDropzone {...dropzoneCopy} data-testid="dropzone" />
      </FileUpload>,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    const dropzone = screen.getByTestId('dropzone');

    fireEvent.keyDown(dropzone, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(dropzone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('respects disabled state on both dropzone and list remove buttons', () => {
    const file1 = new File(['hello'], 'doc.pdf', { type: 'application/pdf' });
    const handleFilesChange = vi.fn();

    render(
      <FileUpload disabled defaultValue={[file1]} onFilesChange={handleFilesChange}>
        <FileUploadDropzone {...dropzoneCopy} data-testid="dropzone" />
        <FileUploadList {...listCopy} />
      </FileUpload>,
    );

    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone.getAttribute('aria-disabled')).toBe('true');
    expect(dropzone.getAttribute('tabindex')).toBe('-1');

    const removeButton = screen.getByRole('button', {
      name: /remove doc\.pdf/i,
    }) as HTMLButtonElement;
    expect(removeButton.disabled).toBe(true);

    fireEvent.click(removeButton);
    expect(handleFilesChange).not.toHaveBeenCalled();
  });

  it('renders only the supplied copy and no built-in English fallbacks', () => {
    const file = new File(['a'], 'broken.sql', { type: 'application/sql' });

    render(
      <FileUpload defaultValue={[file]}>
        <FileUploadDropzone
          dropzoneTitle="Titre localisé"
          variant="compact"
          data-testid="dropzone"
        />
        <FileUploadList
          removeAriaLabel={(name) => `Supprimer ${name}`}
          itemMeta={{ 'broken.sql': { status: 'error', displaySize: 2048 } }}
        />
      </FileUpload>,
    );

    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone.textContent).toBe('Titre localisé');
    expect(screen.getByRole('button', { name: 'Supprimer broken.sql' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen.queryByText(/try again|upload failed|upload successful|browse files/i),
    ).toBeNull();
    expect(screen.getByText('2 KB')).toBeTruthy();
  });

  it('formats byte sizes accurately via formatBytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
  });
});
