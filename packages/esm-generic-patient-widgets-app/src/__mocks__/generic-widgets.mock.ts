export const mockWeightAndViralLoadResult = {
  type: 'searchset',
  total: 9,
  entry: [
    {
      resource: {
        resourceType: 'Observation',
        id: '4b15b877-bf98-4990-a9c3-42f6ff293a10',
        code: {
          coding: [
            { code: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Viral load' },
            { system: 'http://loinc.org', code: '25836-8', display: 'Viral load' },
          ],
        },
        subject: {
          reference: 'Patient/1119ec72-b545-4408-a314-09648ba6614c',
          type: 'Patient',
          display: 'Michael Johnson (OpenMRS ID: 1009ER)',
        },
        encounter: { reference: 'Encounter/3a2bddf8-3779-41b9-8144-89f31e805ef7', type: 'Encounter' },
        effectiveDateTime: '2021-10-13T16:56:48+00:00',
        issued: '2021-10-28T09:57:12.000+00:00',
        valueQuantity: { value: 180.0, unit: 'copies/ml' },
        referenceRange: [
          {
            low: { value: 0.0 },
            type: { coding: [{ system: 'http://fhir.openmrs.org/ext/obs/reference-range', code: 'absolute' }] },
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'e4aef298-5b4b-4c57-bf3b-6ef893fddd91',
        code: {
          coding: [
            { code: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Viral load' },
            { system: 'http://loinc.org', code: '25836-8', display: 'Viral load' },
          ],
        },
        subject: {
          reference: 'Patient/1119ec72-b545-4408-a314-09648ba6614c',
          type: 'Patient',
          display: 'Michael Johnson (OpenMRS ID: 1009ER)',
        },
        encounter: { reference: 'Encounter/3a8782a0-42e7-4d5f-b8a8-a66ec4e7babe', type: 'Encounter' },
        effectiveDateTime: '2021-10-15T16:56:48+00:00',
        issued: '2021-10-15T09:25:12.000+00:00',
        valueQuantity: { value: 200.0, unit: 'copies/ml' },
        referenceRange: [
          {
            low: { value: 0.0 },
            type: { coding: [{ system: 'http://fhir.openmrs.org/ext/obs/reference-range', code: 'absolute' }] },
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'ef2b4486-a822-4ab2-8a97-07b4063dab48',
        status: 'final',
        code: {
          coding: [
            { code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Weight (kg)' },
            { system: 'http://loinc.org', code: '3141-9', display: 'Weight (kg)' },
          ],
        },
        subject: {
          reference: 'Patient/1119ec72-b545-4408-a314-09648ba6614c',
          type: 'Patient',
          display: 'Michael Johnson (OpenMRS ID: 1009ER)',
        },
        encounter: { reference: 'Encounter/d2955a93-4d9f-4999-9f0d-9ccbb8e0ca6e', type: 'Encounter' },
        effectiveDateTime: '2016-10-31T06:45:39+00:00',
        issued: '2017-01-18T09:10:39.000+00:00',
        valueQuantity: { value: 204.0, unit: 'kg' },
        referenceRange: [
          {
            low: { value: 0.0 },
            high: { value: 250.0 },
            type: { coding: [{ system: 'http://fhir.openmrs.org/ext/obs/reference-range', code: 'absolute' }] },
          },
        ],
      },
    },
    {
      resource: {
        resourceType: 'Observation',
        id: '804eba5a-9626-4eb0-bf1f-8d70b0769107',
        status: 'final',
        code: {
          coding: [
            { code: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Weight (kg)' },
            { system: 'http://loinc.org', code: '3141-9', display: 'Weight (kg)' },
          ],
        },
        subject: {
          reference: 'Patient/1119ec72-b545-4408-a314-09648ba6614c',
          type: 'Patient',
          display: 'Michael Johnson (OpenMRS ID: 1009ER)',
        },
        encounter: { reference: 'Encounter/3a8782a0-42e7-4d5f-b8a8-a66ec4e7babe', type: 'Encounter' },
        effectiveDateTime: '2021-10-15T06:45:39+00:00',
        issued: '2021-10-15T09:25:12.000+00:00',
        valueQuantity: { value: 198.0, unit: 'kg' },
        referenceRange: [
          {
            low: { value: 0.0 },
            high: { value: 250.0 },
            type: { coding: [{ system: 'http://fhir.openmrs.org/ext/obs/reference-range', code: 'absolute' }] },
          },
        ],
      },
    },
  ],
};
