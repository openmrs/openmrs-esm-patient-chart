import React from 'react';
import { launchWorkspace, openmrsFetch, useSession } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ActiveMedications from './active-medications.component';

const mockUseSession = jest.mocked(useSession);
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockLaunchWorkspace = launchWorkspace as jest.Mock;
const mockUseLaunchWorkspaceRequiringVisit = jest.fn().mockImplementation((name) => {
  return () => mockLaunchWorkspace(name);
});
mockUseSession.mockReturnValue(mockSessionDataResponse.data);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useLaunchWorkspaceRequiringVisit: (...args) => mockUseLaunchWorkspaceRequiringVisit(...args),
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

describe('ActiveMedications', () => {
  test('renders an empty state view when there are no active medications to display', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(<ActiveMedications patient={mockPatient} />);

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

    renderWithSwr(<ActiveMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  test('renders a tabular overview of the active medications recorded for a patient', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });

    renderWithSwr(<ActiveMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    const headingElements = screen.getAllByText(/Active Medications/i);

    headingElements.forEach((headingElement) => {
      expect(headingElement).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(screen.getByRole('table')).toBeInTheDocument();

    const expectedColumnHeaders = [/activation date/, /details/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /14-Aug-2023 Admin User Acetaminophen 325 mg — 325mg — tablet DOSE 2 tablet — oral — twice daily — indefinite duration — take it sometimes INDICATION Bad boo-boo/,
      /14-Aug-2023 Admin User Acetaminophen 325 mg — 325mg — tablet 14-Aug-2023 DOSE 2 tablet — oral — twice daily — indefinite duration INDICATION No good 0/,
      /14-Aug-2023 Admin User Sulfacetamide 0.1 — 10% DOSE 1 application — for 1 weeks — REFILLS 1 — apply it INDICATION Pain — QUANTITY 8 Application/,
      /14-Aug-2023 Admin User Aspirin 162.5mg — 162.5mg — tablet DOSE 1 tablet — oral — once daily — for 30 days INDICATION Heart — QUANTITY 30 Tablet/,
    ];

    expectedTableRows.forEach((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
  });
});

test('clicking the Record active medications link opens the order basket form', async () => {
  const user = userEvent.setup();
  mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

  renderWithSwr(<ActiveMedications patient={mockPatient} />);

  await waitForLoadingToFinish();
  const orderLink = screen.getByText('Record active medications');
  await user.click(orderLink);
  expect(mockLaunchWorkspace).toHaveBeenCalledWith('add-drug-order');
});

test('clicking the Add button opens the order basket form', async () => {
  const user = userEvent.setup();
  mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });

  renderWithSwr(<ActiveMedications patient={mockPatient} />);

  await waitForLoadingToFinish();
  const button = screen.getByRole('button', { name: /Add/i });
  await user.click(button);
  expect(mockLaunchWorkspace).toHaveBeenCalledWith('add-drug-order');
});
