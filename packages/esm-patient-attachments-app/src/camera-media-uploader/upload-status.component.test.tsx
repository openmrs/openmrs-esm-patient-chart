import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, type UploadedFile } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import UploadStatusComponent from './upload-status.component';

const firstFile: UploadedFile = {
  fileName: 'scan.png',
  fileType: 'image',
  base64Content: 'data:image/png;base64,aW1hZ2U=',
  fileDescription: 'Scan',
};

const secondFile: UploadedFile = {
  fileName: 'results.pdf',
  fileType: 'pdf',
  base64Content: 'data:application/pdf;base64,cGRm',
  fileDescription: 'Results',
};

function renderStatus({
  filesToUpload = [firstFile],
  saveFile = vi.fn().mockResolvedValue({}),
  showUploadSnackbar,
}: {
  filesToUpload?: Array<UploadedFile>;
  saveFile?: ReturnType<typeof vi.fn>;
  showUploadSnackbar?: boolean;
} = {}) {
  const onCompletion = vi.fn();

  render(
    <CameraMediaUploaderContext.Provider
      value={{
        filesToUpload,
        saveFile,
        onCompletion,
        closeModal: vi.fn(),
        clearData: vi.fn(),
        showUploadSnackbar,
      }}
    >
      <UploadStatusComponent />
    </CameraMediaUploaderContext.Provider>,
  );

  return { saveFile, onCompletion };
}

beforeEach(() => {
  vi.mocked(showSnackbar).mockClear();
});

test('reports each upload as complete by default', async () => {
  const { saveFile, onCompletion } = renderStatus();

  await waitFor(() => expect(onCompletion).toHaveBeenCalledTimes(1));
  expect(saveFile).toHaveBeenCalledTimes(1);
  expect(saveFile).toHaveBeenCalledWith(firstFile);
  expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ title: 'Upload complete', kind: 'success' }));
  expect(screen.getByText('scan.png')).toBeInTheDocument();
});

test('stays quiet when the caller only stages the file', async () => {
  const { saveFile, onCompletion } = renderStatus({ showUploadSnackbar: false });

  await waitFor(() => expect(onCompletion).toHaveBeenCalledTimes(1));
  expect(saveFile).toHaveBeenCalledWith(firstFile);
  expect(showSnackbar).not.toHaveBeenCalled();
});

test('does not report the batch complete when one upload fails', async () => {
  const uploadError = new Error('Network unavailable');
  const saveFile = vi
    .fn()
    .mockResolvedValueOnce({})
    .mockRejectedValueOnce(uploadError);

  const { onCompletion } = renderStatus({
    filesToUpload: [firstFile, secondFile],
    saveFile,
  });

  await waitFor(() => expect(screen.getByRole('button', { name: 'Retry failed uploads' })).toBeInTheDocument());

  expect(saveFile).toHaveBeenCalledTimes(2);
  expect(onCompletion).not.toHaveBeenCalled();
  expect(screen.getByText('Upload failed')).toBeInTheDocument();
  expect(showSnackbar).toHaveBeenCalledWith(
    expect.objectContaining({
      kind: 'error',
      subtitle: uploadError.message,
      title: 'Uploading results.pdf failed',
    }),
  );
});

test('retries only failed files and completes the batch after recovery', async () => {
  const user = userEvent.setup();
  const saveFile = vi
    .fn()
    .mockResolvedValueOnce({})
    .mockRejectedValueOnce(new Error('Temporary failure'))
    .mockResolvedValueOnce({});

  const { onCompletion } = renderStatus({
    filesToUpload: [firstFile, secondFile],
    saveFile,
  });

  const retryButton = await screen.findByRole('button', { name: 'Retry failed uploads' });
  expect(onCompletion).not.toHaveBeenCalled();

  await user.click(retryButton);

  await waitFor(() => expect(onCompletion).toHaveBeenCalledTimes(1));
  expect(saveFile).toHaveBeenCalledTimes(3);
  expect(saveFile).toHaveBeenNthCalledWith(3, secondFile);
  expect(screen.queryByRole('button', { name: 'Retry failed uploads' })).not.toBeInTheDocument();
});

test('does not start a duplicate upload batch after rerendering', async () => {
  const saveFile = vi.fn().mockResolvedValue({});
  const onCompletion = vi.fn();
  const contextValue = {
    filesToUpload: [firstFile],
    saveFile,
    onCompletion,
    closeModal: vi.fn(),
    clearData: vi.fn(),
  };

  const { rerender } = render(
    <CameraMediaUploaderContext.Provider value={contextValue}>
      <UploadStatusComponent />
    </CameraMediaUploaderContext.Provider>,
  );

  await waitFor(() => expect(onCompletion).toHaveBeenCalledTimes(1));

  rerender(
    <CameraMediaUploaderContext.Provider value={{ ...contextValue }}>
      <UploadStatusComponent />
    </CameraMediaUploaderContext.Provider>,
  );

  await waitFor(() => expect(saveFile).toHaveBeenCalledTimes(1));
  expect(onCompletion).toHaveBeenCalledTimes(1);
});
