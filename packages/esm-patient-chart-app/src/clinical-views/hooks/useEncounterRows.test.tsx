import { renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEncounterRows } from './useEncounterRows';

vi.mock('swr', () => ({
  default: vi.fn(),
}));

const mockUseSWR = vi.mocked(useSWR);
const mutate = vi.fn();

const olderEncounter = {
  uuid: 'encounter-old',
  encounterDatetime: '2026-01-01T10:00:00.000Z',
};

const newerEncounter = {
  uuid: 'encounter-new',
  encounterDatetime: '2026-02-01T10:00:00.000Z',
};

describe('useEncounterRows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not keep encounters from the previous patient while the next patient is loading', () => {
    mockUseSWR.mockImplementation((key) => {
      const url = String(key);
      if (url.includes('patient=patient-a')) {
        return {
          data: { data: { results: [olderEncounter], totalCount: 1 } },
          error: undefined,
          isLoading: false,
          mutate,
        } as any;
      }

      return {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate,
      } as any;
    });

    const { result, rerender } = renderHook(
      ({ patientUuid }) => useEncounterRows(patientUuid, 'encounter-type', undefined, undefined, 10, 1),
      { initialProps: { patientUuid: 'patient-a' } },
    );

    expect(result.current.encounters).toEqual([olderEncounter]);

    rerender({ patientUuid: 'patient-b' });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.encounters).toEqual([]);
    expect(result.current.total).toBeUndefined();
  });

  it('sorts a copy instead of mutating the SWR response', () => {
    const results = [olderEncounter, newerEncounter];

    mockUseSWR.mockReturnValue({
      data: { data: { results, totalCount: 2 } },
      error: undefined,
      isLoading: false,
      mutate,
    } as any);

    const { result } = renderHook(() =>
      useEncounterRows('patient-a', 'encounter-type', undefined, undefined, 10, 1),
    );

    expect(result.current.encounters.map((encounter) => encounter.uuid)).toEqual(['encounter-new', 'encounter-old']);
    expect(results.map((encounter) => encounter.uuid)).toEqual(['encounter-old', 'encounter-new']);
  });
});
