import React from 'react';
import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CameraMediaUploaderModal from './camera-media-uploader.component';

test("normalises the caller's extensions before using them for the picker", () => {
  render(
    <CameraMediaUploaderModal allowedExtensions={['.PNG', 'Jpg', ' jpg ']} closeModal={vi.fn()} saveFile={vi.fn()} />,
  );

  expect(screen.getByText(/supported files are png, jpg\./i)).toBeInTheDocument();
  expect(screen.getByLabelText(/drag and drop files here/i)).toHaveAttribute('accept', '.png,.jpg');
});
