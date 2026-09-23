import React from 'react';
import { expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMaxAttachmentFileSize } from '@openmrs/esm-patient-common-lib';
import MediaUploader from './media-uploader.component';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  useMaxAttachmentFileSize: vi.fn(),
}));
vi.mock('../utils', () => ({ readFileAsString: vi.fn().mockResolvedValue('data:image/png;base64,test') }));

function renderUploader(maxFileSize: number | undefined, isLoading = false, error?: Error) {
  const retry = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useMaxAttachmentFileSize).mockReturnValue({
    maxFileSize,
    isLoading,
    isValidating: isLoading,
    error,
    retry,
  });
  const setFilesToUpload = vi.fn();
  const content = () => (
    <CameraMediaUploaderContext.Provider value={{ setFilesToUpload, multipleFiles: true, allowedExtensions: ['png'] }}>
      <MediaUploader />
    </CameraMediaUploaderContext.Provider>
  );
  const view = render(content());
  const input = screen.getByLabelText(/drag and drop files here or click to upload/i) as HTMLInputElement;
  return { input, setFilesToUpload, retry, rerender: () => view.rerender(content()) };
}

test('accepts a file larger than the old frontend limit when the backend permits it', async () => {
  const { input, setFilesToUpload } = renderUploader(5);
  expect(screen.getByText(/size limit is 5MB/i)).toBeInTheDocument();
  await userEvent.upload(input, new File([new Uint8Array(2 * 1024 * 1024)], 'wound.png', { type: 'image/png' }));
  await waitFor(() => expect(setFilesToUpload).toHaveBeenCalledOnce());
});

test('rejects a file above a smaller backend limit', async () => {
  const { input, setFilesToUpload } = renderUploader(0.5);
  await userEvent.upload(input, new File([new Uint8Array(0.75 * 1024 * 1024)], 'wound.png', { type: 'image/png' }));
  expect(await screen.findByText(/file size limit exceeded/i)).toBeInTheDocument();
  expect(setFilesToUpload).not.toHaveBeenCalled();
});

test('accepts a file exactly at the backend limit', async () => {
  const { input, setFilesToUpload } = renderUploader(0.5);
  await userEvent.upload(input, new File([new Uint8Array(0.5 * 1024 * 1024)], 'wound.png', { type: 'image/png' }));
  await waitFor(() => expect(setFilesToUpload).toHaveBeenCalledOnce());
});

test('waits for the limit before allowing file selection', () => {
  const { input } = renderUploader(undefined, true);
  expect(input).toBeDisabled();
  expect(screen.queryByText(/size limit is/i)).not.toBeInTheDocument();
});

test.each([undefined, new Error('Network error')])(
  'blocks selection and offers retry when the limit is unavailable (%s)',
  async (error) => {
    const { input, setFilesToUpload, retry } = renderUploader(undefined, false, error);
    expect(input).toBeDisabled();
    expect(screen.getByText('Could not load the upload size limit')).toBeInTheDocument();
    await userEvent.upload(input, new File(['image'], 'wound.png', { type: 'image/png' }));
    expect(setFilesToUpload).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  },
);

test('does not use a stale limit after a failed refresh', () => {
  const { input } = renderUploader(5, false, new Error('Network error'));
  expect(input).toBeDisabled();
});

test('enables selection after retry obtains a valid limit', () => {
  const { input, rerender, retry } = renderUploader(undefined);
  vi.mocked(useMaxAttachmentFileSize).mockReturnValue({
    maxFileSize: undefined,
    isLoading: false,
    isValidating: true,
    error: undefined,
    retry,
  });
  rerender();
  expect(input).toBeDisabled();
  expect(screen.getByLabelText(/drag and drop files here or click to upload/i)).toBeDisabled();
  expect(screen.getByText('Loading upload size limit...')).toBeInTheDocument();
  vi.mocked(useMaxAttachmentFileSize).mockReturnValue({
    maxFileSize: 5,
    isLoading: false,
    isValidating: false,
    error: undefined,
    retry,
  });
  rerender();
  expect(screen.getByLabelText(/drag and drop files here or click to upload/i)).toBeEnabled();
  expect(screen.queryByText('Could not load the upload size limit')).not.toBeInTheDocument();
});
