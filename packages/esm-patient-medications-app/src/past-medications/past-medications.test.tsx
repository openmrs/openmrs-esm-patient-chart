import React from 'react';
import { vi, describe, it, expect, test, type Mock } from 'vitest';
import { openmrsFetch, useSession } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { screen, within } from '@testing-library/react';
import type { Order } from '@openmrs/esm-patient-common-lib';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { bucketMedicationOrders } from '../api';
import PastMedications from './past-medications.component';

const mockUseSession = vi.mocked(useSession);
const mockOpenmrsFetch = openmrsFetch as Mock;
const mockUseLaunchWorkspaceRequiringVisit = vi.fn().mockReturnValue(() => {});

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-patient-common-lib')) as object;

  return {
    ...originalModule,
    useLaunchWorkspaceRequiringVisit: (...args: unknown[]) => mockUseLaunchWorkspaceRequiringVisit(...args),
  };
});

mockUseSession.mockReturnValue(mockSessionDataResponse.data);

describe('PastMedications', () => {
  test('renders an empty state view when there are no past medications to display', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(<PastMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /past medications/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no past medications to display for this patient/i)).toBeInTheDocument();
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

    renderWithSwr(<PastMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(ErrorState).toHaveBeenCalledWith(expect.objectContaining({ error, headerTitle: 'Past medications' }), {});
  });

  test('renders a row for each past medication order', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockPatientDrugOrdersApiData } });

    renderWithSwr(<PastMedications patient={mockPatient} />);

    // Carbon's DataTable renders both a primary table and a sticky-header table;
    // grab the primary one, which carries the data rows.
    const [table] = await screen.findAllByRole('table');

    const { pastOrders } = bucketMedicationOrders(mockPatientDrugOrdersApiData as unknown as Order[]);

    // The fixture must include at least one past order for this assertion to be meaningful.
    expect(pastOrders.length).toBeGreaterThan(0);
    expect(within(table).getAllByRole('row')).toHaveLength(pastOrders.length + 1);
  });
});
