import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { useOpenmrsInfinite, useOpenmrsPagination } from '@openmrs/esm-framework';
import { useInfiniteVisits, usePaginatedVisits } from './visit.resource';

const mockUseOpenmrsInfinite = vi.mocked(useOpenmrsInfinite);
const mockUseOpenmrsPagination = vi.mocked(useOpenmrsPagination);

const visitPaths = [
  ['/openmrs', '/openmrs/ws/rest/v1/visit'],
  ['/openmrs/', '/openmrs/ws/rest/v1/visit'],
  ['/', '/ws/rest/v1/visit'],
];

describe('visit resource', () => {
  const originalOpenmrsBase = window.openmrsBase;

  afterEach(() => {
    window.openmrsBase = originalOpenmrsBase;
  });

  it.each(visitPaths)(
    'requests infinite visits from the visit endpoint without a repeated slash when openmrsBase is %s',
    (openmrsBase, path) => {
      window.openmrsBase = openmrsBase;
      mockUseOpenmrsInfinite.mockReturnValue({ data: [], mutate: vi.fn() } as unknown as ReturnType<
        typeof useOpenmrsInfinite
      >);

      renderHook(() => useInfiniteVisits('patient-uuid'));

      const url = mockUseOpenmrsInfinite.mock.calls[0][0] as URL;
      expect(url.pathname).toBe(path);
      expect(url.searchParams.get('patient')).toBe('patient-uuid');
    },
  );

  it.each(visitPaths)(
    'requests paginated visits from the visit endpoint without a repeated slash when openmrsBase is %s',
    (openmrsBase, path) => {
      window.openmrsBase = openmrsBase;
      mockUseOpenmrsPagination.mockReturnValue({} as ReturnType<typeof useOpenmrsPagination>);

      renderHook(() => usePaginatedVisits('patient-uuid', 10));

      const url = mockUseOpenmrsPagination.mock.calls[0][0] as URL;
      expect(url.pathname).toBe(path);
      expect(url.searchParams.get('patient')).toBe('patient-uuid');
    },
  );
});
