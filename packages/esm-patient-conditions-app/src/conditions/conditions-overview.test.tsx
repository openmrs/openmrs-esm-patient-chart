import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { type FetchResponse, getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import { mockFhirConditionsResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ConditionsOverview from './conditions-overview.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockOpenmrsFetch = jest.mocked(openmrsFetch);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: jest.fn(),
}));

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  conditionPageSize: 5,
});

describe('ConditionsOverview', () => {
  it('renders an empty state view if conditions data is unavailable', async () => {
    mockOpenmrsFetch.mockResolvedValueOnce({ data: [] } as FetchResponse);

    renderWithSwr(<ConditionsOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
    expect(screen.getByTitle(/Empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no conditions to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record conditions/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching conditions', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderWithSwr(<ConditionsOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information./i)).toBeInTheDocument();
  });

  it("renders an overview of the patient's conditions when present", async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValueOnce({ data: mockFhirConditionsResponse } as FetchResponse);

    renderWithSwr(<ConditionsOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/condition/, /date of onset/, /status/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [/hiv positive/, /malaria, confirmed/, /malaria sevère/, /anaemia/, /hypertension/];
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });

    expect(screen.getAllByRole('row').length).toEqual(6);
    expect(screen.getByText(/1–5 of 7 items/i)).toBeInTheDocument();

    const nextPageButton = screen.getByRole('button', { name: /next page/i });

    await user.click(nextPageButton);

    expect(screen.getAllByRole('row').length).toEqual(3);
  });

  it('clicking the Add button or Record Conditions link launches the conditions form', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValueOnce({ data: [] } as FetchResponse);

    renderWithSwr(<ConditionsOverview patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    const recordConditionsLink = screen.getByText(/record conditions/i);

    await user.click(recordConditionsLink);

    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('conditions-form-workspace', { formContext: 'creating' });
  });
});
