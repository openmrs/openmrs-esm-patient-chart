import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type PatientData } from '@openmrs/esm-patient-common-lib';
import { addUserDataToCache } from './helpers';
import usePatientResultsData from './usePatientResultsData';

describe('Laboratory results refresh failures', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const cachedData: PatientData = {
    Hemoglobin: { entries: [], type: 'Test', uuid: 'hemoglobin-concept' },
  };

  it('keeps cached results and reports an HTTP failure when checking for newer observations', async () => {
    const patientUuid = 'patient-with-failed-cache-check';
    addUserDataToCache(patientUuid, cachedData, 'cached-observation');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' }));

    const { result } = renderHook(() => usePatientResultsData(patientUuid));

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.sortedObs).toBe(cachedData);
    expect(result.current.loaded).toBe(true);
    expect(result.current.error).toEqual(
      new Error('Failed to fetch laboratory observations: 500 Internal Server Error'),
    );
  });

  it('keeps cached results when loading newer observations fails', async () => {
    const patientUuid = 'patient-with-failed-results-refresh';
    addUserDataToCache(patientUuid, cachedData, 'cached-observation');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ entry: [{ resource: { id: 'new-observation' } }] }) })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' }),
    );

    const { result } = renderHook(() => usePatientResultsData(patientUuid));

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.sortedObs).toBe(cachedData);
    expect(result.current.loaded).toBe(true);
  });

  it('does not retain another patient’s results when an uncached patient request fails', async () => {
    const patientUuid = 'patient-before-switch';
    addUserDataToCache(patientUuid, cachedData, 'cached-observation');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ entry: [{ resource: { id: 'cached-observation' } }] }),
        })
        .mockResolvedValueOnce({ ok: false, status: 403, statusText: 'Forbidden' }),
    );
    const { result, rerender } = renderHook(({ uuid }) => usePatientResultsData(uuid), {
      initialProps: { uuid: patientUuid },
    });
    await waitFor(() => expect(result.current.sortedObs).toBe(cachedData));

    rerender({ uuid: 'uncached-patient-with-failed-request' });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.sortedObs).toEqual({});
    expect(result.current.loaded).toBe(true);
  });
});
