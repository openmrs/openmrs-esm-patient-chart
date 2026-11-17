import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { openmrsFetch, restBaseUrl, useAttachments } from '@openmrs/esm-framework';
import { useDiagnosisConceptClasses, useVisitNoteImages } from './visit-notes.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseAttachments = vi.mocked(useAttachments);

describe('useVisitNoteImages', () => {
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

  it('asks for the attachments on the note encounter and keeps only the images', () => {
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

  it('fetches nothing when there is no encounter yet', () => {
    renderHook(() => useVisitNoteImages('patient-uuid', undefined));

    expect(mockUseAttachments).toHaveBeenCalledWith(null, false, undefined);
  });
});

describe('useDiagnosisConceptClasses', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('resolves every concept in one conceptreferences request and reports omitted ones as null', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: {
        'dx-1': { uuid: 'dx-1', conceptClass: { uuid: 'diagnosis-class' } },
        'sym-1': { uuid: 'sym-1', conceptClass: { uuid: 'symptom-class' } },
      },
    } as unknown as Awaited<ReturnType<typeof openmrsFetch>>);

    const { result } = renderHook(() => useDiagnosisConceptClasses(['dx-1', 'sym-1', 'gone-1']));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(mockOpenmrsFetch.mock.calls[0][0]).toBe(
      `${restBaseUrl}/conceptreferences?references=dx-1,sym-1,gone-1&v=custom:(uuid,conceptClass:(uuid))`,
    );
    expect(result.current.conceptClassByUuid).toEqual({
      'dx-1': 'diagnosis-class',
      'sym-1': 'symptom-class',
      'gone-1': null,
    });
  });

  it('makes no request when there is nothing to look up', () => {
    const { result } = renderHook(() => useDiagnosisConceptClasses([]));

    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
    expect(result.current.conceptClassByUuid).toEqual({});
  });
});
