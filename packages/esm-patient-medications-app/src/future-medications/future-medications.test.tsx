import React from 'react';
import { vi, describe, expect, test, type Mock } from 'vitest';
import { launchWorkspace2, openmrsFetch, useSession } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import FutureMedications from './future-medications.component';

const mockUseSession = vi.mocked(useSession);
const mockOpenmrsFetch = openmrsFetch as Mock;
const mockLaunchWorkspace2 = launchWorkspace2 as Mock;
const mockUseLaunchWorkspaceRequiringVisit = vi.fn().mockImplementation((_, name) => {
  return () => mockLaunchWorkspace2(name);
});
mockUseSession.mockReturnValue(mockSessionDataResponse.data);

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-patient-common-lib')) as object;

  return {
    ...originalModule,
    useLaunchWorkspaceRequiringVisit: (...args) => mockUseLaunchWorkspaceRequiringVisit(...args),
  };
});

describe('FutureMedications', () => {
  test('renders an empty state view when there are no future medications to display', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(<FutureMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /future medications/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no future medications to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record future medications/i)).toBeInTheDocument();
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

    renderWithSwr(<FutureMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(ErrorState).toHaveBeenCalledWith(expect.objectContaining({ error, headerTitle: 'Future medications' }), {});
  });

  // TODO: Re-enable. Carbon DataTable renders columns differently under jsdom +
  // @testing-library/react@16, so the row/column assertions below no longer find
  // the expected cells. Needs the query to switch from cell-text matching to
  // role-based DataTable column queries.
  test.skip('renders a tabular overview of the future medications recorded for a patient', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });

    renderWithSwr(<FutureMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    const headingElements = screen.getAllByText(/Future Medications/i);

    headingElements.forEach((headingElement) => {
      expect(headingElement).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(screen.getByRole('table')).toBeInTheDocument();

    const expectedColumnHeaders = [/start date/, /details/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [];

    expectedTableRows.forEach((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
  });
});

test('clicking the Record future medications link opens the order basket form', async () => {
  const user = userEvent.setup();
  mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

  renderWithSwr(<FutureMedications patient={mockPatient} />);

  await waitForLoadingToFinish();
  const orderLink = screen.getByText(/Record future medications/i);
  await user.click(orderLink);
  expect(mockLaunchWorkspace2).toHaveBeenCalledWith('order-basket');
});

test('clicking the Add button opens the order basket form', async () => {
  const user = userEvent.setup();
  mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });

  renderWithSwr(<FutureMedications patient={mockPatient} />);

  await waitForLoadingToFinish();
  const button = screen.getByRole('button', { name: /Add/i });
  await user.click(button);
  expect(mockLaunchWorkspace2).toHaveBeenCalledWith('order-basket');
});
