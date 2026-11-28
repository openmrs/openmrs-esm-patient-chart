import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig, useSWRConfig } from 'swr';
import { type FetchResponse, fhirBaseUrl, openmrsFetch, useConfig, useFhirFetchAll } from '@openmrs/esm-framework';
import { useObs } from './useObs';
import { useConcepts } from './useConcepts';

vi.mock('./useConcepts', () => ({
  useConcepts: vi.fn(),
}));

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig);
const mockUseConcepts = vi.mocked(useConcepts);
const mockUseFhirFetchAll = vi.mocked(useFhirFetchAll);
const useRealFhirFetchAll = mockUseFhirFetchAll.getMockImplementation()!;

const weightConceptUuid = '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const firstPageUrl = `${fhirBaseUrl}/Observation?subject:Patient=patient-uuid&code=${weightConceptUuid}&_summary=data&_include=Observation:encounter&_sort=-date&_count=100&encounter.type=encounter-type-uuid-1,encounter-type-uuid-2`;
const nextPageUrl = `${window.location.origin}/openmrs/ws/fhir2/R4?_getpages=widget-search&_getpagesoffset=1&_count=100`;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

function page(resources: fhir.Resource[], nextUrl?: string): FetchResponse<fhir.Bundle> {
  const data: fhir.Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: resources.map((resource) => ({ resource })),
    link: nextUrl ? [{ relation: 'next', url: nextUrl }] : [],
  };
  return { data } as FetchResponse<fhir.Bundle>;
}

const obsWithEncounter = {
  resourceType: 'Observation',
  id: 'obs-with-encounter',
  status: 'final',
  code: { coding: [{ code: weightConceptUuid }] },
  effectiveDateTime: '2021-02-01T00:00:00Z',
  valueQuantity: { value: 72 },
  encounter: { reference: 'Encounter/enc-1' },
};

const obsWithoutEncounter = {
  resourceType: 'Observation',
  id: 'obs-without-encounter',
  status: 'final',
  code: { coding: [{ code: weightConceptUuid }] },
  effectiveDateTime: '2021-01-01T00:00:00Z',
  valueQuantity: { value: 70 },
};

const encounterResource = {
  resourceType: 'Encounter',
  id: 'enc-1',
  type: [{ coding: [{ code: 'encounter-type-uuid-1', display: 'Outpatient Visit' }] }],
};

