import React from 'react';
import { expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { type Attachment } from '@openmrs/esm-framework';
import AttachmentPreviewModal from './attachment-preview.modal';

const image: Attachment = {
  id: 'att-1',
  src: '/openmrs/ws/rest/v1/attachment/att-1/bytes',
  filename: 'brainScan.jpeg',
  description: 'Brain scan',
  dateTime: '2026-09-18T10:00:00.000+0000',
  bytesMimeType: 'image/jpeg',
  bytesContentFamily: 'IMAGE',
};

test('shows an image attachment with its name and caption', async () => {
  const user = userEvent.setup();
  const closeModal = vi.fn();
  render(<AttachmentPreviewModal attachment={image} closeModal={closeModal} />);

  expect(screen.getByRole('heading', { name: 'brainScan.jpeg' })).toBeInTheDocument();
  expect(screen.getByText('Brain scan', { selector: 'p' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Brain scan' })).toHaveAttribute('src', image.src);

  await user.click(screen.getByRole('button', { name: /close/i }));
  expect(closeModal).toHaveBeenCalled();
});

test('embeds a PDF attachment', () => {
  render(
    <AttachmentPreviewModal
      attachment={{ ...image, filename: 'consent.pdf', bytesMimeType: 'application/pdf', bytesContentFamily: 'PDF' }}
      closeModal={vi.fn()}
    />,
  );

  expect(screen.getByTitle('consent.pdf')).toHaveAttribute('src', image.src);
});

test('offers to open a file it cannot preview', () => {
  render(
    <AttachmentPreviewModal
      attachment={{
        ...image,
        filename: 'notes.docx',
        bytesMimeType: 'application/msword',
        bytesContentFamily: 'OTHER',
      }}
      closeModal={vi.fn()}
    />,
  );

  expect(screen.getByText(/no preview is available/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open file' })).toHaveAttribute('href', image.src);
});
