import { beforeEach, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAttachments } from '@openmrs/esm-framework';
import { useVisitNoteImages } from './visit-notes.resource';

const mockUseAttachments = vi.mocked(useAttachments);

const attachments = [
  {
    uuid: 'att-image',
    filename: 'front.png',
    comment: 'Front view',
    dateTime: '2026-09-18T10:00:00.000+0000',
    bytesMimeType: 'image/png',
    bytesContentFamily: 'IMAGE',
  },
  {
    uuid: 'att-pdf',
    filename: 'consent.pdf',
    comment: 'Consent form',
    dateTime: '2026-09-18T10:00:00.000+0000',
    bytesMimeType: 'application/pdf',
    bytesContentFamily: 'OTHER',
  },
];

beforeEach(() => {
  mockUseAttachments.mockReturnValue({
    data: attachments,
    isLoading: false,
    isValidating: false,
    error: null,
    mutate: vi.fn(),
  });
});

test('asks for the attachments on the note encounter and keeps only the images', () => {
  const { result } = renderHook(() => useVisitNoteImages('patient-uuid', 'encounter-uuid'));

  expect(mockUseAttachments).toHaveBeenCalledWith('patient-uuid', false, 'encounter-uuid');
  expect(result.current.images).toEqual([
    {
      id: 'att-image',
      src: `${window.openmrsBase}/ws/rest/v1/attachment/att-image/bytes`,
      description: 'Front view',
      filename: 'front.png',
    },
  ]);
});

test('fetches nothing when there is no encounter yet', () => {
  renderHook(() => useVisitNoteImages('patient-uuid', undefined));

  expect(mockUseAttachments).toHaveBeenCalledWith(null, false, undefined);
});
