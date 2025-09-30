export const mockImmunizationData = [
  {
    resourceType: 'Immunization',
    id: '1',
    status: 'completed',
    vaccineCode: {
      coding: [
        {
          code: 'rotavirus-uuid',
          display: 'Rotavirus',
        },
      ],
    },
    patient: { reference: 'Patient/test-patient' },
    encounter: { reference: 'Encounter/test-encounter' },
    occurrenceDateTime: '2018-09-15T00:00:00.000Z',
    protocolApplied: [{ doseNumberPositiveInt: 1 }],
  },
  {
    resourceType: 'Immunization',
    id: '2',
    status: 'completed',
    vaccineCode: {
      coding: [
        {
          code: 'polio-uuid',
          display: 'Polio',
        },
      ],
    },
    patient: { reference: 'Patient/test-patient' },
    encounter: { reference: 'Encounter/test-encounter' },
    occurrenceDateTime: '2018-11-20T00:00:00.000Z',
    protocolApplied: [{ doseNumberPositiveInt: 1 }],
  },
  {
    resourceType: 'Immunization',
    id: '3',
    status: 'completed',
    vaccineCode: {
      coding: [
        {
          code: 'influenza-uuid',
          display: 'Influenza',
        },
      ],
    },
    patient: { reference: 'Patient/test-patient' },
    encounter: { reference: 'Encounter/test-encounter' },
    occurrenceDateTime: '2018-05-10T00:00:00.000Z',
    protocolApplied: [{ doseNumberPositiveInt: 1 }],
  },
];
