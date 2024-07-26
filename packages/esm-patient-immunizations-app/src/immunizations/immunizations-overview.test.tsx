import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockPatientImmunizationsSearchResponse } from '__mocks__';
import { mockPatient, patientChartBasePath, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ImmunizationsOverview from './immunizations-overview.component';

const testProps = {
  basePath: patientChartBasePath,
  patient: mockPatient,
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('ImmunizationOverview', () => {
  it('renders an empty state view of immunizations data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });

    renderImmunizationsOverview();

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

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderImmunizationsOverview();

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

  it('renders a tabular overview of recently administered immunizations if available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockPatientImmunizationsSearchResponse });

    renderImmunizationsOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /immunizations/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/recent vaccination/, /vaccination date/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [/rotavirus sept 2018/, /polio nov 2018/, /influenza may 2018/];
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });

    expect(screen.getAllByRole('row').length).toEqual(4);
    expect(screen.getByText(/1–3 of 3 items/i)).toBeInTheDocument();
  });
});

function renderImmunizationsOverview() {
  renderWithSwr(<ImmunizationsOverview {...testProps} />);
}
