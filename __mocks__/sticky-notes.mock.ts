export const mockStickyNotesData = [
  {
    resourceType: 'Observation',
    id: 'cc566b65-65b0-448d-a0a8-eb1214004a8d',
    meta: {
      versionId: '1768909083000',
      lastUpdated: '2026-01-20T11:38:03.000+00:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode',
        },
      ],
    },
    status: 'final',
    code: {
      coding: [
        {
          code: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'General patient note',
        },
        {
          system: 'https://cielterminology.org',
          code: '165095',
        },
      ],
      text: 'General patient note',
    },
    subject: {
      reference: 'Patient/3355bd93-3c83-414d-87b1-c87e608ca85a',
      type: 'Patient',
      display: 'Mark Williams (OpenMRS ID: 100019A)',
    },
    effectiveDateTime: '2026-01-20T11:38:02+00:00',
    issued: '2026-01-20T11:38:03.000+00:00',
    valueString: 'simple notes',
  },
];
