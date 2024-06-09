import dayjs from 'dayjs';

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

export const mockPatientImmunizationsSearchResponse = {
  resourceType: 'Bundle',
  entry: [
    {
      fullUrl: '',
      resource: {
        resourceType: 'Immunization',
        id: 'b9c21a82-aed3-11ea-b3de-0242ac130001',
        vaccineCode: {
          coding: [
            {
              code: 'RotavirusUuid',
              display: 'Rotavirus',
            },
          ],
        },
        status: 'completed',
        patient: {
          type: 'Patient',
          reference: 'Patient/D1A903924D4443A7A388778D77D86155',
        },
        encounter: {
          type: 'Encounter',
          reference: 'Encounter/Example',
        },
        location: {
          type: 'Location',
          reference: 'Location/1',
        },
        performer: [{ actor: { type: 'Practitioner', reference: 'Practitioner/12334' } }],
        occurrenceDateTime: dayjs('2018-09-21').toDate(),
        expirationDate: dayjs('2025-12-15').toDate(),
        manufacturer: {
          display: 'Organization/hl7',
        },
        lotNumber: '12345',
        protocolApplied: [
          {
            series: '4 Months',
            doseNumberPositiveInt: 2,
          },
        ],
      },
    },
    {
      fullUrl: '',
      resource: {
        resourceType: 'Immunization',
        id: 'b9c21a82-aed3-11ea-b3de-0242ac130001',
        vaccineCode: {
          coding: [
            {
              code: 'RotavirusUuid',
              display: 'Rotavirus',
            },
          ],
        },
        status: 'completed',
        patient: {
          type: 'Patient',
          reference: 'Patient/D1A903924D4443A7A388778D77D86155',
        },
        encounter: {
          type: 'Encounter',
          reference: 'Encounter/Example',
        },
        location: {
          type: 'Location',
          reference: 'Location/1',
        },
        performer: [{ actor: { type: 'Practitioner', reference: 'Practitioner/12334' } }],
        occurrenceDateTime: dayjs('2018-06-18').toDate(),
        expirationDate: dayjs('2025-12-15').toDate(),
        manufacturer: {
          display: 'Organization/hl7',
        },
        lotNumber: '12345',
        protocolApplied: [
          {
            series: '2 Months',
            doseNumberPositiveInt: 1,
          },
        ],
      },
    },
    {
      fullUrl: '',
      resource: {
        resourceType: 'Immunization',
        id: 'b9c21d5c-aed3-11ea-b3de-0242ac130002',
        vaccineCode: {
          coding: [
            {
              code: 'PolioUuid',
              display: 'Polio',
            },
          ],
        },
        status: 'completed',
        patient: {
          type: 'Patient',
          reference: 'Patient/D1A903924D4443A7A388778D77D86155',
        },
        encounter: {
          type: 'Encounter',
          reference: 'Encounter/Example',
        },
        location: {
          type: 'Location',
          reference: 'Location/1',
        },
        performer: [{ actor: { type: 'Practitioner', reference: 'Practitioner/12334' } }],
        manufacturer: {
          display: 'Organization/hl7',
        },
        lotNumber: '12345',
        occurrenceDateTime: dayjs('2018-05-21').toDate(),
        expirationDate: dayjs('2025-12-15').toDate(),
        protocolApplied: [
          {
            series: '2 Months',
            doseNumberPositiveInt: 1,
          },
        ],
      },
    },
    {
      fullUrl: '',
      resource: {
        resourceType: 'Immunization',
        id: 'b9c21d5c-aed3-11ea-b3de-0242ac130002',
        vaccineCode: {
          coding: [
            {
              code: 'PolioUuid',
              display: 'Polio',
            },
          ],
        },
        status: 'completed',
        patient: {
          type: 'Patient',
          reference: 'Patient/D1A903924D4443A7A388778D77D86155',
        },
        encounter: {
          type: 'Encounter',
          reference: 'Encounter/Example',
        },
        location: {
          type: 'Location',
          reference: 'Location/1',
        },
        performer: [{ actor: { type: 'Practitioner', reference: 'Practitioner/12334' } }],
        manufacturer: {
          display: 'Organization/hl7',
        },
        lotNumber: '1234',
        occurrenceDateTime: dayjs('2018-11-01').toDate(),
        expirationDate: dayjs('2025-12-15').toDate(),
        protocolApplied: [
          {
            series: '4 Months',
            doseNumberPositiveInt: 2,
          },
        ],
      },
    },
    {
      fullUrl: '',
      resource: {
        resourceType: 'Immunization',
        id: 'b9c21e6a-aed3-11ea-b3de-0242ac130003',
        vaccineCode: {
          coding: [
            {
              code: 'InfluenzaUuid',
              display: 'Influenza',
            },
          ],
        },
        status: 'completed',
        patient: {
          type: 'Patient',
          reference: 'Patient/D1A903924D4443A7A388778D77D86155',
        },
        encounter: {
          type: 'Encounter',
          reference: 'Encounter/Example',
        },
        location: {
          type: 'Location',
          reference: 'Location/1',
        },
        performer: [{ actor: { type: 'Practitioner', reference: 'Practitioner/12334' } }],
        manufacturer: {
          display: 'Organization/hl7',
        },
        lotNumber: '12345',
        occurrenceDateTime: dayjs('2018-05-21').toDate(),
        expirationDate: dayjs('2025-12-15').toDate(),
        protocolApplied: [
          {
            doseNumberPositiveInt: 1,
          },
        ],
      },
    },
    {
      fullUrl: '',
      resource: {
        resourceType: 'Immunization',
        id: 'b9c21e6a-aed3-11ea-b3de-0242ac130003',
        vaccineCode: {
          coding: [
            {
              code: 'InfluenzaUuid',
              display: 'Influenza',
            },
          ],
        },
        status: 'completed',
        patient: {
          type: 'Patient',
          reference: 'Patient/D1A903924D4443A7A388778D77D86155',
        },
        encounter: {
          type: 'Encounter',
          reference: 'Encounter/Example',
        },
        location: {
          type: 'Location',
          reference: 'Location/1',
        },
        performer: [{ actor: { type: 'Practitioner', reference: 'Practitioner/12334' } }],
        manufacturer: {
          display: 'Organization/hl7',
        },
        lotNumber: '12345',
        occurrenceDateTime: dayjs('2018-05-21').toDate(),
        expirationDate: dayjs('2025-12-15').toDate(),
        protocolApplied: [
          {
            doseNumberPositiveInt: 1,
          },
        ],
      },
    },
  ],
};
