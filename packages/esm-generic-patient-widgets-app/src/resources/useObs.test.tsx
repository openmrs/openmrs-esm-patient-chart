import { renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { fhirBaseUrl, useConfig } from '@openmrs/esm-framework';
import { useObs } from './useObs';
import { useConcepts } from './useConcepts';

jest.mock('swr', () => jest.fn());

jest.mock('@openmrs/esm-framework', () => ({
  fhirBaseUrl: '/ws/fhir2/R4',
  openmrsFetch: jest.fn(),
  useConfig: jest.fn(),
}));

jest.mock('./useConcepts', () => ({
  useConcepts: jest.fn(),
}));

const mockUseSWR = jest.mocked(useSWR);
const mockUseConfig = jest.mocked(useConfig);
const mockUseConcepts = jest.mocked(useConcepts);

const mockObservationEntries = [
  {
    resource: {
      resourceType: 'Observation',
      id: 'obs-2',
      effectiveDateTime: '2021-02-01T00:00:00Z',
      code: {
        coding: [{ code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }],
      },
      encounter: { reference: 'Encounter/enc-2' },
      valueQuantity: { value: 182 },
    },
  },
  {
    resource: {
      resourceType: 'Observation',
      id: 'obs-1',
      effectiveDateTime: '2021-01-01T00:00:00Z',
      code: {
        coding: [{ code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }],
      },
      encounter: { reference: 'Encounter/enc-1' },
      valueQuantity: { value: 180 },
    },
  },
  {
    resource: {
      resourceType: 'Encounter',
      id: 'enc-1',
      type: [{ coding: [{ code: 'enc-type-1', display: 'Consultation' }] }],
    },
  },
  {
    resource: {
      resourceType: 'Encounter',
      id: 'enc-2',
      type: [{ coding: [{ code: 'enc-type-2', display: 'Follow-up' }] }],
    },
  },
];

describe('useObs', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConfig.mockReturnValue({
      encounterTypes: [],
      data: [{ concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }],
    } as any);

    mockUseConcepts.mockReturnValue({
      concepts: [{ uuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Height', dataType: 'Numeric' }],
    } as any);

    mockUseSWR.mockReturnValue({
      data: {
        data: {
          entry: mockObservationEntries,
        },
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);
  });

  it('requests newest-first sorting by default', () => {
    renderHook(() => useObs('patient-123'));

    expect(mockUseSWR).toHaveBeenCalledWith(
      `${fhirBaseUrl}/Observation?subject:Patient=patient-123&code=5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&_summary=data&_include=Observation:encounter&_sort=-date&_count=100`,
      expect.anything(),
    );
  });

  it('requests oldest-first sorting when configured by the caller', () => {
    renderHook(() => useObs('patient-123', { oldestFirst: true }));

    expect(mockUseSWR).toHaveBeenCalledWith(
      `${fhirBaseUrl}/Observation?subject:Patient=patient-123&code=5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&_summary=data&_include=Observation:encounter&_sort=date&_count=100`,
      expect.anything(),
    );
  });

  it('returns observations oldest-first when requested', () => {
    const { result } = renderHook(() => useObs('patient-123', { oldestFirst: true }));

    expect(result.current.data.observations.map((obs) => obs.id)).toEqual(['obs-1', 'obs-2']);
    expect(result.current.data.observations[0].encounter).toEqual(
      expect.objectContaining({
        reference: 'Encounter/enc-1',
        name: 'Consultation',
        encounterTypeUuid: 'enc-type-1',
      }),
    );
  });

  it('returns observations newest-first by default', () => {
    const { result } = renderHook(() => useObs('patient-123'));

    expect(result.current.data.observations.map((obs) => obs.id)).toEqual(['obs-2', 'obs-1']);
  });
});
