import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePatientLists } from '../patient-lists.resource';
import PatientListsWorkspace from './patient-lists.workspace';

const mockedUsePatientLists = jest.mocked(usePatientLists);

jest.mock('../patient-lists.resource', () => {
  const original = jest.requireActual('../patient-lists.resource');

  return {
    ...original,
    usePatientLists: jest.fn(),
  };
});

it('renders an empty state if patient list data is unavailable', async () => {
  mockedUsePatientLists.mockReturnValue({
    isLoading: false,
    error: null,
    patientLists: [],
  });

  renderPatientListsWorkspace();

  expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
  expect(screen.getByText(/no patient lists to display/i)).toBeInTheDocument();
});

it('renders a tabular overview of the available patient lists', async () => {
  const user = userEvent.setup();

  mockedUsePatientLists.mockReturnValue({
    isLoading: false,
    error: null,
    patientLists: [
      {
        attributes: [],
        description:
          'Cardiovascular Outcomes in Type 2 Diabetes (COTD Study): A Longitudinal Assessment of a New Diabetes Medication',
        id: '4dcb7061-fcad-4542-b219-4c197c117050',
        name: 'COTD Study',
        size: 2,
        startDate: '2023-11-14T23:45:51.000+0000',
        type: 'My List',
      },
    ],
  });

  renderPatientListsWorkspace();

  await screen.findByRole('table');

  const searchbox = screen.getByRole('searchbox');

  const columnHeaders = [/list name/, /list type/, /no\. of patients/];

  columnHeaders.forEach((header) =>
    expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
  );

  expect(screen.getByRole('row', { name: /COTD Study My List 2/i })).toBeInTheDocument();

  await user.type(searchbox, 'Gamma Ray 1 Cohort');

  expect(screen.getByText(/no matching lists to display/i)).toBeInTheDocument();
  expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();

  await user.clear(searchbox);
  await user.type(searchbox, 'COTD');
  expect(screen.getByRole('row', { name: /COTD Study My List 2/i })).toBeInTheDocument();
});

function renderPatientListsWorkspace() {
  render(<PatientListsWorkspace />);
}
