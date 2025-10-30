export const mockPatientFlags = [
  {
    auditInfo: { dateCreated: '2024-03-01T00:00:00.000Z' },
    flag: { display: 'Needs Follow Up', uuid: '98ca6c08f-66d9-4a18-a233-4f658b1755bf' },
    message: 'Patient needs to be followed up',
    patient: {
      uuid: '8ca6c08f-66d9-4a18-a233-4f658b1755bf',
      display: 'John Doe',
    },
    tags: [
      { display: 'flag tag - risk', uuid: 'some-uuid' },
      { display: 'flag type - Social', uuid: 'some-other-uuid' },
    ],
    uuid: '8ca6c08f-66d9-4a18-a233-4f658b1755bf',
    voided: false,
    flagWithPriority: {
      uuid: '98ca6c08f-66d9-4a18-a233-4f658b1755bf',
      display: 'Needs Follow Up',
      priority: {
        name: 'Risk',
        uuid: 'priority-uuid-1',
      },
    },
  },
  {
    auditInfo: { dateCreated: '2024-03-01T00:00:00.000Z' },
    flag: { display: 'Unknown Diagnosis', uuid: 'a4a4c08f-66d9-4a18-a233-5f658b1755bf' },
    message: 'Diagnosis for the patient is unknown',
    patient: {
      uuid: '8ca6c08f-66d9-4a18-a233-4f658b1755bf',
      display: 'John Doe',
    },
    tags: [
      { display: 'flag tag - info', uuid: 'another-uuid' },
      { display: 'flag type - Clinical', uuid: 'yet-another-uuid' },
    ],
    uuid: '5fs6c08f-66d9-4a18-a233-5f658b1755bf',
    voided: false,
    flagWithPriority: {
      uuid: 'a4a4c08f-66d9-4a18-a233-5f658b1755bf',
      display: 'Unknown Diagnosis',
      priority: {
        name: 'Risk',
        uuid: 'priority-uuid-2',
      },
    },
  },
  {
    auditInfo: { dateCreated: '2024-03-01T00:00:00.000Z' },
    flag: { display: 'Future Appointment', uuid: 'cc6c08f-66d9-4a18-a233-5f658b1755bf' },
    message: 'Patient has a future appointment scheduled',
    patient: {
      uuid: '8ca6c08f-66d9-4a18-a233-4f658b1755bf',
      display: 'John Doe',
    },
    tags: [
      { display: 'flag tag - info', uuid: 'one-more-uuid' },
      { display: 'flag type - Clinical', uuid: 'yet-one-more-uuid' },
    ],
    uuid: '4da4c08f-66d9-4a18-a233-5f658b1755bf',
    voided: false,
    flagWithPriority: {
      uuid: 'cc6c08f-66d9-4a18-a233-5f658b1755bf',
      display: 'Future Appointment',
      priority: {
        name: 'Info',
        uuid: 'priority-uuid-3',
      },
    },
  },
];
