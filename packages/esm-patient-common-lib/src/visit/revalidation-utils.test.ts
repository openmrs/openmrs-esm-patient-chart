import { vi, describe, it, expect } from 'vitest';
import { invalidateVisits, invalidatePatientEncounters, invalidateVisitAndEncounterData } from './revalidation-utils';

const mockMutate = vi.fn();

describe('revalidation-utils', () => {
  describe('invalidateVisits', () => {
    it('should invalidate active visit, visit history and visit-by-uuid keys', () => {
      const patientUuid = 'test-patient-123';

      invalidateVisits(mockMutate, patientUuid);

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(expect.any(Function));

      const matcherFn = mockMutate.mock.calls[0][0];

      // Active visit keys
      expect(matcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom&includeInactive=false')).toBe(true);

      // Visit history keys (with pagination params)
      expect(
        matcherFn(
          '/ws/rest/v1/visit?patient=test-patient-123&v=custom:(uuid,location)&limit=10&startIndex=0&totalCount=true',
        ),
      ).toBe(true);

      // Visit history keys (without includeInactive)
      expect(matcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom:(uuid,location)')).toBe(true);

      // Visits fetched by UUID (e.g. the visit context)
      expect(matcherFn('/ws/rest/v1/visit/test-visit-123?v=custom:(uuid,display)')).toBe(true);

      // Should not match other patient's visit lists
      expect(matcherFn('/ws/rest/v1/visit?patient=other-patient&v=custom')).toBe(false);

      // Should not match non-visit endpoints
      expect(matcherFn('/ws/rest/v1/encounter?patient=test-patient-123')).toBe(false);

      // Should not match non-string keys
      expect(matcherFn({ url: '/ws/rest/v1/visit?patient=test-patient-123' })).toBe(false);
    });
  });

  describe('invalidatePatientEncounters', () => {
    it('should invalidate encounter keys for the specified patient', () => {
      const patientUuid = 'test-patient-123';

      invalidatePatientEncounters(mockMutate, patientUuid);

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(expect.any(Function));

      // Test the cache key matcher function
      const matcherFn = mockMutate.mock.calls[0][0];

      // Should match encounter endpoints with patient parameter
      expect(matcherFn('/ws/rest/v1/encounter?patient=test-patient-123&v=custom')).toBe(true);
      expect(matcherFn('/ws/rest/v1/encounter?limit=20&patient=test-patient-123&v=custom')).toBe(true);
      expect(matcherFn('/ws/rest/v1/encounter?limit=20&startIndex=0&patient=test-patient-123&totalCount=true')).toBe(
        true,
      );

      // Should not match other patient's encounters
      expect(matcherFn('/ws/rest/v1/encounter?patient=other-patient&v=custom')).toBe(false);

      // Should not match non-encounter endpoints
      expect(matcherFn('/ws/rest/v1/visit?patient=test-patient-123')).toBe(false);

      // Should not match non-string keys
      expect(matcherFn({ url: '/ws/rest/v1/encounter?patient=test-patient-123' })).toBe(false);
    });
  });

  describe('invalidateVisitAndEncounterData', () => {
    it('should call both visit and encounter invalidation functions', () => {
      const patientUuid = 'test-patient-123';

      invalidateVisitAndEncounterData(mockMutate, patientUuid);

      // Should be called twice - once for visits, once for encounters
      expect(mockMutate).toHaveBeenCalledTimes(2);
      expect(mockMutate).toHaveBeenNthCalledWith(1, expect.any(Function));
      expect(mockMutate).toHaveBeenNthCalledWith(2, expect.any(Function));

      // Test that both matcher functions work correctly
      const visitMatcherFn = mockMutate.mock.calls[0][0];
      const encounterMatcherFn = mockMutate.mock.calls[1][0];

      // Visit matcher should work
      expect(visitMatcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom&limit=10')).toBe(true);
      expect(visitMatcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom&includeInactive=false')).toBe(true);

      // Encounter matcher should work
      expect(encounterMatcherFn('/ws/rest/v1/encounter?patient=test-patient-123&v=custom')).toBe(true);
    });
  });
});
