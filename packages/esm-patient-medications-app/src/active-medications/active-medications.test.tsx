import React from 'react';
import { launchWorkspace, openmrsFetch, useSession } from '@openmrs/esm-framework';
import { fireEvent, screen, within } from '@testing-library/react';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ActiveMedications from './active-medications.component';

function renderActiveMedications() {
  mockUseSession.mockReturnValue(mockSessionDataResponse.data);
  renderWithSwr(<ActiveMedications {...testProps} />);
}

const testProps = {
  patientUuid: mockPatient.id,
};
const mockUseSession = useSession as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;

const mockLaunchWorkspace = launchWorkspace as jest.Mock;
const mockUseLaunchWorkspaceRequiringVisit = jest.fn().mockImplementation((name) => {
  return () => mockLaunchWorkspace(name);
});

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

describe('ActiveMedications: ', () => {
  beforeEach(() => {
    mockLaunchWorkspace.mockClear();
  });
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
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });

    renderActiveMedications();

    await waitForLoadingToFinish();

    const headingElements = screen.getAllByText(/Active Medications/i);

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
      /14-Aug-2023 Admin User Acetaminophen 325 mg — 325mg — tablet DOSE 2 tablet — oral — twice daily — indefinite duration — take it sometimes INDICATION Bad boo-boo/,
      /14-Aug-2023 Admin User Acetaminophen 325 mg — 325mg — tablet DOSE 2 tablet — oral — twice daily — indefinite duration INDICATION No good 0 — END DATE 14-Aug-2023 — DISCONTINUED/,
      /14-Aug-2023 Admin User Sulfacetamide 0.1 — 10% DOSE 1 application — for {{duration}} weeks — REFILLS 1 — apply it INDICATION Pain — QUANTITY 8 Application/,
      /14-Aug-2023 Admin User Aspirin 162.5mg — 162.5mg — tablet DOSE 1 tablet — oral — once daily — for {{duration}} days INDICATION Heart — QUANTITY 30 Tablet/,
    ];

    expectedTableRows.map((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );
  });
});

test('clicking the Record active medications link opens the order basket form', async () => {
  mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });
  renderActiveMedications();
  await waitForLoadingToFinish();
  const orderLink = screen.getByText('Record active medications');
  fireEvent.click(orderLink);
  expect(mockLaunchWorkspace).toHaveBeenCalledWith('add-drug-order');
});

test('clicking the Add button opens the order basket form', async () => {
  mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });
  renderActiveMedications();
  await waitForLoadingToFinish();
  const button = screen.getByRole('button', { name: /Add/i });
  fireEvent.click(button);
  expect(mockLaunchWorkspace).toHaveBeenCalledWith('add-drug-order');
});
