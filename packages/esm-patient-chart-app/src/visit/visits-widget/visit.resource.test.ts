import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useOpenmrsInfinite, useOpenmrsPagination } from '@openmrs/esm-framework';
import { useInfiniteVisits, usePaginatedVisits } from './visit.resource';

const mockUseOpenmrsInfinite = vi.mocked(useOpenmrsInfinite);
const mockUseOpenmrsPagination = vi.mocked(useOpenmrsPagination);

describe('visit resource', () => {
  it('requests infinite visits from the visit endpoint without a repeated slash', () => {
    mockUseOpenmrsInfinite.mockReturnValue({ data: [], mutate: vi.fn() } as unknown as ReturnType<
      typeof useOpenmrsInfinite
    >);

    renderHook(() => useInfiniteVisits('patient-uuid'));

    const url = mockUseOpenmrsInfinite.mock.calls[0][0] as URL;
    expect(url.pathname).toBe('/openmrs/ws/rest/v1/visit');
    expect(url.searchParams.get('patient')).toBe('patient-uuid');
  });

  it('requests paginated visits from the visit endpoint without a repeated slash', () => {
    mockUseOpenmrsPagination.mockReturnValue({} as ReturnType<typeof useOpenmrsPagination>);

    renderHook(() => usePaginatedVisits('patient-uuid', 10));

    const url = mockUseOpenmrsPagination.mock.calls[0][0] as URL;
    expect(url.pathname).toBe('/openmrs/ws/rest/v1/visit');
    expect(url.searchParams.get('patient')).toBe('patient-uuid');
  });
});
