import {
  CompletedFormInfo,
  Form,
  FormsSection,
  EncounterWithFormRef,
} from '@openmrs/esm-forms-dashboard-app/src/types';

const form = (name: string): Form => {
  let simplifiedName = name.replace(' ', '');
  return {
    uuid: simplifiedName + 'Uuid',
    encounterType: {
      uuid: simplifiedName + 'EncounterTypeUuid',
      name: name + ' Encounter Type',
      viewPrivilege: { uuid: simplifiedName + 'PrivilegeViewUuid', name: name + ' Privilege View' },
      editPrivilege: { uuid: simplifiedName + 'PrivilegeEditUuid', name: name + ' Privilege Edit' },
    },
    name: name,
    display: 'Display ' + name,
    version: '1.0',
    published: true,
    retired: false,
    resources: [],
  };
};

const encounterWithFormRef = (name: string): EncounterWithFormRef => {
  let simplifiedName = name.replace(' ', '');
  return {
    uuid: simplifiedName + 'EncounterWithFormRefUuid',
    encounterType: {
      uuid: simplifiedName + 'EncounterTypeUuid',
      name: name + ' Encounter Type',
      viewPrivilege: { uuid: simplifiedName + 'PrivilegeViewUuid', name: name + ' Privilege View' },
      editPrivilege: { uuid: simplifiedName + 'PrivilegeEditUuid', name: name + ' Privilege Edit' },
    },
    encounterDatetime: '2022-01-01T10:00:00.000+00:00',
  };
};

const completedFormInfo = (name: string, date: string): CompletedFormInfo => {
  return {
    form: form(name),
    associatedEncounters: [encounterWithFormRef(name)],
    lastCompleted: date ? new Date(date) : undefined,
  };
};

export const mockFormsSection: FormsSection = {
  name: 'Section Name',
  labelCode: 'sectionName',
  completedFromsInfo: [
    completedFormInfo('Form 1', undefined),
    completedFormInfo('Form 2', undefined),
    completedFormInfo('Form 3', '2022-01-01T10:00:00.000+00:00'),
  ],
};
