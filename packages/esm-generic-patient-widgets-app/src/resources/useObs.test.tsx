import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { useObs } from './useObs';
import { useConcepts } from './useConcepts';

vi.mock('./useConcepts', () => ({
  useConcepts: vi.fn(),
}));

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig);
const mockUseConcepts = vi.mocked(useConcepts);

const weightConceptUuid = '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const obsWithEncounter = {
  resourceType: 'Observation',
  id: 'obs-with-encounter',
  code: { coding: [{ code: weightConceptUuid }] },
  effectiveDateTime: '2021-02-01T00:00:00Z',
  valueQuantity: { value: 72 },
  encounter: { reference: 'Encounter/enc-1' },
};

const obsWithoutEncounter = {
  resourceType: 'Observation',
  id: 'obs-without-encounter',
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
    mockUseConfig.mockReturnValue({
      encounterTypes: [],
      data: [{ concept: weightConceptUuid }],
    });
    mockUseConcepts.mockReturnValue({
      concepts: [{ uuid: weightConceptUuid, display: 'Weight', dataType: 'Numeric' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useConcepts>);
  });

  it('maps obs that have no encounter instead of crashing', async () => {
    const bundle = {
      resourceType: 'Bundle',
      entry: [{ resource: obsWithEncounter }, { resource: obsWithoutEncounter }, { resource: encounterResource }],
    };
    mockOpenmrsFetch.mockResolvedValue({ data: bundle } as never);

    const { result } = renderHook(() => useObs('patient-no-encounter-obs'));

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
});
