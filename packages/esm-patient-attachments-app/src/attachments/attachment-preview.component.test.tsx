import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { type Attachment } from '@openmrs/esm-framework';
import AttachmentPreview from './attachment-preview.component';

const attachment: Attachment = {
  id: 'attachment-uuid',
  src: 'data:image/png;base64,image-data',
  filename: 'patient-document.png',
  dateTime: '2026-09-01T12:00:00.000Z',
  bytesMimeType: 'image/png',
  bytesContentFamily: 'IMAGE',
};

it('provides descriptive names for the attachment menu and its delete action', async () => {
  const user = userEvent.setup();

  render(<AttachmentPreview attachmentToPreview={attachment} onClosePreview={vi.fn()} onDeleteAttachment={vi.fn()} />);

  await user.click(screen.getByRole('button', { name: /attachment actions/i }));

  const menu = screen.getByRole('menu', { hidden: true });
  const deleteItem = within(menu).getByRole('menuitem', { hidden: true });

  expect(menu).toHaveAttribute('aria-label', 'Attachment actions');
  expect(deleteItem).not.toHaveAttribute('aria-label');
  expect(deleteItem).toHaveTextContent('Delete image');
});
