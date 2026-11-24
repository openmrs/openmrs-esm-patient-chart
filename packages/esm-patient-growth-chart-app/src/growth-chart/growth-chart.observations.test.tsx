import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type FetchResponse, fhirBaseUrl, openmrsFetch, useFhirFetchAll } from '@openmrs/esm-framework';
import { useObservations } from './growth-chart.resource';

const mockUseFhirFetchAll = vi.mocked(useFhirFetchAll);
const useRealFhirFetchAll = mockUseFhirFetchAll.getMockImplementation()!;
const fetcher = vi.mocked(openmrsFetch);
const firstPageUrl = `${fhirBaseUrl}/Observation?patient=patient-uuid&code=weight-concept&_sort=-date&_count=500`;
const nextPageUrl = `${window.location.origin}/openmrs/ws/fhir2/R4?_getpages=weight-search&_getpagesoffset=1&_count=500`;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

function weight(id: string, effectiveDateTime: string, value: number): fhir.Observation {
  return {
    resourceType: 'Observation',
    id,
    status: 'final',
    code: { coding: [{ code: 'weight-concept' }] },
    effectiveDateTime,
    valueQuantity: { value, unit: 'kg' },
  };
}

function page(resources: fhir.Resource[], nextUrl?: string): FetchResponse<fhir.Bundle> {
  const data: fhir.Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: resources.map((resource) => ({ resource })),
    link: nextUrl ? [{ relation: 'next', url: nextUrl }] : [],
  };
  return { data } as FetchResponse<fhir.Bundle>;
}

beforeEach(() => {
  fetcher.mockReset();
  mockUseFhirFetchAll.mockImplementation(function useFetchAllWithTestFetcher(url, options) {
    return useRealFhirFetchAll(url, { ...options, fetcher });
  });
});

afterEach(() => {
  mockUseFhirFetchAll.mockImplementation(useRealFhirFetchAll);
});

describe('useObservations', () => {
  it.each([
    [undefined, 'weight-concept'],
    ['patient-uuid', undefined],
    [undefined, undefined],
  ])('does not fetch without both identifiers: patient=%s, concept=%s', (patientUuid, conceptUuid) => {
    const { result } = renderHook(() => useObservations(patientUuid, conceptUuid), { wrapper });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.observations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('follows the server next link and maps weights only after the complete history has loaded', async () => {
    const newest = weight('newest', '2024-03-01', 6);
    const oldest = weight('oldest', '2024-01-01', 4);
    let resolveNextPage: (response: FetchResponse<fhir.Bundle>) => void;
    fetcher
      .mockResolvedValueOnce(page([newest, { resourceType: 'Patient', id: 'included-patient' }], nextPageUrl))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNextPage = resolve;
          }),
      );

    const { result } = renderHook(() => useObservations('patient-uuid', 'weight-concept'), { wrapper });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.observations).toEqual([]);

    await act(async () => resolveNextPage(page([oldest])));

    await waitFor(() =>
      expect(result.current.observations).toEqual([
        { id: 'newest', effectiveDateTime: '2024-03-01', value: 6, unit: 'kg', code: 'weight-concept' },
        { id: 'oldest', effectiveDateTime: '2024-01-01', value: 4, unit: 'kg', code: 'weight-concept' },
      ]),
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([firstPageUrl, nextPageUrl]);
  });

  it('refreshes weights from every page after URL-prefix invalidation', async () => {
    const newest = weight('newest', '2024-03-01', 6);
    const oldest = weight('oldest', '2024-01-01', 4);
    fetcher.mockResolvedValueOnce(page([newest], nextPageUrl)).mockResolvedValueOnce(page([oldest]));
    const { result } = renderHook(
      () => ({ weights: useObservations('patient-uuid', 'weight-concept'), mutate: useSWRConfig().mutate }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.weights.observations).toHaveLength(2));

    fetcher.mockClear();
    fetcher
      .mockResolvedValueOnce(page([weight('newest', '2024-03-01', 6.5)], nextPageUrl))
      .mockResolvedValueOnce(page([weight('oldest', '2024-01-01', 4.5)]));
    await act(async () => {
      await result.current.mutate(
        (key) => typeof key === 'string' && key.startsWith(`${fhirBaseUrl}/Observation`),
        undefined,
        { revalidate: true },
      );
    });

    await waitFor(() => expect(result.current.weights.observations.map((obs) => obs.value)).toEqual([6.5, 4.5]));
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([firstPageUrl, nextPageUrl]);
  });

  it('returns no weights when the bundle has no entries', async () => {
    fetcher.mockResolvedValueOnce({
      data: { resourceType: 'Bundle', type: 'searchset', total: 0 },
    } as FetchResponse<fhir.Bundle>);
    const { result } = renderHook(() => useObservations('patient-uuid', 'weight-concept'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.observations).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('surfaces a later-page failure without returning a truncated history', async () => {
    const error = new Error('Next page failed');
    fetcher.mockResolvedValueOnce(page([weight('newest', '2024-03-01', 6)], nextPageUrl)).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useObservations('patient-uuid', 'weight-concept'), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.observations).toEqual([]);
  });
});
