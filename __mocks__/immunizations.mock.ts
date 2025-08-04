export const mockImmunizationConfig = {
  immunizationsConfig: {
    vaccinesConceptSet: 'vaccinationsUuid',
    sequenceDefinitions: [
      {
        vaccineConceptUuid: 'RotavirusUuid',
        sequences: [
          {
            sequenceLabel: 'dose-1',
            sequenceNumber: '1',
          },
          {
            sequenceLabel: 'dose-2',
            sequenceNumber: '2',
          },
          {
            sequenceLabel: 'booster-1',
            sequenceNumber: '11',
          },
        ],
      },
      {
        vaccineConceptUuid: 'PolioUuid',
        sequences: [
          {
            sequenceLabel: '2 Months',
            sequenceNumber: '1',
          },
          {
            sequenceLabel: '6 Months',
            sequenceNumber: '2',
          },
          {
            sequenceLabel: '8 Months',
            sequenceNumber: '2',
          },
        ],
      },
    ],
  },
};

export const mockVaccinesConceptSet = {
  setMembers: [
    {
      uuid: 'RotavirusUuid',
      display: 'Rotavirus',
    },
    {
      uuid: 'PolioUuid',
      display: 'Polio',
    },
    {
      uuid: 'InfluenzaUuid',
      display: 'Influenza',
    },
    {
      uuid: 'AdinovirusUuid',
      display: 'Adinovirus',
    },
  ],
};

export const mockPatientImmunization = {
  resourceType: 'Immunization',
  id: 'protocol',
  uuid: 'b9c21a82-aed3-11ea-b3de-0242ac130004',
  vaccineCode: {
    coding: [
      {
        system: '',
        code: '104',
      },
    ],
    text: 'Rotavirus',
  },
  patient: {
    reference: 'Patient/D1A903924D4443A7A388778D77D86155',
  },
  encounter: {
    reference: 'Encounter/example',
  },
  occurrenceDateTime: '2018-06-18',
  location: {
    reference: 'Location/1',
  },
  manufacturer: {
    reference: 'Organization/hl7',
  },
  lotNumber: 'PT123F',
  expirationDate: '2018-12-15',
  protocolApplied: [
    {
      series: '2 Months',
      occurrenceDateTime: '2018-06-18',
      doseNumberPositiveInt: 1,
    },
    {
      series: '4 Months',
      occurrenceDateTime: '2018-09-21',
      doseNumberPositiveInt: 2,
    },
  ],
};

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
