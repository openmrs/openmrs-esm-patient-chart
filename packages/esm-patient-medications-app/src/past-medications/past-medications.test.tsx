import React from 'react';
import { openmrsFetch, useSession } from '@openmrs/esm-framework';
import { screen, within } from '@testing-library/react';
import { mockPatientDrugOrdersApiData, mockSessionDataResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import PastMedications from './past-medications.component';

const mockUseSession = jest.mocked(useSession);
const mockOpenmrsFetch = openmrsFetch as jest.Mock;

mockUseSession.mockReturnValue(mockSessionDataResponse.data);

describe('PastMedications', () => {
  test('renders an empty state view when there are no past medications to display', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });
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
    expect(screen.getByRole('heading', { name: /past medications/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  test('renders a tabular overview of the past medications recorded for a patient', async () => {
    mockOpenmrsFetch
      .mockReturnValueOnce({
        data: { results: mockPatientDrugOrdersApiData },
      })
      .mockReturnValueOnce({
        data: { results: [] }, // simulate no active orders so all become "past"
      });

    renderWithSwr(<PastMedications patient={mockPatient} />);

    await waitForLoadingToFinish();

    const headingElements = screen.getAllByText(/Past Medications/i);
    headingElements.forEach((headingElement) => {
      expect(headingElement).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const expectedColumnHeaders = [/start date/i, /details/i];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /14-Aug-2023 Admin User Acetaminophen 325 mg — 325mg — tablet DOSE 2 tablet — oral — twice daily — indefinite duration — take it sometimes INDICATION Bad boo-boo/i,
      /14-Aug-2023 Admin User Acetaminophen 325 mg — 325mg — tablet 14-Aug-2023 DOSE 2 tablet — oral — twice daily — indefinite duration INDICATION No good 0/i,
      /14-Aug-2023 Admin User Sulfacetamide 0.1 — 10% DOSE 1 application — for 1 weeks — REFILLS 1 — apply it INDICATION Pain — QUANTITY 8 Application/i,
      /14-Aug-2023 Admin User Aspirin 162.5mg — 162.5mg — tablet DOSE 1 tablet — oral — once daily — for 30 days INDICATION Heart — QUANTITY 30 Tablet/i,
    ];

    expectedTableRows.forEach((row) => {
      expect(within(table).getByRole('row', { name: row })).toBeInTheDocument();
    });
  });
});
