import { beforeEach, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { openmrsFetch, useAttachments } from '@openmrs/esm-framework';
import { replaceEncounterClinician, useVisitNoteImages } from './visit-notes.resource';

const mockUseAttachments = vi.mocked(useAttachments);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);

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
      src: '/openmrs/ws/rest/v1/attachment/att-image/bytes',
      description: 'Front view',
      filename: 'front.png',
    },
  ]);
});

test('fetches nothing when there is no encounter yet', () => {
  renderHook(() => useVisitNoteImages('patient-uuid', undefined));

  expect(mockUseAttachments).toHaveBeenCalledWith(null, false, undefined);
});

test('replaces the clinician by adding the new one and voiding the other clinicians of the same role', async () => {
  const abortController = new AbortController();
  mockOpenmrsFetch.mockResolvedValueOnce({
    data: {
      results: [
        { uuid: 'ep-old', provider: { uuid: 'old-provider' }, encounterRole: { uuid: 'clinician-role' } },
        { uuid: 'ep-other-role', provider: { uuid: 'old-provider' }, encounterRole: { uuid: 'nurse-role' } },
        { uuid: 'ep-new', provider: { uuid: 'new-provider' }, encounterRole: { uuid: 'clinician-role' } },
      ],
    },
  } as Awaited<ReturnType<typeof openmrsFetch>>);
  mockOpenmrsFetch.mockResolvedValue({ data: {} } as Awaited<ReturnType<typeof openmrsFetch>>);

  await replaceEncounterClinician(abortController, 'enc-uuid', 'new-provider', 'clinician-role');

  const calls = mockOpenmrsFetch.mock.calls.map(([url, options]) => [url, (options as RequestInit)?.method]);
  expect(calls).toEqual([
    [expect.stringContaining('/encounter/enc-uuid/encounterprovider?v='), undefined],
    [expect.stringMatching(/\/encounter\/enc-uuid\/encounterprovider$/), 'POST'],
    [expect.stringMatching(/\/encounter\/enc-uuid\/encounterprovider\/ep-old$/), 'DELETE'],
  ]);
  expect(mockOpenmrsFetch.mock.calls[1][1]).toMatchObject({
    body: { provider: 'new-provider', encounterRole: 'clinician-role' },
  });
});
