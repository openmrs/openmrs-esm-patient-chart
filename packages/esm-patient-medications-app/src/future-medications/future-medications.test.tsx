import React from 'react';
import { launchWorkspace2, openmrsFetch, useSession } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import FutureMedications from './future-medications.component';

const mockUseSession = jest.mocked(useSession);
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockLaunchWorkspace2 = launchWorkspace2 as jest.Mock;
const mockUseLaunchWorkspaceRequiringVisit = jest.fn().mockImplementation((_, name) => {
  return () => mockLaunchWorkspace2(name);
});
mockUseSession.mockReturnValue(mockSessionDataResponse.data);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

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
    expect(screen.getByRole('heading', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  test('renders a tabular overview of the future medications recorded for a patient', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });
    // .mockReturnValueOnce({data: { results: mockPatientDrugOrdersApiData }})

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

    const expectedTableRows = [
      /14-Aug-2113 Admin User Acetaminophen 325 mg — 325mg — tablet DOSE 2 tablet — oral — twice daily — indefinite duration — take it sometimes INDICATION Bad boo-boo 00 Options/i,
    ];

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
