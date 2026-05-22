import React from 'react';
import { vi, describe, expect, test, type Mock } from 'vitest';
import { launchWorkspace2, openmrsFetch, useSession } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Order } from '@openmrs/esm-patient-common-lib';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { bucketMedicationOrders } from '../api';
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
  test('renders an empty state view when there are no upcoming medications to display', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(<FutureMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /upcoming medications/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no upcoming medications to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record upcoming medications/i)).toBeInTheDocument();
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
    expect(ErrorState).toHaveBeenCalledWith(
      expect.objectContaining({ error, headerTitle: 'Upcoming medications' }),
      {},
    );
  });
  test('renders a row for each future-scheduled medication order', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });

    renderWithSwr(<FutureMedications patient={mockPatient} />);

    // Carbon's DataTable renders both a primary table and a sticky-header table;
    // grab the primary one, which carries the data rows.
    const [table] = await screen.findAllByRole('table');

    const { futureOrders } = bucketMedicationOrders(mockPatientDrugOrdersApiData as unknown as Order[]);

    // The fixture must include at least one future-scheduled order for this assertion to be meaningful.
    expect(futureOrders.length).toBeGreaterThan(0);
    // Header row + one row per future-scheduled order.
    expect(within(table).getAllByRole('row')).toHaveLength(futureOrders.length + 1);
  });

  test('clicking the Record upcoming medications link opens the order basket form', async () => {
    const user = userEvent.setup();
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(<FutureMedications patient={mockPatient} />);

    await waitForLoadingToFinish();
    const orderLink = screen.getByText(/Record upcoming medications/i);
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
});
