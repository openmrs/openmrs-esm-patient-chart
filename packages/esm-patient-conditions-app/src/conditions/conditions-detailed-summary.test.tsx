import React from 'react';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { attach, fhirBaseUrl, openmrsObservableFetch } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockFhirConditionsResponse } from '../../../../__mocks__/conditions.mock';
import userEvent from '@testing-library/user-event';
import ConditionsDetailedSummary from './conditions-detailed-summary.component';

const mockAttach = attach as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  attach: jest.fn(),
  openmrsObservableFetch: jest.fn(),
}));

jest.mock('./conditions.context', () => ({
  useConditionsContext: jest.fn().mockReturnValue({
    patient: mockPatient,
  }),
}));

function renderConditionsDetailedSummary() {
  render(<ConditionsDetailedSummary />);
}

function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [...screen.queryAllByRole(/progressbar/i)], {
    timeout: 4000,
  });
}

it('renders an empty state view if conditions data is unavailable', async () => {
  mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: [] }).pipe(delay(10)));

  renderConditionsDetailedSummary();

  expect(mockOpenmrsObservableFetch).toHaveBeenCalledTimes(1);
  expect(mockOpenmrsObservableFetch).toHaveBeenCalledWith(
    `${fhirBaseUrl}/Condition?patient.identifier=${mockPatient.identifier[0].value}`,
  );

  await waitForLoadingToFinish();

  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /conditions/i })).toBeInTheDocument();
  expect(screen.getByText(/There are no conditions to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Record conditions/i)).toBeInTheDocument();
});

it('renders an error state view if there is a problem fetching conditions data', () => {
  const error = {
    message: 'You are not logged in',
    response: {
      status: 401,
      statusText: 'Unauthorized',
    },
  };

  mockOpenmrsObservableFetch.mockReturnValueOnce(throwError(error));

  renderConditionsDetailedSummary();

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
  mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: mockFhirConditionsResponse }).pipe(delay(10)));

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
  mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: [] }).pipe(delay(10)));

  renderConditionsDetailedSummary();

  await waitForLoadingToFinish();

  const recordConditionsLink = screen.getByText(/record conditions/i);
  userEvent.click(recordConditionsLink);

  expect(mockAttach).toHaveBeenCalledTimes(1);
  expect(mockAttach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'conditions-form-workspace');
});
