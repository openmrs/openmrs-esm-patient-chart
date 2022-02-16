import { mapFromFHIRImmunizationBundle, mapToFHIRImmunizationResource } from './immunization-mapper';
import { FHIRImmunizationBundle, FHIRImmunizationResource, ImmunizationFormData } from './immunization-domain';
import { parseDate } from '@openmrs/esm-framework';

let rotavirusDose1: FHIRImmunizationResource = {
  resourceType: 'Immunization',
  id: 'b9c21a82-aed3-11ea-b3de-0242ac130001',
  status: 'completed',
  vaccineCode: {
    coding: [
      {
        code: 'RotavirusUuid',
        display: 'Rotavirus',
      },
    ],
  },
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
  lotNumber: '123445',
  occurrenceDateTime: parseDate('2018-09-21'),
  expirationDate: parseDate('2025-12-15'),
  protocolApplied: [
    {
      series: '4 Months',
      doseNumberPositiveInt: 2,
    },
  ],
};
let rotavirusDose2: FHIRImmunizationResource = {
  resourceType: 'Immunization',
  id: 'b9c21a82-aed3-11ea-b3de-0242ac130001',
  status: 'completed',
  vaccineCode: {
    coding: [
      {
        code: 'RotavirusUuid',
        display: 'Rotavirus',
      },
    ],
  },
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
  lotNumber: '123454',
  occurrenceDateTime: parseDate('2018-06-18'),
  expirationDate: parseDate('2025-12-15'),
  protocolApplied: [
    {
      series: '2 Months',
      doseNumberPositiveInt: 1,
    },
  ],
};
const immunizationsSearchResponseWithSingleEntry: FHIRImmunizationBundle = {
  resourceType: 'Bundle',
  entry: [
    {
      fullUrl: '',
      resource: rotavirusDose2,
    },
  ],
};
const immunizationsSearchResponseWithMultipleDoses: FHIRImmunizationBundle = {
  resourceType: 'Bundle',
  entry: [
    {
      fullUrl: '',
      resource: rotavirusDose1,
    },
    {
      fullUrl: '',
      resource: rotavirusDose2,
    },
  ],
};
const immunizationsSearchResponseWithMultipleImmunizations: FHIRImmunizationBundle = {
  resourceType: 'Bundle',
  entry: [
    {
      fullUrl: '',
      resource: rotavirusDose1,
    },
    {
      fullUrl: '',
      resource: rotavirusDose2,
    },
    {
      fullUrl: '',
      resource: {
        resourceType: 'Immunization',
        id: 'b9c21d5c-aed3-11ea-b3de-0242ac130002',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              code: 'uuid2',
              display: 'Polio',
            },
          ],
        },
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
        lotNumber: '123456',
        occurrenceDateTime: parseDate('2018-05-21'),
        expirationDate: parseDate('2025-12-15'),
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
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              code: 'uuid2',
              display: 'Polio',
            },
          ],
        },
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
        occurrenceDateTime: parseDate('2018-11-01'),
        expirationDate: parseDate('2025-12-15'),
        protocolApplied: [
          {
            series: '4 Months',
            doseNumberPositiveInt: 2,
          },
        ],
      },
    },
  ],
};

describe('ImmunizationMapper#mapFromFHIRImmunizationBundle', () => {
  it('should map the Immunization FHIR Bundle', function () {
    const immunizations = mapFromFHIRImmunizationBundle(immunizationsSearchResponseWithSingleEntry);

    expect(immunizations.length).toBe(1);
    expect(immunizations[0].vaccineName).toBe('Rotavirus');
    expect(immunizations[0].existingDoses.length).toBe(1);
    let expectedDose = {
      sequenceNumber: 1,
      sequenceLabel: '2 Months',
      immunizationObsUuid: 'b9c21a82-aed3-11ea-b3de-0242ac130001',
      expirationDate: '2025-12-15',
      lotNumber: '123454',
      manufacturer: 'Organization/hl7',
      occurrenceDateTime: '2018-06-18',
    };
    expect(immunizations[0].existingDoses[0]).toEqual(expectedDose);
  });

  it('should map multiple entries for same immunization as different doses', function () {
    const immunizations = mapFromFHIRImmunizationBundle(immunizationsSearchResponseWithMultipleDoses);

    expect(immunizations.length).toBe(1);
    expect(immunizations[0].vaccineName).toBe('Rotavirus');
    expect(immunizations[0].existingDoses.length).toBe(2);
    let expectedDose1 = {
      sequenceNumber: 2,
      sequenceLabel: '4 Months',
      expirationDate: '2025-12-15',
      immunizationObsUuid: 'b9c21a82-aed3-11ea-b3de-0242ac130001',
      lotNumber: '123445',
      manufacturer: 'Organization/hl7',
      occurrenceDateTime: '2018-09-21',
    };
    let expectedDose2 = {
      sequenceNumber: 1,
      sequenceLabel: '2 Months',
      expirationDate: '2025-12-15',
      lotNumber: '123454',
      immunizationObsUuid: 'b9c21a82-aed3-11ea-b3de-0242ac130001',
      manufacturer: 'Organization/hl7',
      occurrenceDateTime: '2018-06-18',
    };
    expect(immunizations[0].existingDoses[1]).toEqual(expectedDose2);
    expect(immunizations[0].existingDoses[0]).toEqual(expectedDose1);
  });

  it('should map multiple entries for different immunization as different immunization', function () {
    const immunizations = mapFromFHIRImmunizationBundle(immunizationsSearchResponseWithMultipleImmunizations);

    expect(immunizations.length).toBe(2);
    expect(immunizations[0].vaccineName).toBe('Rotavirus');
    expect(immunizations[0].existingDoses.length).toBe(2);

    expect(immunizations[1].vaccineName).toBe('Polio');
    expect(immunizations[1].existingDoses.length).toBe(2);
  });
});

describe('ImmunizationMapper#mapToFHIRImmunizationResource', () => {
  it('should map the form data to FHIR Resouce', function () {
    const immunizationFormData: ImmunizationFormData = {
      patientUuid: 'paitentUuid',
      immunizationObsUuid: 'obsUuid',
      vaccineName: 'Rotavirus',
      vaccineUuid: 'rotavirusUuid',
      manufacturer: 'HL7',
      expirationDate: '2025-12-15',
      vaccinationDate: '2020-12-15',
      lotNumber: '12345',
      currentDose: { sequenceLabel: '2 Months', sequenceNumber: 2 },
    };
    const fhirImmunization = mapToFHIRImmunizationResource(
      immunizationFormData,
      'visitUUid',
      'locationUuid',
      'providerUuid',
    );

    const expectedFHIRResource = {
      resourceType: 'Immunization',
      status: 'completed',
      id: 'obsUuid',
      vaccineCode: {
        coding: [
          {
            code: 'rotavirusUuid',
            display: 'Rotavirus',
          },
        ],
      },
      patient: { type: 'Patient', reference: 'Patient/paitentUuid' },
      encounter: { type: 'Encounter', reference: 'Encounter/visitUUid' },
      expirationDate: parseDate('2025-12-15'),
      occurrenceDateTime: parseDate('2020-12-15'),
      location: { type: 'Location', reference: 'Location/locationUuid' },
      performer: [
        {
          actor: {
            type: 'Practitioner',
            reference: 'Practitioner/providerUuid',
          },
        },
      ],
      manufacturer: { display: 'HL7' },
      lotNumber: '12345',
      protocolApplied: [{ doseNumberPositiveInt: 2, series: '2 Months' }],
    };

    expect(fhirImmunization).toEqual(expectedFHIRResource);
  });
});
