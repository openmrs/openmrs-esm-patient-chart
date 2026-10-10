import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type PatientData } from '@openmrs/esm-patient-common-lib';
import { addUserDataToCache } from './helpers';
import usePatientResultsData from './usePatientResultsData';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

describe('Laboratory results refresh failures', () => {
  afterEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  const cachedData: PatientData = {
    Hemoglobin: { entries: [], type: 'Test', uuid: 'hemoglobin-concept' },
  };

  it('keeps cached results and reports a failure when checking for newer observations', async () => {
    const patientUuid = 'patient-with-failed-cache-check';
    const error = Object.assign(new Error('Internal Server Error'), {
      response: { status: 500, statusText: 'Internal Server Error' },
    });
    addUserDataToCache(patientUuid, cachedData, 'cached-observation');
    mockOpenmrsFetch.mockRejectedValue(error as any);

    const { result } = renderHook(() => usePatientResultsData(patientUuid));

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.sortedObs).toBe(cachedData);
    expect(result.current.loaded).toBe(true);
  });

  it('keeps cached results when loading newer observations fails', async () => {
    const patientUuid = 'patient-with-failed-results-refresh';
    const error = Object.assign(new Error('Service Unavailable'), {
      response: { status: 503, statusText: 'Service Unavailable' },
    });
    addUserDataToCache(patientUuid, cachedData, 'cached-observation');
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: { entry: [{ resource: { id: 'new-observation' } }] } } as any)
      .mockRejectedValueOnce(error as any);

    const { result } = renderHook(() => usePatientResultsData(patientUuid));

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.sortedObs).toBe(cachedData);
    expect(result.current.loaded).toBe(true);
  });

  it('does not retain another patient’s results when an uncached patient request fails', async () => {
    const patientUuid = 'patient-before-switch';
    const error = Object.assign(new Error('Forbidden'), {
      response: { status: 403, statusText: 'Forbidden' },
    });
    addUserDataToCache(patientUuid, cachedData, 'cached-observation');
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: { entry: [{ resource: { id: 'cached-observation' } }] } } as any)
      .mockRejectedValueOnce(error as any);

    const { result, rerender } = renderHook(({ uuid }) => usePatientResultsData(uuid), {
      initialProps: { uuid: patientUuid },
    });
    await waitFor(() => expect(result.current.sortedObs).toBe(cachedData));

    rerender({ uuid: 'uncached-patient-with-failed-request' });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.sortedObs).toEqual({});
    expect(result.current.loaded).toBe(true);
  });
});
