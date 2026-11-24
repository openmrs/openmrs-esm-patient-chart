import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type FetchResponse,
  fhirBaseUrl,
  openmrsFetch,
  restBaseUrl,
  useConfig,
  useFhirFetchAll,
} from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { type FHIRObservationResource } from './types';
import { invalidateCachedVitalsAndBiometrics, useVitalsAndBiometrics } from './data.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig);
const mockUseFhirFetchAll = vi.mocked(useFhirFetchAll);
const useRealFhirFetchAll = mockUseFhirFetchAll.getMockImplementation()!;
const observationFetcher = vi.fn<(url: string) => Promise<FetchResponse<fhir.Bundle>>>();
const nextPageUrl = `${window.location.origin}/openmrs/ws/fhir2/R4?_getpages=vitals-search&_getpagesoffset=1&_count=100`;
const concepts: ConfigObject['concepts'] = {
  systolicBloodPressureUuid: 'systolic',
  diastolicBloodPressureUuid: 'diastolic',
  pulseUuid: 'pulse',
  temperatureUuid: 'temperature',
  oxygenSaturationUuid: 'spo2',
  respiratoryRateUuid: 'respiratory-rate',
  heightUuid: 'height',
  weightUuid: 'weight',
  midUpperArmCircumferenceUuid: 'muac',
  bodyMassIndexUuid: 'bmi',
  generalPatientNoteUuid: 'note',
  vitalSignsConceptSetUuid: 'vitals-concept-set',
};
let notes: FHIRObservationResource[];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

function response<T>(data: T): FetchResponse<T> {
  return { data } as FetchResponse<T>;
}

function page(resources: FHIRObservationResource[], nextUrl?: string): FetchResponse<fhir.Bundle> {
  const data: fhir.Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: resources.map((resource) => ({ resource })),
    link: nextUrl ? [{ relation: 'next', url: nextUrl }] : [],
  };
  return response(data);
}

function observation(
  encounterId: string,
  concept: string,
  value: number,
  date: string,
  overrides: Partial<FHIRObservationResource> = {},
): FHIRObservationResource {
  return {
    resourceType: 'Observation',
    id: `${encounterId}-${concept}`,
    category: [],
    code: { coding: [{ code: concept, display: concept }], text: concept },
    encounter: { reference: `Encounter/${encounterId}`, type: 'Encounter' },
    effectiveDateTime: date,
    issued: date,
    valueQuantity: { value, unit: '', system: '', code: '' },
    referenceRange: [],
    ...overrides,
  };
}

beforeEach(() => {
  notes = [];
  mockUseConfig.mockReturnValue({ concepts });
  observationFetcher.mockReset().mockResolvedValue(page([]));
  mockOpenmrsFetch.mockReset().mockImplementation((url) => {
    if (url.startsWith(`${restBaseUrl}/conceptreferencerange/`)) {
      return Promise.resolve(response({ results: [] }));
    }
    if (new URL(url, window.location.origin).searchParams.get('code') === concepts.generalPatientNoteUuid) {
      return Promise.resolve(page(notes));
    }
    return observationFetcher(url);
  });
  mockUseFhirFetchAll.mockImplementation(function useFetchAllWithTestFetcher(url, options) {
    return useRealFhirFetchAll(url, { ...options, fetcher: mockOpenmrsFetch });
  });
});

afterEach(() => {
  mockUseFhirFetchAll.mockImplementation(useRealFhirFetchAll);
});

