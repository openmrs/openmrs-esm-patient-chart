import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { attach, openmrsFetch } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockFhirConditionsResponse } from '../../../../__mocks__/conditions.mock';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import ConditionsDetailedSummary from './conditions-detailed-summary.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

it('renders an empty state view if conditions data is unavailable', async () => {
  mockOpenmrsFetch.mockReturnValueOnce({ data: [] });

  renderConditionsDetailedSummary();

  await waitForLoadingToFinish();

  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
  expect(screen.getByTitle(/Empty data illustration/i)).toBeInTheDocument();
  expect(screen.getByText(/There are no conditions to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Record conditions/i)).toBeInTheDocument();
});

it('renders an error state view if there is a problem fetching conditions data', async () => {
  const error = {
    message: 'You are not logged in',
    response: {
      status: 401,
      statusText: 'Unauthorized',
    },
  };

  mockOpenmrsFetch.mockRejectedValueOnce(error);

  renderConditionsDetailedSummary();

  await waitForLoadingToFinish();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
  expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
  expect(
    screen.getByText(
      /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
    ),
  ).toBeInTheDocument();
});

it("renders a detailed summary of the patient's conditions when present", async () => {
  mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirConditionsResponse });
  renderConditionsDetailedSummary();

  await waitForLoadingToFinish();

  expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

  const expectedColumnHeaders = [/condition/, /since/, /status/];
  expectedColumnHeaders.forEach((header) => {
    expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
  });

  const expectedTableRows = [/hiv positive/, /malaria, confirmed/, /Malaria sevère/, /anaemia/];
  expectedTableRows.forEach((row) => {
    expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
  });
  expect(screen.getAllByRole('row').length).toEqual(9);
});

it('clicking the Add button or Record Conditions link launches the conditions form', async () => {
  const user = userEvent.setup();

  mockOpenmrsFetch.mockReturnValueOnce({ data: [] });

  renderConditionsDetailedSummary();

  await waitForLoadingToFinish();

  const recordConditionsLink = screen.getByText(/record conditions/i);

  await waitFor(() => user.click(recordConditionsLink));

  expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
  expect(launchPatientWorkspace).toHaveBeenCalledWith('conditions-form-workspace');
});

function renderConditionsDetailedSummary() {
  const testProps = { patient: mockPatient };

  renderWithSwr(<ConditionsDetailedSummary {...testProps} />);
}
