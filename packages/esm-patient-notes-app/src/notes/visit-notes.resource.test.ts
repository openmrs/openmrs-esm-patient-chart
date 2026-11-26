import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { openmrsFetch, restBaseUrl, useAttachments, useConfig, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { useDiagnosisConceptClasses, useVisitNoteImages, useVisitNotes } from './visit-notes.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseAttachments = vi.mocked(useAttachments);
const mockUseConfig = vi.mocked(useConfig);
const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);
// The framework mock wraps the real hook, which would otherwise call the real `openmrsFetch`.
const realUseOpenmrsFetchAll = mockUseOpenmrsFetchAll.getMockImplementation();

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

describe('useVisitNotes', () => {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(SWRConfig, { value: { dedupingInterval: 0, provider: () => new Map() } }, children);

  function visitNoteEncounter(uuid: string, encounterDatetime: string, note: string) {
    return {
      uuid,
      encounterDatetime,
      obs: [{ concept: { uuid: 'note-text-concept' }, value: note, obsDatetime: encounterDatetime }],
      encounterProviders: [],
      diagnoses: [],
    };
  }

  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
    mockUseConfig.mockReturnValue({
      visitNoteConfig: {
        encounterNoteTextConceptUuid: 'note-text-concept',
        encounterTypeUuid: 'visit-note-encounter-type',
        visitDiagnosesConceptUuid: 'visit-diagnoses-concept',
      },
    });
    mockUseOpenmrsFetchAll.mockImplementation((url, options) =>
      realUseOpenmrsFetchAll(url, { ...options, fetcher: mockOpenmrsFetch }),
    );
  });

  it('requests only visit note encounters and loads every page', async () => {
    // The encounter endpoint returns the oldest encounters first, 50 to a page.
    mockOpenmrsFetch.mockImplementation((url: string) =>
      Promise.resolve({
        data: url.includes('startIndex=50')
          ? { results: [visitNoteEncounter('newer', '2026-11-20T10:00:00.000+0000', 'Newer note')], links: [] }
          : {
              results: [visitNoteEncounter('older', '2020-01-15T10:00:00.000+0000', 'Older note')],
              links: [{ rel: 'next', uri: `http://localhost${url.split('?')[0]}?startIndex=50` }],
            },
      } as unknown as Awaited<ReturnType<typeof openmrsFetch>>),
    );

    const { result } = renderHook(() => useVisitNotes('patient-uuid'), { wrapper });

    await waitFor(() => expect(result.current.visitNotes).toHaveLength(2));
    const firstRequest = new URL(mockOpenmrsFetch.mock.calls[0][0] as string, 'http://localhost');
    expect(firstRequest.pathname).toBe(`${restBaseUrl}/encounter`);
    expect(firstRequest.searchParams.get('patient')).toBe('patient-uuid');
    expect(firstRequest.searchParams.get('encounterType')).toBe('visit-note-encounter-type');
    expect(firstRequest.searchParams.has('obs')).toBe(false);
    expect(result.current.visitNotes.map((note) => note.encounterNote)).toEqual(['Newer note', 'Older note']);
  });
});
