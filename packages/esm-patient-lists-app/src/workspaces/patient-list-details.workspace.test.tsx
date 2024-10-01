import React from 'react';
import { screen, render } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import PatientListDetailsWorkspace from './patient-list-details.workspace';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

const defaultProps = {
  patientUuid: '',
  promptBeforeClosing: jest.fn(),
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  list: {
    attributes: [],
    description:
      'Cardiovascular Outcomes in Type 2 Diabetes (COTD Study): A Longitudinal Assessment of a New Diabetes Medication',
    id: '4dcb7061-fcad-4542-b219-4c197c117050',
    name: 'COTD Study',
    size: 2,
    startDate: '2023-11-14T23:45:51.000+0000',
    type: 'My List',
  },
  setTitle: jest.fn(),
};

const mockPatientListData = [
  {
    display: '10000F1-Mary Smith',
    startDate: '2023-11-15T09:03:11.000+0000',
    endDate: null,
    uuid: '25ab658a-22dd-4873-b958-2011142adfd1',
    voided: false,
    patient: {
      uuid: '6005b02a-6c32-4700-afad-1878a31515e2',
      display: '10000F1 - Mary Smith',
      identifiers: [
        {
          display: 'OpenMRS ID = 10000F1',
          uuid: 'deb8e5e0-b8cf-47bb-90ac-a1e1a041a496',
          identifier: '10000F1',
          identifierType: {
            uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
            display: 'OpenMRS ID',
          },
        },
      ],
      person: {
        uuid: '6005b02a-6c32-4700-afad-1878a31515e2',
        display: 'Mary Smith',
        gender: 'F',
        age: 44,
        birthdate: '1979-02-01T00:00:00.000+0000',
      },
    },
    cohort: {
      name: 'COTD Study',
      description:
        'Cardiovascular Outcomes in Type 2 Diabetes (COTD Study): A Longitudinal Assessment of a New Diabetes Medication',
      startDate: '2023-11-14T23:45:51.000+0000',
      endDate: null,
      groupCohort: false,
      uuid: '4dcb7061-fcad-4542-b219-4c197c117050',
      cohortType: {
        uuid: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
        display: 'My List',
      },
    },
    attributes: [],
  },
  {
    display: '10006KH-Rahul Ajay Jawale',
    startDate: '2023-11-15T22:24:11.000+0000',
    endDate: null,
    uuid: '04634dbe-ebe9-41b1-81f3-666e3530cc7c',
    voided: false,
    patient: {
      uuid: '39772438-7097-403e-bfc4-5570817232c6',
      display: '10006KH - Rahul Ajay Jawale',
      identifiers: [
        {
          display: 'OpenMRS ID = 10006KH',
          uuid: 'd4a59173-4218-4f2b-a8d1-c36c0c20c356',
          identifier: '10006KH',
        },
      ],
      person: {
        uuid: '39772438-7097-403e-bfc4-5570817232c6',
        display: 'Rahul Ajay Jawale',
        gender: 'M',
        age: 24,
        birthdate: '1999-10-26T00:00:00.000+0000',
      },
      voided: false,
    },
    cohort: {
      name: 'COTD Study',
      description:
        'Cardiovascular Outcomes in Type 2 Diabetes (COTD Study): A Longitudinal Assessment of a New Diabetes Medication',
      startDate: '2023-11-14T23:45:51.000+0000',
      endDate: null,
      groupCohort: false,
      uuid: '4dcb7061-fcad-4542-b219-4c197c117050',
      cohortType: {
        uuid: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
        display: 'My List',
      },
    },
  },
];

it('renders the patient list details workspace', async () => {
  mockOpenmrsFetch.mockResolvedValue({ data: { results: mockPatientListData } });

  render(<PatientListDetailsWorkspace {...defaultProps} />);

  await screen.findByRole('heading', { name: defaultProps.list.description });

  expect(screen.getByRole('button', { name: /back to patient lists/i })).toBeInTheDocument();
  expect(screen.getByText(/2 patients/i)).toBeInTheDocument();
  expect(screen.getByText(/created on/i)).toBeInTheDocument();
});
