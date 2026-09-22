import React from 'react';
import { expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import RemoveVisitNoteImageModal from './remove-visit-note-image.modal';

const image = { id: 'image-obs', src: '/image', filename: 'wound.png' };

test('cancel keeps the saved image and makes no request', async () => {
  const close = vi.fn();
  const onRemoved = vi.fn();
  render(<RemoveVisitNoteImageModal image={image} close={close} onRemoved={onRemoved} />);
  await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
  expect(close).toHaveBeenCalledOnce();
  expect(openmrsFetch).not.toHaveBeenCalled();
  expect(onRemoved).not.toHaveBeenCalled();
});

test('confirmation voids only the image observation and refreshes after success', async () => {
  vi.mocked(openmrsFetch).mockResolvedValueOnce(Object.assign(new Response(null, { status: 204 }), { data: null }));
  const close = vi.fn();
  const onRemoved = vi.fn();
  render(<RemoveVisitNoteImageModal image={image} close={close} onRemoved={onRemoved} />);
  expect(
    screen.getByText(/the image will be removed immediately. discarding changes to the note will not restore it/i),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /remove/i }));
  await waitFor(() => expect(onRemoved).toHaveBeenCalledOnce());
  expect(openmrsFetch).toHaveBeenCalledExactlyOnceWith(
    '/ws/rest/v1/obs/image-obs?reason=Removed%20from%20visit%20note',
    { method: 'DELETE' },
  );
  expect(close).toHaveBeenCalledOnce();
});

test('failed removal stays open and allows retry', async () => {
  vi.mocked(openmrsFetch)
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce(Object.assign(new Response(null, { status: 204 }), { data: null }));
  const close = vi.fn();
  const onRemoved = vi.fn();
  render(<RemoveVisitNoteImageModal image={image} close={close} onRemoved={onRemoved} />);
  await userEvent.click(screen.getByRole('button', { name: /remove/i }));
  expect(await screen.findByText(/could not remove the image/i)).toBeInTheDocument();
  expect(close).not.toHaveBeenCalled();
  expect(onRemoved).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: /remove/i }));
  await waitFor(() => expect(onRemoved).toHaveBeenCalledOnce());
});
