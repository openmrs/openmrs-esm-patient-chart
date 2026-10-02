import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useDiagnosisConceptClasses } from './visit-notes.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

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
