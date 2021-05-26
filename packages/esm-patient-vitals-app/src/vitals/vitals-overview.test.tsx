import React from 'react';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsObservableFetch } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockFhirVitalsResponse } from '../../../../__mocks__/vitals.mock';
import VitalsOverview from './vitals-overview.component';

const mockVitalsConfig = {
  concepts: {
    systolicBloodPressureUuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    diastolicBloodPressureUuid: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    pulseUuid: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    temperatureUuid: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    oxygenSaturationUuid: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    respiratoryRateUuid: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};

const testProps = {
  patientUuid: mockPatient.id,
  showAddVitals: false,
};

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(() => mockVitalsConfig),
}));

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

mockOpenmrsObservableFetch.mockImplementation(jest.fn());

const renderVitalsOverview = () => render(<VitalsOverview {...testProps} />);

it('renders an empty state view if vitals data is unavailable', () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: [] }));

  renderVitalsOverview();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
  expect(screen.getByText(/There are no vital signs to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Record vital signs/i)).toBeInTheDocument();
});

it('renders an error state view if there is a problem fetching allergies data', () => {
  const error = {
    message: 'You are not logged in',
    response: {
      status: 401,
      statusText: 'Unauthorized',
    },
  };
  mockOpenmrsObservableFetch.mockReturnValue(throwError(error));

  renderVitalsOverview();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
  expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
  expect(
    screen.getByText(
      /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
    ),
  ).toBeInTheDocument();
});

it("renders an overview of the patient's vital signs", async () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: mockFhirVitalsResponse }));

  renderVitalsOverview();

  await screen.findByRole('heading', { name: /vitals/i });
  expect(screen.getByRole('button', { name: /table view/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /chart view/i })).toBeInTheDocument();

  const expectedColumnHeaders = [/date/, /bp/, /r. rate/, /pulse/, /spO2/, /temp/];

  expectedColumnHeaders.map((header) =>
    expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument(),
  );

  const expectedTableRows = [
    /19 - May - 2021 121 \/ 121 12 76 37/,
    /10 - May - 2021 120 \/ 120 45 66 90 37/,
    /07 - May - 2021 120 \/ 120/,
  ];

  expectedTableRows.map((row) => expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument());
});

it('can toggle between rendering either a table view or a chart view', () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: mockFhirVitalsResponse }));

  renderVitalsOverview();

  const chartViewButton = screen.getByRole('button', {
    name: /chart view/i,
  });

  userEvent.click(chartViewButton);
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByText(/vital sign displayed/i)).toBeInTheDocument();
  expect(screen.getAllByRole('radio').length).toEqual(5);
  expect(screen.getByRole('radio', { name: /bp/i })).toBeChecked();

  const tableViewButton = screen.getByRole('button', {
    name: /table view/i,
  });

  userEvent.click(tableViewButton);
  expect(screen.queryByText(/vital sign displayed/i)).not.toBeInTheDocument();
  expect(screen.getByRole('table')).toBeInTheDocument();
});
