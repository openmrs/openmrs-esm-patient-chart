import React from 'react';
import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CameraMediaUploaderModal from './camera-media-uploader.component';

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  useAllowedFileExtensions: () => ({ allowedFileExtensions: ['pdf', 'jpg'], error: undefined, isLoading: false }),
  useMaxAttachmentFileSize: () => ({
    maxFileSize: 5,
    error: undefined,
    isLoading: false,
    isValidating: false,
    retry: vi.fn(),
  }),
}));

test('uses the backend list when the caller passes none', () => {
  render(<CameraMediaUploaderModal closeModal={vi.fn()} saveFile={vi.fn()} />);

  expect(screen.getByLabelText(/drag and drop files here/i)).toHaveAttribute('accept', '.pdf,.jpg');
});

test("normalises the caller's extensions before using them for the picker", () => {
  render(
    <CameraMediaUploaderModal allowedExtensions={['.PNG', 'Jpg', ' jpg ']} closeModal={vi.fn()} saveFile={vi.fn()} />,
  );

  expect(screen.getByText(/supported files are png, jpg\./i)).toBeInTheDocument();
  expect(screen.getByLabelText(/drag and drop files here/i)).toHaveAttribute('accept', '.png,.jpg');
});
