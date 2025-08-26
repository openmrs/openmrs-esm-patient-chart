import { openmrsFetch, useFhirFetchAll } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import React from 'react';

import { mockImmunizationData } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ImmunizationsDetailedSummary from './immunizations-detailed-summary.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
mockOpenmrsFetch.mockImplementation(jest.fn());
const mockUseFhirFetchAll = useFhirFetchAll as jest.Mock;

describe('ImmunizationsDetailedSummary', () => {
  it('renders an empty state view of immunizations data is unavailable', async () => {
    mockUseFhirFetchAll.mockReturnValueOnce({ data: [] });

    renderWithSwr(<ImmunizationsDetailedSummary patientUuid={mockPatient.id} launchStartVisitPrompt={jest.fn()} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /immunizations/i })).toBeInTheDocument();
    expect(screen.getByTitle(/Empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no immunizations to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record immunizations/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching immunization data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockUseFhirFetchAll.mockReturnValue({
      data: null,
      error,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    renderWithSwr(<ImmunizationsDetailedSummary patientUuid={mockPatient.id} launchStartVisitPrompt={jest.fn()} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /immunizations/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders immunizations in a table when data is available', async () => {
    mockUseFhirFetchAll.mockReturnValueOnce({ data: mockImmunizationData });

    renderWithSwr(<ImmunizationsDetailedSummary patientUuid={mockPatient.id} launchStartVisitPrompt={jest.fn()} />);

    await waitForLoadingToFinish();
    expect(screen.getByRole('heading', { name: /immunizations/i })).toBeInTheDocument();
    expect(screen.getByTestId('addImmunizationsButton')).toBeInTheDocument();
    expect(screen.getByText(/vaccine/i)).toBeInTheDocument();
    expect(screen.getByText(/recent vaccination/i)).toBeInTheDocument();
    expect(screen.getByText(/Polio/i)).toBeInTheDocument();
    expect(screen.getByText(/Last dose on 20-Nov-2018, Dose 1/i)).toBeInTheDocument();
  });
});
