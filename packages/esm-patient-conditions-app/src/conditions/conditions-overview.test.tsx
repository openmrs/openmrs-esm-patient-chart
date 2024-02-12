import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, useConfig, usePagination } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

import { mockConditions, mockFhirConditionsResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import ConditionsOverview from './conditions-overview.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockedUseConfig = useConfig as jest.Mock;
const mockedOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('ConditionsOverview: ', () => {
  beforeEach(() => {
    mockedOpenmrsFetch.mockClear();
    mockedUseConfig.mockReturnValue({ conditionPageSize: 5 });
  });

  it('renders an empty state view if conditions data is unavailable', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: [] });

    renderConditionsOverview();

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

    mockedOpenmrsFetch.mockRejectedValueOnce(error);

    renderConditionsOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, there was a problem displaying this information./i)).toBeInTheDocument();
  });

  it("renders an overview of the patient's conditions when present", async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({ data: mockFhirConditionsResponse });
    mockedUsePagination.mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockConditions,
    }));

    renderConditionsOverview();

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

    expect(screen.getAllByRole('row').length).toEqual(6);
  });

  it('clicking the Add button or Record Conditions link launches the conditions form', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({ data: [] });

    renderConditionsOverview();

    await waitForLoadingToFinish();

    const recordConditionsLink = screen.getByText(/record conditions/i);

    await user.click(recordConditionsLink);

    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('conditions-form-workspace', {
      workspaceTitle: 'Record a Condition',
    });
  });
});

function renderConditionsOverview() {
  renderWithSwr(<ConditionsOverview {...testProps} />);
}
