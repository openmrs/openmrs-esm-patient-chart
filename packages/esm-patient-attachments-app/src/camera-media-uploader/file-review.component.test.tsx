import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { type UploadedFile } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import FileReviewContainer from './file-review.component';

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  useAllowedFileExtensions: () => ({ allowedFileExtensions: undefined, error: null, isLoading: false }),
}));

const uploadedFile: UploadedFile = {
  base64Content: 'data:image/png;base64,image-data',
  file: new File(['content'], 'wound-photo.png', { type: 'image/png' }),
  fileDescription: '',
  fileName: 'wound-photo.png',
  fileType: 'image',
  status: 'uploading',
};

function renderFileReview(onCompletion = vi.fn()) {
  return render(
    <CameraMediaUploaderContext.Provider
      value={{
        clearData: vi.fn(),
        closeModal: vi.fn(),
        collectDescription: false,
        filesToUpload: [uploadedFile],
        setFilesToUpload: vi.fn(),
      }}
    >
      <FileReviewContainer onCompletion={onCompletion} />
    </CameraMediaUploaderContext.Provider>,
  );
}

it("keeps the 'Add attachment' submit control reachable via a sticky modal footer", () => {
  renderFileReview();

  const footer = screen.getByTestId('add-attachment-footer');

  expect(footer).toHaveClass('stickyFooter');
  expect(footer).toContainElement(screen.getByRole('button', { name: /add attachment/i }));
});

it('still submits when Enter is pressed in the caption field, unchanged from today (no desktop regression)', async () => {
  const user = userEvent.setup();
  const onCompletion = vi.fn();
  renderFileReview(onCompletion);

  const captionField = screen.getByLabelText(/image name/i);
  await user.clear(captionField);
  await user.type(captionField, 'wound-photo{Enter}');

  expect(onCompletion).toHaveBeenCalledTimes(1);
});

it("submits when the visible 'Add attachment' button is clicked", async () => {
  const user = userEvent.setup();
  const onCompletion = vi.fn();
  renderFileReview(onCompletion);

  await user.click(screen.getByRole('button', { name: /add attachment/i }));

  expect(onCompletion).toHaveBeenCalledTimes(1);
});
