import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { ObsRecord } from '../packages/esm-patient-tests-app/src/types';

export const mockConceptMeta = {
  display: '',
  hiNormal: 0,
  hiAbsolute: 0,
  hiCritical: 0,
  lowNormal: 0,
  lowAbsolute: 0,
  lowCritical: 0,
  units: 'g/dL',
  range: '12-16',
  getInterpretation: function (value: string): OBSERVATION_INTERPRETATION {
    const numValue = Number(value);
    if (numValue > this.hiNormal) return 'HIGH';
    if (numValue < this.lowNormal) return 'LOW';
    return 'NORMAL';
  },
};

export const mockBasePanel: ObsRecord = {
  resourceType: 'Observation',
  id: 'test-id',
  conceptUuid: 'test-uuid',
  category: [
    {
      coding: [
        {
          system: 'test-system',
          code: 'test-code',
          display: 'Laboratory',
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        code: 'test-code',
        display: 'Test Display',
      },
    ],
    text: 'Test Text',
  },
  effectiveDateTime: '2024-01-01T10:00:00Z',
  issued: '2024-01-01T10:00:00Z',
  name: 'Complete Blood Count',
  value: '120',
  interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
  relatedObs: [],
  meta: mockConceptMeta,
  referenceRange: [],
};

export const mockObservations: Array<ObsRecord> = [
  {
    ...mockBasePanel,
    id: '1',
    name: 'Hemoglobin',
    value: '14',
    interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
    meta: {
      ...mockConceptMeta,
      units: 'g/dL',
      range: '12-16',
    },
  },
  {
    ...mockBasePanel,
    id: '2',
    name: 'Hematocrit',
    value: '42',
    interpretation: 'HIGH' as OBSERVATION_INTERPRETATION,
    meta: {
      ...mockConceptMeta,
      units: '%',
      range: '35-45',
    },
  },
];

export const mockObservationsWithInterpretations: Array<ObsRecord> = [
  {
    ...mockBasePanel,
    id: '1',
    name: 'Normal Test',
    value: '14',
    interpretation: 'NORMAL' as OBSERVATION_INTERPRETATION,
  },
  {
    ...mockBasePanel,
    id: '2',
    name: 'High Test',
    value: '42',
    interpretation: 'HIGH' as OBSERVATION_INTERPRETATION,
  },
  {
    ...mockBasePanel,
    id: '3',
    name: 'Low Test',
    value: '2',
    interpretation: 'LOW' as OBSERVATION_INTERPRETATION,
  },
];
