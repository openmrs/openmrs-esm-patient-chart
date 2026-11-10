import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { showSnackbar, type UploadedFile } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import UploadStatusComponent from './upload-status.component';

const file: UploadedFile = {
  fileName: 'scan.png',
  fileType: 'image',
  base64Content: 'data:image/png;base64,aW1hZ2U=',
  fileDescription: 'Scan',
};

function renderStatus(showUploadSnackbar?: boolean) {
  const saveFile = vi.fn().mockResolvedValue({});
  const onCompletion = vi.fn();
  render(
    <CameraMediaUploaderContext.Provider
      value={{
        filesToUpload: [file],
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

  await waitFor(() => expect(onCompletion).toHaveBeenCalled());
  expect(saveFile).toHaveBeenCalledWith(file);
  expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ title: 'Upload complete', kind: 'success' }));
  expect(screen.getByText('scan.png')).toBeInTheDocument();
});

test('stays quiet when the caller only stages the file', async () => {
  const { saveFile, onCompletion } = renderStatus(false);

  await waitFor(() => expect(onCompletion).toHaveBeenCalled());
  expect(saveFile).toHaveBeenCalledWith(file);
  expect(showSnackbar).not.toHaveBeenCalled();
});
