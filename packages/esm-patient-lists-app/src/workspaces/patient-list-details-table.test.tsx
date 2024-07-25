import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientListDetailsTable from './patient-list-details-table.component';

const defaultProps = {
  listMembers: [],
  isLoading: false,
};

it('renders an empty state if there are no patients in the list', () => {
  renderPatientListDetailsTable();

  expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
  expect(screen.getByText(/no patients in this list/i)).toBeInTheDocument();
});

it('renders a tabular overview of the patients enrolled in a list', async () => {
  const user = userEvent.setup();

  renderPatientListDetailsTable({
    listMembers: [
      {
        identifier: '10006KH',
        membershipUuid: '04634dbe-ebe9-41b1-81f3-666e3530cc7c',
        name: 'Rahul Ajay Jawale',
        sex: 'M',
        startDate: '16-Nov-2023',
        patientUuid: '39772438-7097-403e-bfc4-5570817232c6',
      },
    ],
  });

  const columnHeaders = [/name/, /identifier/, /sex/, /start date/];

  columnHeaders.forEach((header) => {
    expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
  });

  const searchbox = screen.getByRole('searchbox');

  expect(screen.getByRole('row', { name: /Rahul Ajay Jawale 10006KH M 16-Nov-2023/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /rahul ajay jawale/i })).toBeInTheDocument();

  await user.type(searchbox, 'Jane Doe');

  expect(screen.getByText(/no matching patients to display/i)).toBeInTheDocument();
  expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();

  await user.clear(searchbox);
  await user.type(searchbox, 'Rahul');
  expect(screen.getByRole('link', { name: /rahul ajay jawale/i })).toBeInTheDocument();
});

function renderPatientListDetailsTable(props = {}) {
  render(<PatientListDetailsTable {...defaultProps} {...props} />);
}
