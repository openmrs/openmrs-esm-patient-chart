import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type FetchResponse, fhirBaseUrl, useFhirFetchAll } from '@openmrs/esm-framework';
import { type FHIRObservationResource } from '../../types';
import { useObservations } from './usePanelData';

const mockUseFhirFetchAll = vi.mocked(useFhirFetchAll);
const useRealFhirFetchAll = mockUseFhirFetchAll.getMockImplementation()!;
const fetcher = vi.fn<(url: string) => Promise<FetchResponse<fhir.Bundle>>>();
const firstPageUrl = `${fhirBaseUrl}/Observation?category=laboratory&patient=patient-uuid&_count=100`;
const nextPageUrl = `${window.location.origin}/openmrs/ws/fhir2/R4?_getpages=search-id&_getpagesoffset=2&_count=100`;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

function observation(id: string, conceptUuid: string, effectiveDateTime: string): FHIRObservationResource {
  return {
    resourceType: 'Observation',
    id,
    category: [],
    code: { coding: [{ code: conceptUuid, display: conceptUuid }], text: conceptUuid },
    effectiveDateTime,
    issued: effectiveDateTime,
    referenceRange: [],
  };
}

function page(observations: FHIRObservationResource[], nextUrl?: string): FetchResponse<fhir.Bundle> {
  const data: fhir.Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: observations.map((resource) => ({ resource })),
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
  it('waits for a patient before fetching observations', () => {
    const { result } = renderHook(() => useObservations(''), { wrapper });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current).toEqual({ observations: null, conceptUuids: null, isLoading: false });
  });

  it('follows the server next link and sorts the complete collection before deriving concept UUIDs', async () => {
    const oldest = observation('oldest', 'concept-a', '2024-01-01T00:00:00Z');
    const newest = observation('newest', 'concept-b', '2024-03-01T00:00:00Z');
    const middle = observation('middle', 'concept-a', '2024-02-01T00:00:00Z');
    let resolveNextPage: (response: FetchResponse<fhir.Bundle>) => void;
    fetcher.mockResolvedValueOnce(page([oldest, newest], nextPageUrl)).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveNextPage = resolve;
        }),
    );

    const { result } = renderHook(() => useObservations('patient-uuid'), { wrapper });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(result.current).toEqual({ observations: null, conceptUuids: null, isLoading: true });

    await act(async () => resolveNextPage(page([middle])));

    await waitFor(() => expect(result.current.observations).toEqual([newest, middle, oldest]));
    expect(result.current.conceptUuids).toEqual(['concept-b', 'concept-a']);
    expect(result.current.isLoading).toBe(false);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([firstPageUrl, nextPageUrl]);
  });

  it('refreshes observations from every page after URL-prefix invalidation', async () => {
    const first = observation('first', 'concept-a', '2024-01-01T00:00:00Z');
    const second = observation('second', 'concept-b', '2024-02-01T00:00:00Z');
    fetcher.mockResolvedValueOnce(page([first], nextPageUrl)).mockResolvedValueOnce(page([second]));
    const { result } = renderHook(
      () => ({ observations: useObservations('patient-uuid'), mutate: useSWRConfig().mutate }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.observations.observations).toEqual([second, first]));

    const updatedFirst = { ...first, valueString: 'updated first page' };
    const updatedSecond = { ...second, valueString: 'updated second page' };
    fetcher.mockClear();
    fetcher.mockResolvedValueOnce(page([updatedFirst], nextPageUrl)).mockResolvedValueOnce(page([updatedSecond]));
    await act(async () => {
      await result.current.mutate(
        (key) => typeof key === 'string' && key.startsWith(`${fhirBaseUrl}/Observation`),
        undefined,
        { revalidate: true },
      );
    });

    await waitFor(() => expect(result.current.observations.observations).toEqual([updatedSecond, updatedFirst]));
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([firstPageUrl, nextPageUrl]);
  });

  it('returns an empty collection when the bundle has no entries', async () => {
    fetcher.mockResolvedValueOnce({
      data: { resourceType: 'Bundle', type: 'searchset', total: 0 },
    } as FetchResponse<fhir.Bundle>);
    const { result } = renderHook(() => useObservations('patient-uuid'), { wrapper });

    await waitFor(() => expect(result.current.observations).toEqual([]));
    expect(result.current.conceptUuids).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('stops loading without returning an incomplete collection when a later page fails', async () => {
    fetcher
      .mockResolvedValueOnce(page([observation('first', 'concept-a', '2024-01-01T00:00:00Z')], nextPageUrl))
      .mockRejectedValueOnce(new Error('Next page failed'));
    const { result } = renderHook(() => useObservations('patient-uuid'), { wrapper });

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.observations).toBeNull();
    expect(result.current.conceptUuids).toBeNull();
  });
});
