import { getIncludedPatientIdentifierValues } from './patient-details';

describe('getIncludedPatientIdentifierValues', () => {
  it('returns identifier values when the full identifier structure is present', () => {
    const patient = {
      identifier: [
        {
          type: { coding: [{ code: 'OPENMRS_ID' }] },
          value: '100GEJ',
        },
      ],
    } as fhir.Patient;

    expect(getIncludedPatientIdentifierValues(patient)).toEqual(['100GEJ']);
  });

  it('includes identifiers when type metadata is missing', () => {
    const patient = {
      identifier: [
        {
          value: '100GEJ',
        },
      ],
    } as fhir.Patient;

    expect(getIncludedPatientIdentifierValues(patient)).toEqual(['100GEJ']);
  });

  it('includes identifiers when coding metadata is missing', () => {
    const patient = {
      identifier: [
        {
          type: {},
          value: '100GEJ',
        },
      ],
    } as fhir.Patient;

    expect(getIncludedPatientIdentifierValues(patient)).toEqual(['100GEJ']);
  });

  it('filters out identifiers with empty values', () => {
    const patient = {
      identifier: [
        {
          type: { coding: [{ code: 'OPENMRS_ID' }] },
          value: '   ',
        },
        {
          type: { coding: [{ code: 'NATIONAL_ID' }] },
          value: '12345',
        },
      ],
    } as fhir.Patient;

    expect(getIncludedPatientIdentifierValues(patient)).toEqual(['12345']);
  });

  it('filters out identifiers with excluded codes', () => {
    const patient = {
      identifier: [
        {
          type: { coding: [{ code: 'OPENMRS_ID' }] },
          value: '100GEJ',
        },
        {
          type: { coding: [{ code: 'NATIONAL_ID' }] },
          value: '12345',
        },
      ],
    } as fhir.Patient;

    expect(getIncludedPatientIdentifierValues(patient, ['OPENMRS_ID'])).toEqual(['12345']);
  });
});
