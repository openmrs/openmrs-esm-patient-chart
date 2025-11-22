import type { ObsRecord } from '@openmrs/esm-patient-common-lib';
import { extractObservationReferenceRanges, extractObservationInterpretation } from './helpers';
import type { FHIRObservationResource } from '../../types';

describe('Observation Extraction Helpers', () => {
  describe('extractObservationReferenceRanges', () => {
    it('returns undefined when referenceRange is missing', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [],
      };

      expect(extractObservationReferenceRanges(resource)).toBeUndefined();
    });

    it('returns undefined when referenceRange is empty array', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [],
      };

      expect(extractObservationReferenceRanges(resource)).toBeUndefined();
    });

    it('extracts normal ranges from HL7 referencerange-meaning system', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'normal',
                },
              ],
            },
            low: { value: 0 },
            high: { value: 50 },
          },
        ],
        valueQuantity: {
          value: 25,
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL',
        },
      };

      const result = extractObservationReferenceRanges(resource);

      expect(result).toEqual({
        lowNormal: 0,
        hiNormal: 50,
        units: 'mg/dL',
      });
    });

    it('extracts treatment ranges from HL7 referencerange-meaning system', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'treatment',
                },
              ],
            },
            low: { value: 25 },
            high: { value: 541 },
          },
        ],
        valueQuantity: {
          value: 30,
          unit: 'U/L',
          system: 'http://unitsofmeasure.org',
          code: 'U/L',
        },
      };

      const result = extractObservationReferenceRanges(resource);

      expect(result).toEqual({
        lowCritical: 25,
        hiCritical: 541,
        units: 'U/L',
      });
    });

    it('extracts absolute ranges from OpenMRS extension system', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://fhir.openmrs.org/ext/obs/reference-range',
                  code: 'absolute',
                },
              ],
            },
            low: { value: -10 },
            high: { value: 100 },
          },
        ],
        valueQuantity: {
          value: 50,
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL',
        },
      };

      const result = extractObservationReferenceRanges(resource);

      expect(result).toEqual({
        lowAbsolute: -10,
        hiAbsolute: 100,
        units: 'mg/dL',
      });
    });

    it('handles multiple range types in single observation', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'normal',
                },
              ],
            },
            low: { value: 0 },
            high: { value: 50 },
          },
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'treatment',
                },
              ],
            },
            low: { value: 25 },
            high: { value: 541 },
          },
        ],
        valueQuantity: {
          value: 30,
          unit: 'U/L',
          system: 'http://unitsofmeasure.org',
          code: 'U/L',
        },
      };

      const result = extractObservationReferenceRanges(resource);

      expect(result).toEqual({
        lowNormal: 0,
        hiNormal: 50,
        lowCritical: 25,
        hiCritical: 541,
        units: 'U/L',
      });
    });

    it('handles partial ranges (only high or only low)', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'normal',
                },
              ],
            },
            high: { value: 50 },
          },
        ],
        valueQuantity: {
          value: 25,
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL',
        },
      };

      const result = extractObservationReferenceRanges(resource);

      expect(result).toEqual({
        hiNormal: 50,
        units: 'mg/dL',
      });
    });

    it('returns undefined when no valid range values are found', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://unknown.system',
                  code: 'unknown',
                },
              ],
            },
          },
        ],
      };

      expect(extractObservationReferenceRanges(resource)).toBeUndefined();
    });

    it('handles ObsRecord type input', () => {
      const obsRecord: ObsRecord = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        encounter: {
          reference: 'Encounter/test-encounter',
          type: 'Encounter',
        },
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'normal',
                },
              ],
            },
            low: { value: 0 },
            high: { value: 50 },
          },
        ],
        valueQuantity: {
          value: 25,
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL',
        },
        conceptClass: 'test-uuid',
        value: '25',
        name: 'Test',
        interpretation: 'NORMAL' as const,
      };

      const result = extractObservationReferenceRanges(obsRecord);

      expect(result).toEqual({
        lowNormal: 0,
        hiNormal: 50,
        units: 'mg/dL',
      });
    });

    it('handles missing valueQuantity units', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
                  code: 'normal',
                },
              ],
            },
            low: { value: 0 },
            high: { value: 50 },
          },
        ],
      };

      const result = extractObservationReferenceRanges(resource);

      expect(result).toEqual({
        lowNormal: 0,
        hiNormal: 50,
        units: undefined,
      });
    });
  });

  describe('extractObservationInterpretation', () => {
    it('returns undefined when interpretation is missing', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [],
      };

      expect(extractObservationInterpretation(resource)).toBeUndefined();
    });

    it('returns undefined when interpretation is empty array', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [],
        interpretation: [],
      };

      expect(extractObservationInterpretation(resource)).toBeUndefined();
    });

    describe('HL7 v3 ObservationInterpretation codes', () => {
      it('maps LL to CRITICALLY_LOW', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'LL', display: 'Critically Low' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('CRITICALLY_LOW');
      });

      it('maps HH to CRITICALLY_HIGH', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'HH', display: 'Critically High' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('CRITICALLY_HIGH');
      });

      it('maps L to LOW', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'L', display: 'Low' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('LOW');
      });

      it('maps H to HIGH', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'H', display: 'High' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('HIGH');
      });

      it('maps N to NORMAL', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'N', display: 'Normal' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('NORMAL');
      });

      it('maps LU to OFF_SCALE_LOW', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'LU', display: 'Off Scale Low' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('OFF_SCALE_LOW');
      });

      it('maps HU to OFF_SCALE_HIGH', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'HU', display: 'Off Scale High' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('OFF_SCALE_HIGH');
      });

      it('handles case-insensitive codes', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'll', display: 'Critically Low' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('CRITICALLY_LOW');
      });
    });

    describe('Display value mapping', () => {
      it('maps "Critically Low" to CRITICALLY_LOW', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'Critically Low' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('CRITICALLY_LOW');
      });

      it('maps "Critically High" to CRITICALLY_HIGH', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'Critically High' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('CRITICALLY_HIGH');
      });

      it('maps "Low" to LOW', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'Low' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('LOW');
      });

      it('maps "High" to HIGH', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'High' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('HIGH');
      });

      it('maps "Normal" to NORMAL', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'Normal' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('NORMAL');
      });

      it('maps "Off Scale Low" to OFF_SCALE_LOW', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'Off Scale Low' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('OFF_SCALE_LOW');
      });

      it('maps "Off Scale High" to OFF_SCALE_HIGH', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'Off Scale High' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('OFF_SCALE_HIGH');
      });

      it('handles case-insensitive display values', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'CRITICALLY LOW' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('CRITICALLY_LOW');
      });

      it('handles display values with extra whitespace', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: '  Critically Low  ' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('CRITICALLY_LOW');
      });
    });

    describe('Fallback behavior', () => {
      it('falls back to display when code is unknown', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN_CODE', display: 'High' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('HIGH');
      });

      it('falls back to text when coding is missing', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [],
              text: 'Normal',
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBe('NORMAL');
      });

      it('returns undefined for unknown codes and displays', () => {
        const resource: FHIRObservationResource = {
          resourceType: 'Observation',
          id: 'test-id',
          category: [],
          code: { coding: [], text: '' },
          effectiveDateTime: '2024-01-01',
          issued: '2024-01-01',
          referenceRange: [],
          interpretation: [
            {
              coding: [{ code: 'UNKNOWN', display: 'Unknown Value' }],
            },
          ],
        };

        expect(extractObservationInterpretation(resource)).toBeUndefined();
      });
    });

    it('uses first interpretation when multiple are present', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [],
        interpretation: [
          {
            coding: [{ code: 'L', display: 'Low' }],
          },
          {
            coding: [{ code: 'H', display: 'High' }],
          },
        ],
      };

      expect(extractObservationInterpretation(resource)).toBe('LOW');
    });

    it('handles ObsRecord type input', () => {
      const obsRecord: ObsRecord = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        encounter: {
          reference: 'Encounter/test-encounter',
          type: 'Encounter',
        },
        referenceRange: [],
        // Add interpretation array for extraction function (ObsRecord has [_: string]: any)
        interpretation: [
          {
            coding: [{ code: 'H', display: 'High' }],
          },
        ] as any,
        conceptClass: 'test-uuid',
        value: '25',
        name: 'Test',
      };

      expect(extractObservationInterpretation(obsRecord)).toBe('HIGH');
    });

    it('handles missing coding array', () => {
      const resource: FHIRObservationResource = {
        resourceType: 'Observation',
        id: 'test-id',
        category: [],
        code: { coding: [], text: '' },
        effectiveDateTime: '2024-01-01',
        issued: '2024-01-01',
        referenceRange: [],
        interpretation: [
          {
            coding: [],
            text: 'Normal',
          },
        ],
      };

      expect(extractObservationInterpretation(resource)).toBe('NORMAL');
    });
  });
});
