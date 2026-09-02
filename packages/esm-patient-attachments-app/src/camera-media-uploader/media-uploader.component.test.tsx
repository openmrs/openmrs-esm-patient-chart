import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useConfig } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import MediaUploaderComponent from './media-uploader.component';

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  useAllowedFileExtensions: () => ({ allowedFileExtensions: undefined, error: null, isLoading: false }),
}));

const mockUseConfig = vi.mocked(useConfig<{ maxFileSize: number }>);

function makeFileOfSize(name: string, sizeInBytes: number, type = 'image/jpeg'): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeInBytes });
  return file;
}

function renderMediaUploader() {
  const setFilesToUpload = vi.fn();

  render(
    <CameraMediaUploaderContext.Provider value={{ multipleFiles: true, setFilesToUpload }}>
      <MediaUploaderComponent />
    </CameraMediaUploaderContext.Provider>,
  );

  return { setFilesToUpload };
}

function uploadFile(file: File) {
  const input = screen.getByLabelText(/drag and drop files here or click to upload/i);
  fireEvent.change(input, { target: { files: [file] } });
}

it('accepts a file just under the default 10MB limit', async () => {
  mockUseConfig.mockReturnValue({ maxFileSize: 10 });
  const { setFilesToUpload } = renderMediaUploader();

  uploadFile(makeFileOfSize('phone-photo.jpg', 9.9 * 1024 * 1024));

  await waitFor(() => expect(setFilesToUpload).toHaveBeenCalled());
  expect(screen.queryByText(/file size limit exceeded/i)).not.toBeInTheDocument();
});

it('rejects a file over the default 10MB limit with an error stating the 10MB limit', async () => {
  mockUseConfig.mockReturnValue({ maxFileSize: 10 });
  const { setFilesToUpload } = renderMediaUploader();

  uploadFile(makeFileOfSize('high-res-scan.jpg', 10.1 * 1024 * 1024));

  expect(await screen.findByText(/file size limit exceeded/i)).toBeInTheDocument();
  expect(screen.getByText(/exceeds the size limit of 10 MB/i)).toBeInTheDocument();
  expect(setFilesToUpload).not.toHaveBeenCalled();
});

it('honors an implementer-configured maxFileSize override instead of the platform default', async () => {
  mockUseConfig.mockReturnValue({ maxFileSize: 2 });
  const { setFilesToUpload } = renderMediaUploader();

  uploadFile(makeFileOfSize('photo.jpg', 3 * 1024 * 1024));

  expect(await screen.findByText(/file size limit exceeded/i)).toBeInTheDocument();
  expect(screen.getByText(/exceeds the size limit of 2 MB/i)).toBeInTheDocument();
  expect(setFilesToUpload).not.toHaveBeenCalled();
});
