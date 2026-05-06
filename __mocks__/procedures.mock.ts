const patientUuid = '8673ee4f-e2ab-4077-ba55-4980f408773e';

export const searchedProcedure = [{ uuid: 'proc-concept-uuid-1', display: 'Appendectomy' }];

export const mockProcedureTypes = [
  { uuid: 'pt-uuid-1', name: 'Surgery' },
  { uuid: 'pt-uuid-2', name: 'Endoscopy' },
];

const makeProcedure = (overrides: object) => ({
  procedureNonCoded: '',
  estimatedStartDate: null,
  endDateTime: null,
  duration: null,
  durationUnit: null,
  outcomeCoded: null,
  outcomeNonCoded: null,
  notes: '',
  formNamespaceAndPath: '',
  voided: false,
  patient: { uuid: patientUuid, display: 'Test Patient' },
  ...overrides,
});

export const mockProceduresResponse = {
  results: [
    makeProcedure({
      uuid: 'proc-uuid-1',
      display: 'Appendectomy',
      procedureType: { uuid: 'pt-uuid-1', name: 'Surgery' },
      procedureCoded: { uuid: 'proc-concept-uuid-1', display: 'Appendectomy' },
      bodySite: { uuid: 'body-site-uuid-1', display: 'Abdomen' },
      startDateTime: '2021-08-01T00:00:00.000+0000',
      endDateTime: '2021-08-01T02:00:00.000+0000',
      duration: 45,
      durationUnit: { uuid: 'duration-unit-uuid-1', display: 'Minutes' },
      status: { uuid: 'status-uuid-1', display: 'Completed' },
      notes: 'Procedure went well',
    }),
    makeProcedure({
      uuid: 'proc-uuid-2',
      display: 'Colonoscopy',
      procedureType: { uuid: 'pt-uuid-2', name: 'Endoscopy' },
      procedureCoded: { uuid: 'proc-concept-uuid-2', display: 'Colonoscopy' },
      bodySite: { uuid: 'body-site-uuid-2', display: 'Colon' },
      startDateTime: '2021-09-01T00:00:00.000+0000',
      endDateTime: '2021-09-01T01:00:00.000+0000',
      status: { uuid: 'status-uuid-1', display: 'Completed' },
    }),
    makeProcedure({
      uuid: 'proc-uuid-3',
      display: 'Blood draw',
      procedureType: { uuid: 'pt-uuid-1', name: 'Surgery' },
      procedureCoded: { uuid: 'proc-concept-uuid-3', display: 'Blood draw' },
      bodySite: { uuid: 'body-site-uuid-3', display: 'Arm' },
      startDateTime: '2021-10-01T00:00:00.000+0000',
      status: { uuid: 'status-uuid-2', display: 'In progress' },
    }),
    makeProcedure({
      uuid: 'proc-uuid-4',
      display: 'Chest x-ray',
      procedureType: { uuid: 'pt-uuid-2', name: 'Endoscopy' },
      procedureCoded: { uuid: 'proc-concept-uuid-4', display: 'Chest x-ray' },
      bodySite: { uuid: 'body-site-uuid-4', display: 'Chest' },
      startDateTime: '2021-11-01T00:00:00.000+0000',
      status: { uuid: 'status-uuid-1', display: 'Completed' },
    }),
    makeProcedure({
      uuid: 'proc-uuid-5',
      display: 'ECG',
      procedureType: { uuid: 'pt-uuid-1', name: 'Surgery' },
      procedureCoded: { uuid: 'proc-concept-uuid-5', display: 'ECG' },
      bodySite: { uuid: 'body-site-uuid-5', display: 'Heart' },
      startDateTime: '2021-12-01T00:00:00.000+0000',
      status: { uuid: 'status-uuid-1', display: 'Completed' },
    }),
    makeProcedure({
      uuid: 'proc-uuid-6',
      display: 'MRI brain',
      procedureType: { uuid: 'pt-uuid-2', name: 'Endoscopy' },
      procedureCoded: { uuid: 'proc-concept-uuid-6', display: 'MRI brain' },
      bodySite: { uuid: 'body-site-uuid-6', display: 'Brain' },
      startDateTime: '2022-01-01T00:00:00.000+0000',
      status: { uuid: 'status-uuid-1', display: 'Completed' },
    }),
  ],
  links: [],
};
