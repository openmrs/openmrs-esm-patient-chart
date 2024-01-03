export const mockPatientFlags = [
  {
    uuid: '8ca6c08f-66d9-4a18-a233-4f658b1755bf',
    flag: { display: 'Needs Follow Up' },
    message: 'Patient needs to be followed up',
    tags: [{ display: 'flag tag - risk' }, { display: 'flag type - Social' }],
  },
  {
    uuid: '5fs6c08f-66d9-4a18-a233-5f658b1755bf',
    flag: { display: 'Unknown Diagnosis' },
    message: 'Diagnosis for the patient is unknown',
    tags: [{ display: 'flag tag - info' }, { display: 'flag type - Clinical' }],
  },
  {
    uuid: '4da4c08f-66d9-4a18-a233-5f658b1755bf',
    flag: { display: 'Future Appointment' },
    message: 'Patient has a future appointment scheduled',
    tags: [{ display: 'flag tag - info' }, { display: 'flag type - Clinical' }],
  },
];
