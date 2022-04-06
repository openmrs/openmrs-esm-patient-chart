import React from 'react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockDrugOrders } from '../../../../__mocks__/medication.mock';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import ActiveMedications from './active-medications.component';

const testProps = {
  patientUuid: mockPatient.id,
  showAddMedications: true,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('ActiveMedications: ', () => {
  test('renders an empty state view when there are no active medications to display', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderActiveMedications();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /active medications/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no active medications to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record active medications/i)).toBeInTheDocument();
  });

  test('renders an error state view if there is a problem fetching medications data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderActiveMedications();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  test('renders a tabular overview of the active medications recorded for a patient', async () => {
    mockOpenmrsFetch.mockReturnValueOnce(mockDrugOrders);

    renderActiveMedications();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /active medications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(screen.getByRole('table')).toBeInTheDocument();

    const expectedColumnHeaders = [/start date/, /details/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /09-Sept-2021 -- Aspirin — 81mg — tablet DOSE 81 mg — oral — once daily — indefinite duration/,
      /09-Sept-2021 -- Efavirenz — 600mg — tablet DOSE 600 mg — oral — once daily — indefinite duration/,
    ];

    expectedTableRows.map((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
  });
});

function renderActiveMedications() {
  renderWithSwr(<ActiveMedications {...testProps} />);
}