describe('useObs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenmrsFetch.mockReset();
    mockUseFhirFetchAll.mockImplementation(function useFetchAllWithTestFetcher(url, options) {
      return useRealFhirFetchAll(url, { ...options, fetcher: mockOpenmrsFetch });
    });
    mockUseConfig.mockReturnValue({
      encounterTypes: [],
      data: [{ concept: weightConceptUuid }],
    });
    mockUseConcepts.mockReturnValue({
      concepts: [{ uuid: weightConceptUuid, display: 'Weight', dataType: 'Numeric', answers: [] }],
      isLoading: false,
    });
  });

  afterEach(() => {
    mockUseFhirFetchAll.mockImplementation(useRealFhirFetchAll);
  });

  it('maps obs that have no encounter instead of crashing', async () => {
    mockOpenmrsFetch.mockResolvedValue(page([obsWithEncounter, obsWithoutEncounter, encounterResource]));

    const { result } = renderHook(() => useObs('patient-no-encounter-obs'), { wrapper });

    await waitFor(() => {
      expect(result.current.data.observations).toHaveLength(2);
    });

    const [withEncounter, withoutEncounter] = result.current.data.observations;
    expect(withEncounter.encounter).toEqual({
      reference: 'Encounter/enc-1',
      name: 'Outpatient Visit',
      encounterTypeUuid: 'encounter-type-uuid-1',
    });
    expect(withoutEncounter.encounter).toBeUndefined();

    // The FHIR resources held by the SWR cache must not be mutated.
    expect(obsWithEncounter.encounter).toEqual({ reference: 'Encounter/enc-1' });
  });

  it('loads every page, preserves encounter metadata, and includes each encounter only once', async () => {
    mockUseConfig.mockReturnValue({
      encounterTypes: ['encounter-type-uuid-1', 'encounter-type-uuid-2'],
      data: [{ concept: weightConceptUuid }],
    });
    const sameEncounterObs = { ...obsWithEncounter, id: 'obs-same-encounter' };
    const olderObs = {
      ...obsWithEncounter,
      id: 'older-obs',
      encounter: { reference: 'Encounter/enc-2' },
    };
    const olderEncounter = {
      ...encounterResource,
      id: 'enc-2',
      type: [{ coding: [{ code: 'encounter-type-uuid-2', display: 'Follow-up Visit' }] }],
    };
    let resolveNextPage: (response: FetchResponse<fhir.Bundle>) => void;
    mockOpenmrsFetch
      .mockResolvedValueOnce(page([obsWithEncounter, encounterResource], nextPageUrl))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNextPage = resolve;
          }),
      );

    const { result } = renderHook(() => useObs('patient-uuid'), { wrapper });
    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data.observations).toEqual([]);
    expect(result.current.data.encounters).toEqual([]);

    await act(async () =>
      resolveNextPage(page([sameEncounterObs, olderObs, { ...encounterResource }, olderEncounter])),
    );

    await waitFor(() => expect(result.current.data.observations).toHaveLength(3));
    expect(result.current.data.observations.map((obs) => obs.id)).toEqual([
      'obs-with-encounter',
      'obs-same-encounter',
      'older-obs',
    ]);
    expect(result.current.data.observations.every((obs) => obs.dataType === 'Numeric')).toBe(true);
    expect(result.current.data.observations[2].encounter).toEqual({
      reference: 'Encounter/enc-2',
      name: 'Follow-up Visit',
      encounterTypeUuid: 'encounter-type-uuid-2',
    });
    expect(result.current.data.encounters).toEqual([
      { reference: 'Encounter/enc-1', display: 'Outpatient Visit', encounterTypeUuid: 'encounter-type-uuid-1' },
      { reference: 'Encounter/enc-2', display: 'Follow-up Visit', encounterTypeUuid: 'encounter-type-uuid-2' },
    ]);
    expect(result.current.isLoading).toBe(false);
    expect(mockOpenmrsFetch.mock.calls.map(([url]) => url)).toEqual([firstPageUrl, nextPageUrl]);
  });

  it.each(['bound mutate', 'URL-prefix invalidation'])(
    'refreshes observations from every page with %s',
    async (refresh) => {
      mockOpenmrsFetch
        .mockResolvedValueOnce(page([obsWithEncounter, encounterResource], nextPageUrl))
        .mockResolvedValueOnce(page([obsWithoutEncounter]));
      const { result } = renderHook(() => ({ ...useObs('patient-uuid'), globalMutate: useSWRConfig().mutate }), {
        wrapper,
      });
      await waitFor(() => expect(result.current.data.observations).toHaveLength(2));

      mockOpenmrsFetch.mockClear();
      mockOpenmrsFetch
        .mockResolvedValueOnce(
          page([{ ...obsWithEncounter, valueQuantity: { value: 73 } }, encounterResource], nextPageUrl),
        )
        .mockResolvedValueOnce(page([{ ...obsWithoutEncounter, valueQuantity: { value: 71 } }]));
      await act(async () => {
        if (refresh === 'bound mutate') {
          await result.current.mutate();
        } else {
          await result.current.globalMutate(
            (key) => typeof key === 'string' && key.startsWith(`${fhirBaseUrl}/Observation`),
            undefined,
            { revalidate: true },
          );
        }
      });

      await waitFor(() =>
        expect(result.current.data.observations.map((obs) => obs.valueQuantity.value)).toEqual([73, 71]),
      );
      expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2);
    },
  );

  it('returns empty observations and encounters for an empty bundle', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({
      data: { resourceType: 'Bundle', type: 'searchset', total: 0 },
    } as FetchResponse<fhir.Bundle>);
    const { result } = renderHook(() => useObs('patient-uuid'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.observations).toEqual([]);
    expect(result.current.data.encounters).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('surfaces a later-page failure without exposing incomplete results', async () => {
    const error = new Error('Next page failed');
    mockOpenmrsFetch
      .mockResolvedValueOnce(page([obsWithEncounter, encounterResource], nextPageUrl))
      .mockRejectedValueOnce(error);
    const { result } = renderHook(() => useObs('patient-uuid'), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data.observations).toEqual([]);
    expect(result.current.data.encounters).toEqual([]);
  });
});