describe('useVitalsAndBiometrics pagination', () => {
  it('does not fetch without a patient', () => {
    const { result } = renderHook(() => useVitalsAndBiometrics(''), { wrapper });

    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it.each([
    ['vitals', ['systolic', 'diastolic', 'pulse', 'temperature', 'spo2', 'respiratory-rate']],
    ['biometrics', ['height', 'weight', 'muac', 'bmi']],
    [
      'both',
      ['systolic', 'diastolic', 'pulse', 'temperature', 'spo2', 'respiratory-rate', 'height', 'weight', 'muac', 'bmi'],
    ],
  ] as const)('preserves the concept filter and query settings for %s', async (mode, expectedConcepts) => {
    const { result } = renderHook(() => useVitalsAndBiometrics('patient-uuid', mode), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual([]));

    expect(observationFetcher).toHaveBeenCalledTimes(1);
    const url = new URL(observationFetcher.mock.calls[0][0], window.location.origin);
    expect(url.pathname).toBe(`${fhirBaseUrl}/Observation`);
    expect(url.searchParams.get('subject:Patient')).toBe('patient-uuid');
    expect(url.searchParams.get('code').split(',').sort()).toEqual([...expectedConcepts].sort());
    expect(url.searchParams.get('_summary')).toBe('data');
    expect(url.searchParams.get('_sort')).toBe('-date');
    expect(url.searchParams.get('_count')).toBe('100');
  });

  it('follows server links and combines encounters and interpretations across page boundaries', async () => {
    const systolic = observation('newest', 'systolic', 160, '2024-03-01', {
      interpretation: [{ coding: [{ code: 'H', display: 'High', system: 'interpretation' }], text: 'High' }],
    });
    const diastolic = observation('newest', 'diastolic', 80, '2024-03-01');
    const olderPulse = observation('older', 'pulse', 90, '2024-02-01', {
      referenceRange: [
        {
          high: { value: 80 },
          type: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning', code: 'normal' }],
          },
        },
      ],
    });
    notes = [
      observation('older', 'note', 0, '2024-02-01', { valueQuantity: undefined, valueString: 'Older note' }),
      observation('note-only', 'note', 0, '2024-01-01', {
        valueQuantity: undefined,
        valueString: 'Note without vitals',
      }),
    ];
    let resolveNextPage: (value: FetchResponse<fhir.Bundle>) => void;
    observationFetcher.mockResolvedValueOnce(page([systolic], nextPageUrl)).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveNextPage = resolve;
        }),
    );

    const { result } = renderHook(() => useVitalsAndBiometrics('patient-uuid'), { wrapper });
    await waitFor(() => expect(observationFetcher).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await act(async () => resolveNextPage(page([diastolic, olderPulse])));

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.data).toMatchObject([
      { id: 'newest', date: '2024-03-01', systolic: 160, diastolic: 80, bloodPressureRenderInterpretation: 'high' },
      { id: 'older', date: '2024-02-01', pulse: 90, pulseRenderInterpretation: 'high', note: 'Older note' },
    ]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(observationFetcher.mock.calls[1][0]).toBe(nextPageUrl);
    expect(observationFetcher).toHaveBeenCalledTimes(2);
  });

  it('calculates BMI across pages while retaining a persisted BMI and its interpretation', async () => {
    observationFetcher
      .mockResolvedValueOnce(page([observation('newest', 'weight', 80, '2024-03-01')], nextPageUrl))
      .mockResolvedValueOnce(
        page([
          observation('newest', 'height', 200, '2024-03-01'),
          observation('older', 'weight', 80, '2024-02-01'),
          observation('older', 'height', 200, '2024-02-01'),
          observation('older', 'bmi', 19.4, '2024-02-01', {
            interpretation: [{ coding: [{ code: 'L', display: 'Low', system: 'interpretation' }], text: 'Low' }],
          }),
        ]),
      );
    const { result } = renderHook(() => useVitalsAndBiometrics('patient-uuid', 'biometrics'), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.data).toMatchObject([
      { id: 'newest', weight: 80, height: 200, bmi: 20 },
      { id: 'older', weight: 80, height: 200, bmi: 19.4, bmiRenderInterpretation: 'low' },
    ]);
  });

  it.each(['bound mutate', 'save/delete invalidation', 'URL-prefix invalidation'])(
    'refreshes every page with %s',
    async (refresh) => {
      observationFetcher
        .mockResolvedValueOnce(page([observation('newest', 'pulse', 72, '2024-03-01')], nextPageUrl))
        .mockResolvedValueOnce(page([observation('older', 'pulse', 65, '2024-02-01')]));
      const { result } = renderHook(
        () => ({ ...useVitalsAndBiometrics('patient-uuid'), globalMutate: useSWRConfig().mutate }),
        { wrapper },
      );
      await waitFor(() => expect(result.current.data).toHaveLength(2));

      observationFetcher.mockClear();
      observationFetcher
        .mockResolvedValueOnce(page([observation('newest', 'pulse', 73, '2024-03-01')], nextPageUrl))
        .mockResolvedValueOnce(page([observation('older', 'pulse', 66, '2024-02-01')]));
      await act(async () => {
        if (refresh === 'bound mutate') {
          await result.current.mutate();
        } else if (refresh === 'save/delete invalidation') {
          await invalidateCachedVitalsAndBiometrics();
        } else {
          await result.current.globalMutate(
            (key) => typeof key === 'string' && key.startsWith(`${fhirBaseUrl}/Observation`),
            undefined,
            { revalidate: true },
          );
        }
      });

      await waitFor(() => expect(result.current.data?.map((row) => row.pulse)).toEqual([73, 66]));
      expect(observationFetcher).toHaveBeenCalledTimes(2);
    },
  );

  it('returns an empty collection when the bundle has no entries', async () => {
    observationFetcher.mockResolvedValueOnce(response({ resourceType: 'Bundle', type: 'searchset', total: 0 }));
    const { result } = renderHook(() => useVitalsAndBiometrics('patient-uuid'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('surfaces a later-page failure without returning incomplete encounters', async () => {
    const error = new Error('Next page failed');
    observationFetcher
      .mockResolvedValueOnce(page([observation('newest', 'pulse', 72, '2024-03-01')], nextPageUrl))
      .mockRejectedValueOnce(error);
    const { result } = renderHook(() => useVitalsAndBiometrics('patient-uuid'), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('clears the previous patient data when the patient changes', async () => {
    observationFetcher.mockResolvedValueOnce(page([observation('patient-a-encounter', 'pulse', 72, '2024-03-01')]));
    const { result, rerender } = renderHook(({ patientUuid }) => useVitalsAndBiometrics(patientUuid), {
      wrapper,
      initialProps: { patientUuid: 'patient-a' },
    });
    await waitFor(() => expect(result.current.data?.[0]?.id).toBe('patient-a-encounter'));

    observationFetcher.mockResolvedValueOnce(page([observation('patient-b-encounter', 'pulse', 65, '2024-03-01')]));
    rerender({ patientUuid: 'patient-b' });
    expect(result.current.data).toBeUndefined();
    await waitFor(() => expect(result.current.data?.[0]?.id).toBe('patient-b-encounter'));
  });
});
