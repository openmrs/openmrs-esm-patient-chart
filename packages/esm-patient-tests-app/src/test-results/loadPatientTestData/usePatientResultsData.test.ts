import { act, renderHook, waitFor } from '@testing-library/react';
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
  it('ignores a late failure from patient A after switching to patient B', async () => {
    const patientA = 'patient-a-pending-refresh';
    const patientB = 'patient-b-after-switch';
    const patientBData: PatientData = {
      Sodium: { entries: [], type: 'Test', uuid: 'sodium-concept' },
    };
    let rejectPatientA!: (reason: Error) => void;
    const patientAPending = new Promise<never>((_resolve, reject) => {
      rejectPatientA = reject;
    });
    addUserDataToCache(patientA, cachedData, 'cached-observation');
    addUserDataToCache(patientB, patientBData, 'cached-observation');
    mockOpenmrsFetch
      .mockImplementationOnce(() => patientAPending)
      .mockResolvedValueOnce({ data: { entry: [{ resource: { id: 'cached-observation' } }] } } as any);

    const { result, rerender } = renderHook(({ uuid }) => usePatientResultsData(uuid), {
      initialProps: { uuid: patientA },
    });
    await waitFor(() => expect(result.current.sortedObs).toBe(cachedData));

    rerender({ uuid: patientB });
    await waitFor(() => expect(result.current.sortedObs).toBe(patientBData));

    await act(async () => {
      rejectPatientA(new Error('Late failure from patient A'));
      await patientAPending.catch(() => undefined);
    });

    expect(result.current.sortedObs).toBe(patientBData);
    expect(result.current.error).toBeUndefined();
    expect(result.current.loaded).toBe(true);
  });

  it('ignores a late success from patient A after switching to patient B', async () => {
    const patientA = 'patient-a-pending-success';
    const patientB = 'patient-b-no-cache';
    let resolvePatientA!: (value: any) => void;
    const patientAPending = new Promise<any>((resolve) => {
      resolvePatientA = resolve;
    });
    addUserDataToCache(patientA, cachedData, 'cached-observation');
    mockOpenmrsFetch
      .mockImplementationOnce(() => patientAPending)
      .mockResolvedValueOnce({ data: { total: 0 } } as any);

    const { result, rerender } = renderHook(({ uuid }) => usePatientResultsData(uuid), {
      initialProps: { uuid: patientA },
    });
    await waitFor(() => expect(result.current.sortedObs).toBe(cachedData));

    rerender({ uuid: patientB });
    await waitFor(() => expect(result.current.sortedObs).toEqual({}));

    await act(async () => {
      resolvePatientA({ data: { entry: [{ resource: { id: 'stale-observation' } }] } });
      await patientAPending;
    });

    expect(result.current.sortedObs).toEqual({});
    expect(result.current.error).toBeUndefined();
  });

});
