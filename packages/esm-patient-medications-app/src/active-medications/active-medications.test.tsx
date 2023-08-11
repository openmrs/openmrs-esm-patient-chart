import React from 'react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { fireEvent, screen, within } from '@testing-library/react';
import { mockDrugOrders } from '../__mocks__/medication.mock';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import ActiveMedications from './active-medications.component';

const testProps = {
  patientUuid: mockPatient.id,
};

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useWorkspaces: jest.fn(() => {
      return { workspaces: [{ name: 'order-basket' }] };
    }),
    useVisitOrOfflineVisit: jest.fn(() => ({
      currentVisit: {
        uuid: '8ef90c91-14be-42dd-a1c0-e67fbf904470',
      },
    })),
  };
});

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
      /09-Sept-2021 -- Aspirin — 81mg — tablet DOSE 1 tablet — oral — once daily — indefinite duration/,
      /09-Sept-2021 -- Efavirenz — 600mg — tablet DOSE 1 tablet — oral — once daily — indefinite duration/,
    ];

    expectedTableRows.map((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
  });
});

test('clicking the Record active medications link or the Add button opens the order basket form', async () => {
  mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });
  renderActiveMedications();
  await waitForLoadingToFinish();
  const orderLink = await screen.getByText('Record active medications');
  fireEvent.click(orderLink);
  expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket');

  mockOpenmrsFetch.mockReturnValueOnce(mockDrugOrders);
  renderActiveMedications();
  await waitForLoadingToFinish();
  const button = await screen.getByRole('button', { name: /Add/i });
  fireEvent.click(button);
  expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket');
});

function renderActiveMedications() {
  renderWithSwr(<ActiveMedications {...testProps} />);
}
