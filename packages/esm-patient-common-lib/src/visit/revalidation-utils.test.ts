import {
  invalidateVisitHistory,
  invalidatePatientEncounters,
  invalidateVisitAndEncounterData,
  invalidateCurrentVisit,
} from './revalidation-utils';

const mockMutate = jest.fn();

describe('revalidation-utils', () => {
  describe('invalidateVisitHistory', () => {
    it('should invalidate visit history keys but not current visit keys', () => {
      const patientUuid = 'test-patient-123';

      invalidateVisitHistory(mockMutate, patientUuid);

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(expect.any(Function));

      // Test the cache key matcher function
      const matcherFn = mockMutate.mock.calls[0][0];

      // Should invalidate visit history keys (with pagination params)
      expect(
        matcherFn(
          '/ws/rest/v1/visit?patient=test-patient-123&v=custom:(uuid,location)&limit=10&startIndex=0&totalCount=true',
        ),
      ).toBe(true);

      // Should invalidate visit history keys (without includeInactive)
      expect(matcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom:(uuid,location)')).toBe(true);

      // Should NOT invalidate current visit keys (with includeInactive=false)
      expect(matcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom&includeInactive=false')).toBe(false);

      // Should not match other patient's keys
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
    it('should call both visit history and encounter invalidation functions', () => {
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

      // Encounter matcher should work
      expect(encounterMatcherFn('/ws/rest/v1/encounter?patient=test-patient-123&v=custom')).toBe(true);
    });
  });

  describe('invalidateCurrentVisit', () => {
    it('should invalidate only current visit keys', () => {
      const patientUuid = 'test-patient-123';

      invalidateCurrentVisit(mockMutate, patientUuid);

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(expect.any(Function));

      const matcherFn = mockMutate.mock.calls[0][0];

      // Should match current visit key (includeInactive=false)
      expect(matcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom&includeInactive=false')).toBe(true);

      // Should not match other visit keys
      expect(matcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom&includeInactive=true')).toBe(false);
      expect(
        matcherFn('/ws/rest/v1/visit?patient=test-patient-123&v=custom&limit=10&startIndex=0&totalCount=true'),
      ).toBe(false);
      expect(matcherFn('/ws/rest/v1/visit/test-patient-123')).toBe(false);

      // Should not match encounter keys
      expect(matcherFn('/ws/rest/v1/encounter?patient=test-patient-123&v=custom')).toBe(false);
    });
  });
});
