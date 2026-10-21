import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type Key, SWRConfig, useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { fhirBaseUrl, restBaseUrl } from '@openmrs/esm-framework';
import { invalidateCachedVitalsAndBiometrics } from './data.resource';

const patientUuid = 'growth-chart-patient';
const observationsUrl = `${fhirBaseUrl}/Observation?patient=${patientUuid}&code=weight&_sort=-date&_count=500`;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

function useObservationCache(key: Key, fetcher: () => Promise<number[]>) {
  const { mutate } = useSWRConfig();
  const response = useSWRImmutable<number[]>(key, fetcher);
  return { ...response, invalidate: () => invalidateCachedVitalsAndBiometrics(patientUuid, mutate) };
}

describe('invalidateCachedVitalsAndBiometrics', () => {
  it.each([
    ['recording a weight', [12.5, 15]],
    ['editing a weight', [13]],
    ['deleting a weight', []],
  ])('refreshes the growth chart observation cache after %s', async (_, updatedWeights) => {
    const fetcher = vi.fn().mockResolvedValue([12.5]);
    const { result } = renderHook(() => useObservationCache(observationsUrl, fetcher), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([12.5]));
    fetcher.mockResolvedValue(updatedWeights);

    await act(async () => {
      await result.current.invalidate();
    });

    await waitFor(() => expect(result.current.data).toEqual(updatedWeights));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('finds the patient parameter regardless of its position in the query', async () => {
    const url = `${fhirBaseUrl}/Observation?code=weight&_count=500&patient=${patientUuid}`;
    const fetcher = vi.fn().mockResolvedValue([12.5]);
    const { result } = renderHook(() => useObservationCache(url, fetcher), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([12.5]));
    fetcher.mockResolvedValue([15]);

    await act(async () => {
      await result.current.invalidate();
    });

    await waitFor(() => expect(result.current.data).toEqual([15]));
  });

  it.each([
    ['another patient', `${fhirBaseUrl}/Observation?patient=another-patient&code=weight`],
    ['a patient UUID with the same prefix', `${fhirBaseUrl}/Observation?patient=${patientUuid}-other&code=weight`],
    ['a different FHIR resource', `${fhirBaseUrl}/Encounter?patient=${patientUuid}`],
    ['a REST observation query', `${restBaseUrl}/obs?patient=${patientUuid}`],
    ['an observation read by ID', `${fhirBaseUrl}/Observation/observation-uuid`],
    ['the WHO reference data', ['growthChartReferenceSeries', 'male']],
    ['an object cache key', { url: observationsUrl }],
  ])('does not revalidate %s', async (_, key) => {
    const fetcher = vi.fn().mockResolvedValue([12.5]);
    const { result } = renderHook(() => useObservationCache(key, fetcher), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([12.5]));

    await act(async () => {
      await result.current.invalidate();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([12.5]);
  });
});
