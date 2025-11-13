import {
  selectReferenceRange,
  formatReferenceRange,
  getMostRecentObservationWithRange,
  rangeAlreadyHasUnits,
  type ReferenceRanges,
} from './reference-range-helpers';

describe('Reference Range Helpers', () => {
  describe('selectReferenceRange', () => {
    it('returns null when both ranges are null', () => {
      expect(selectReferenceRange(undefined, undefined)).toBeNull();
    });

    it('returns node-level range when observation range is not available', () => {
      const nodeRanges: ReferenceRanges = {
        lowNormal: 0,
        hiNormal: 50,
        units: 'mg/dL',
      };

      expect(selectReferenceRange(undefined, nodeRanges)).toEqual(nodeRanges);
    });

    it('returns observation-level range when node range is not available', () => {
      const observationRanges: ReferenceRanges = {
        lowNormal: 35,
        hiNormal: 147,
        units: 'U/L',
      };

      expect(selectReferenceRange(observationRanges, undefined)).toEqual(observationRanges);
    });

    it('merges ranges with observation taking precedence', () => {
      const observationRanges: ReferenceRanges = {
        lowNormal: 35,
        hiNormal: 147,
        lowCritical: 25,
        units: 'U/L',
      };

      const nodeRanges: ReferenceRanges = {
        lowNormal: 0,
        hiNormal: 270,
        hiCritical: 541,
        units: 'U/L',
      };

      const result = selectReferenceRange(observationRanges, nodeRanges);

      expect(result).toEqual({
        lowNormal: 35, // From observation
        hiNormal: 147, // From observation
        lowCritical: 25, // From observation
        hiCritical: 541, // From node (observation doesn't have it)
        units: 'U/L',
      });
    });

    it('handles partial observation ranges', () => {
      const observationRanges: ReferenceRanges = {
        hiNormal: 147,
        // Missing lowNormal
      };

      const nodeRanges: ReferenceRanges = {
        lowNormal: 0,
        hiNormal: 270,
        units: 'U/L',
      };

      const result = selectReferenceRange(observationRanges, nodeRanges);

      expect(result).toEqual({
        lowNormal: 0, // From node (observation doesn't have it)
        hiNormal: 147, // From observation
        units: 'U/L',
      });
    });
  });

  describe('formatReferenceRange', () => {
    it('returns "--" when ranges is null', () => {
      expect(formatReferenceRange(null)).toBe('--');
    });

    it('formats range with both lowNormal and hiNormal', () => {
      const ranges: ReferenceRanges = {
        lowNormal: 0,
        hiNormal: 50,
        units: 'mg/dL',
      };

      expect(formatReferenceRange(ranges)).toBe('0 – 50 mg/dL');
    });

    it('formats range without units', () => {
      const ranges: ReferenceRanges = {
        lowNormal: 0,
        hiNormal: 50,
      };

      expect(formatReferenceRange(ranges)).toBe('0 – 50');
    });

    it('returns "--" when lowNormal or hiNormal is missing', () => {
      const ranges1: ReferenceRanges = {
        hiNormal: 50,
      };

      const ranges2: ReferenceRanges = {
        lowNormal: 0,
      };

      expect(formatReferenceRange(ranges1)).toBe('--');
      expect(formatReferenceRange(ranges2)).toBe('--');
    });

    it('uses provided units parameter when ranges.units is not available', () => {
      const ranges: ReferenceRanges = {
        lowNormal: 0,
        hiNormal: 50,
      };

      expect(formatReferenceRange(ranges, 'mg/dL')).toBe('0 – 50 mg/dL');
    });
  });

  describe('getMostRecentObservationWithRange', () => {
    it('returns null when observations array is empty', () => {
      expect(getMostRecentObservationWithRange([])).toBeNull();
    });

    it('returns null when no observations have range data', () => {
      const observations = [
        { obsDatetime: '2024-01-01', value: '10' },
        { obsDatetime: '2024-01-02', value: '20' },
      ];

      expect(getMostRecentObservationWithRange(observations)).toBeNull();
    });

    it('returns the most recent observation with range data', () => {
      const observations = [
        {
          obsDatetime: '2024-01-01',
          value: '10',
          lowNormal: 0,
          hiNormal: 50,
        },
        {
          obsDatetime: '2024-01-03',
          value: '30',
          lowNormal: 35,
          hiNormal: 147,
        },
        {
          obsDatetime: '2024-01-02',
          value: '20',
          // No range data
        },
      ];

      const result = getMostRecentObservationWithRange(observations);

      expect(result).toEqual({
        obsDatetime: '2024-01-03',
        value: '30',
        lowNormal: 35,
        hiNormal: 147,
      });
    });

    it('handles observations with only lowNormal', () => {
      const observations = [
        {
          obsDatetime: '2024-01-01',
          value: '10',
          lowNormal: 0,
        },
      ];

      const result = getMostRecentObservationWithRange(observations);

      expect(result).toEqual({
        obsDatetime: '2024-01-01',
        value: '10',
        lowNormal: 0,
      });
    });

    it('handles observations with only hiNormal', () => {
      const observations = [
        {
          obsDatetime: '2024-01-01',
          value: '10',
          hiNormal: 50,
        },
      ];

      const result = getMostRecentObservationWithRange(observations);

      expect(result).toEqual({
        obsDatetime: '2024-01-01',
        value: '10',
        hiNormal: 50,
      });
    });

    it('filters out undefined entries', () => {
      const observations = [
        undefined,
        {
          obsDatetime: '2024-01-01',
          value: '10',
          lowNormal: 0,
          hiNormal: 50,
        },
        undefined,
      ];

      const result = getMostRecentObservationWithRange(observations);

      expect(result).toEqual({
        obsDatetime: '2024-01-01',
        value: '10',
        lowNormal: 0,
        hiNormal: 50,
      });
    });
  });

  describe('rangeAlreadyHasUnits', () => {
    it('returns false when range is undefined', () => {
      expect(rangeAlreadyHasUnits(undefined, 'U/L')).toBe(false);
    });

    it('returns false when units is undefined', () => {
      expect(rangeAlreadyHasUnits('0 – 50', undefined)).toBe(false);
    });

    it('returns false when both are undefined', () => {
      expect(rangeAlreadyHasUnits(undefined, undefined)).toBe(false);
    });

    it('returns true when range ends with units', () => {
      expect(rangeAlreadyHasUnits('0 – 50 U/L', 'U/L')).toBe(true);
    });

    it('returns true when range ends with units with space', () => {
      expect(rangeAlreadyHasUnits('0 – 50 U/L', 'U/L')).toBe(true);
    });

    it('returns false when range does not end with units', () => {
      expect(rangeAlreadyHasUnits('0 – 50', 'U/L')).toBe(false);
    });

    it('returns false when units appear in the middle of range', () => {
      expect(rangeAlreadyHasUnits('5 mg/dL value', 'mg/dL')).toBe(false);
    });

    it('handles trimmed strings correctly', () => {
      expect(rangeAlreadyHasUnits('  0 – 50 U/L  ', '  U/L  ')).toBe(true);
    });

    it('returns false for empty strings', () => {
      expect(rangeAlreadyHasUnits('', 'U/L')).toBe(false);
      expect(rangeAlreadyHasUnits('0 – 50', '')).toBe(false);
    });
  });
});
