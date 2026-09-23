import React from 'react';
import { expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import MediaUploaderComponent from './media-uploader.component';

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  useMaxAttachmentFileSize: () => ({
    maxFileSize: 5,
    error: undefined,
    isLoading: false,
    isValidating: false,
    retry: vi.fn(),
  }),
}));

function renderUploader(allowedExtensions: Array<string> | undefined) {
  const setFilesToUpload = vi.fn();
  render(
    <CameraMediaUploaderContext.Provider value={{ allowedExtensions, setFilesToUpload, multipleFiles: true }}>
      <MediaUploaderComponent />
    </CameraMediaUploaderContext.Provider>,
  );
  return { setFilesToUpload };
}

test('lists only the extensions the caller allows and refuses anything else', async () => {
  const user = userEvent.setup({ applyAccept: false });
  const { setFilesToUpload } = renderUploader(['jpeg', 'jpg', 'png']);

  expect(screen.getByText(/supported files are jpeg, jpg, png/i)).toBeInTheDocument();
  expect(screen.queryByText(/pdf/i)).not.toBeInTheDocument();

  const input = screen.getByLabelText(/drag and drop files here/i);
  await user.upload(input, new File(['%PDF-1.4'], 'consent.pdf', { type: 'application/pdf' }));

  expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
  expect(screen.getByText(/one of the following extensions: jpeg, jpg, or png/i)).toBeInTheDocument();
  expect(setFilesToUpload).not.toHaveBeenCalled();
});

test('keeps the allowed list intact after refusing a file', async () => {
  const user = userEvent.setup({ applyAccept: false });
  const allowed = ['jpeg', 'png'];
  renderUploader(allowed);

  const input = screen.getByLabelText(/drag and drop files here/i);
  await user.upload(input, new File(['x'], 'notes.txt', { type: 'text/plain' }));
  await user.upload(input, new File(['y'], 'more.txt', { type: 'text/plain' }));

  expect(allowed).toEqual(['jpeg', 'png']);
  expect(screen.getByText(/jpeg, or png/i)).toBeInTheDocument();
});

test('accepts an allowed file and stages it', async () => {
  const user = userEvent.setup({ applyAccept: false });
  const { setFilesToUpload } = renderUploader(['png']);

  const input = screen.getByLabelText(/drag and drop files here/i);
  await user.upload(input, new File(['png'], 'scan.PNG', { type: 'image/png' }));

  await vi.waitFor(() => expect(setFilesToUpload).toHaveBeenCalledTimes(1));
  expect(screen.queryByText(/unsupported file type/i)).not.toBeInTheDocument();
});
